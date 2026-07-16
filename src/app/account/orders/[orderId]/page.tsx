'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { WCAddress } from '@/types/woocommerce';
import { CopyableText } from '@/components/ui/copyable-text';
import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/FormError';
import { BankTransferInstructions } from '@/components/checkout/BankTransferInstructions';
import { formatPrice } from '@/lib/currency/config';

const STATUS_COLORS: Record<string, string> = {
  'DELIVERED': 'text-green-600',
  'ON PROCESS': 'text-blue-600',
  'WITH DELIVERY COURIER': 'text-blue-600',
  'RETURNED': 'text-red-600',
  'ON HOLD': 'text-orange-600',
};

interface TrackingHistoryItem {
  date: string;
  desc: string;
  code: string;
}

interface TrackingData {
  pod_status: string;
  last_status: string;
  cnote_date: string;
  estimate_delivery: string;
  history: TrackingHistoryItem[];
}

interface OrderItem {
  id: number;
  name: string;
  product_id: number;
  quantity: number;
  total: string;
  price: string;
  image?: { src: string };
}

interface ShippingLine {
  method_title: string;
  total: string;
}

interface OrderDetail {
  id: number;
  number: string;
  status: string;
  date_created: string;
  total: string;
  currency: string;
  shipping_total: string;
  line_items: OrderItem[];
  shipping_lines: ShippingLine[];
  fee_lines: Array<{ name: string; total: string }>;
  billing: WCAddress;
  shipping: WCAddress;
  payment_method: string;
  payment_method_title: string;
  tracking_number: string | null;
  pickup_date: string | null;
  unique_code: string | null;
  transfer_amount: string | null;
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  'pending':    { label: 'PENDING PAYMENT', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  'on-hold':    { label: 'ON HOLD', color: 'bg-orange-100 text-orange-800 border-orange-300' },
  'processing': { label: 'PROCESSING', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  'completed':  { label: 'COMPLETED', color: 'bg-green-100 text-green-800 border-green-300' },
  'cancelled':  { label: 'CANCELLED', color: 'bg-red-100 text-red-800 border-red-300' },
  'refunded':   { label: 'REFUNDED', color: 'bg-gray-100 text-gray-800 border-gray-300' },
};

export default function OrderDetailPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = use(params);
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedTracking, setCopiedTracking] = useState(false);
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState<string | null>(null);
  const [historyExpanded, setHistoryExpanded] = useState(false);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const response = await fetch(`/api/account/orders/${orderId}`, {
          credentials: 'same-origin',
        });

        if (response.status === 401) {
          window.location.href = '/account/login?expired=true';
          return;
        }

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Failed to load order. Please try again.');
          return;
        }

        setOrder(data);
      } catch {
        setError('Failed to load order. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [orderId]);

  useEffect(() => {
    const trackingNumber = order?.tracking_number;
    if (!trackingNumber) return;

    async function fetchTracking() {
      setTrackingLoading(true);
      setTrackingError(null);
      try {
        const response = await fetch('/api/shipping/jne/tracking', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ cnote_no: trackingNumber }),
        });

        if (!response.ok) {
          throw new Error('Waiting Pick Up by Courier / Menunggu Kurir Pick Up Pesanan Anda.');
        }

        const data = await response.json();
        setTrackingData(data);
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : 'Waiting Pick Up by Courier / Menunggu Kurir Pick Up Pesanan Anda.';
        setTrackingError(errMsg);
      } finally {
        setTrackingLoading(false);
      }
    }
    fetchTracking();
  }, [order?.tracking_number]);

  const handleCopyTracking = async () => {
    if (!order?.tracking_number) return;
    try {
      await navigator.clipboard.writeText(order.tracking_number);
      setCopiedTracking(true);
      setTimeout(() => setCopiedTracking(false), 2000);
    } catch (err) {
      console.error('Failed to copy tracking number: ', err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-4 bg-neutral-200 w-24" />
            <div className="h-6 bg-neutral-200 w-48" />
            <div className="h-4 bg-neutral-200 w-32" />
          </div>
          <div className="h-8 bg-neutral-200 w-28" />
        </div>
        <div className="h-32 bg-neutral-200 w-full" />
        <div className="h-64 bg-neutral-200 w-full" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="space-y-6">
        <div>
          <Link
            href="/account/orders"
            className="text-xs text-neutral-500 hover:text-black transition-colors uppercase tracking-wider inline-flex items-center gap-1 mb-3"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to Orders
          </Link>
        </div>
        <FormError message={error || 'Order not found.'} />
      </div>
    );
  }

  const subtotal = order.line_items.reduce((acc, item) => acc + parseFloat(item.total), 0);
  const shippingLine = order.shipping_lines?.[0];
  const shippingTitle = shippingLine ? shippingLine.method_title : 'Shipping';
  const shippingCost = parseFloat(order.shipping_total || '0');

  // Bank Transfer (BACS) check
  const isBacsPayment = order.payment_method === 'bacs';
  const showPaymentInstructions = isBacsPayment && 
    order.status !== 'processing' && 
    order.status !== 'cancelled' && 
    order.status !== 'completed';

  const bankDetails = {
    bankName: "BCA",
    accountNumber: "7772432383",
    accountName: "ERRY FERDIANTO"
  };

  const orderCurrency = (order.billing?.country === 'ID' || order.billing?.country === 'MY') ? 'IDR' : 'USD';

  const whatsappMessage = `Hi JamesBoogie, Saya ingin melakukan konfirmasi pembayaran untuk order #${order.number}. 
Total: ${formatPrice(parseFloat(order.total), orderCurrency)}
Mohon konfirmasi.`;
  const whatsappUrl = `https://wa.me/6285157000263?text=${encodeURIComponent(whatsappMessage)}`;

  const badge = STATUS_MAP[order.status] || {
    label: order.status.toUpperCase(),
    color: 'bg-neutral-100 text-neutral-600 border-neutral-300'
  };

  const reversedHistory = trackingData?.history ? [...trackingData.history].reverse() : [];

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link
            href="/account/orders"
            className="text-xs text-neutral-500 hover:text-black transition-colors uppercase tracking-wider inline-flex items-center gap-1 mb-3"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to Orders
          </Link>
          <h2 className="text-xl font-bold uppercase tracking-wider">
            Order #{order.number}
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            Placed on{' '}
            {new Date(order.date_created).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}{' '}
            at{' '}
            {new Date(order.date_created).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            })}
          </p>
        </div>
        <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 border rounded-none ${badge.color}`}>
          {badge.label}
        </span>
      </div>

      {/* Tracking Info Section (Side by side on desktop, stacked on mobile) */}
      {order.tracking_number && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Left: Tracking Number Card */}
          <div className="border border-black p-6 space-y-4 bg-white h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-black mb-4">
                <span>TRACKING NUMBER / NO RESI</span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-black/10">
                <span className="font-mono text-base md:text-lg font-bold tracking-widest text-black">
                  {order.tracking_number}
                </span>
                <button
                  onClick={handleCopyTracking}
                  className="px-4 py-2 border border-black text-xs font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors cursor-pointer"
                >
                  {copiedTracking ? 'COPIED!' : 'COPY'}
                </button>
              </div>
            </div>
          </div>

          {/* Right: Tracking Status Card */}
          <div className="border border-black p-6 space-y-4 bg-white h-full">
            <div className="text-xs font-bold uppercase tracking-widest text-black">
              SHIPMENT STATUS
            </div>

            {trackingLoading ? (
              <div className="space-y-2 animate-pulse py-2">
                <div className="h-4 bg-neutral-200 w-24" />
                <div className="h-4 bg-neutral-200 w-full" />
              </div>
            ) : trackingError ? (
              <p className="text-sm text-neutral-500 py-2 uppercase tracking-wide">
                {trackingError}
              </p>
            ) : trackingData ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 py-1">
                  <span className={`h-2.5 w-2.5 rounded-full ${
                    trackingData.pod_status === 'DELIVERED'
                      ? 'bg-green-600'
                      : trackingData.pod_status === 'RETURNED'
                      ? 'bg-red-600'
                      : trackingData.pod_status === 'ON HOLD'
                      ? 'bg-orange-600'
                      : 'bg-blue-600'
                  }`} />
                  <span className={`text-sm font-bold uppercase tracking-wide ${
                    STATUS_COLORS[trackingData.pod_status] || 'text-neutral-600'
                  }`}>
                    {trackingData.pod_status}
                  </span>
                </div>

                {trackingData.last_status && (
                  <p className="text-xs text-neutral-600 border border-black/5 bg-neutral-50 p-3 italic">
                    &ldquo;{trackingData.last_status}&rdquo;
                  </p>
                )}

                {trackingData.history && trackingData.history.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <button
                      onClick={() => setHistoryExpanded(!historyExpanded)}
                      className="text-xs font-bold uppercase tracking-widest text-black hover:text-neutral-500 transition-colors underline cursor-pointer"
                    >
                      {historyExpanded ? 'HIDE ▲' : 'SHOW TRACKING HISTORY ▼'}
                    </button>

                    {historyExpanded && (
                      <div className="border-t border-black/10 pt-4 space-y-4 max-h-60 overflow-y-auto pr-2">
                        {reversedHistory.map((item, index) => (
                          <div key={index} className="flex gap-3 text-xs leading-relaxed">
                            <span className="text-neutral-400 shrink-0 select-none">•</span>
                            <div>
                              <p className="font-mono text-[10px] text-neutral-400">{item.date}</p>
                              <p className="text-neutral-700 uppercase tracking-wide text-[11px] mt-0.5">{item.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Conditionally render Payment Instructions */}
      {showPaymentInstructions && (
        <div className="space-y-6">
          {order.unique_code && (
            <BankTransferInstructions
              uniqueCode={order.unique_code}
              totalAmount={order.transfer_amount || order.total}
              orderNumber={order.number}
            />
          )}

          <div className="border border-black/10 p-6 space-y-6 bg-white">
            <div className="space-y-2">
              <h3 className="font-bold text-sm uppercase tracking-wider">Instruksi Pembayaran</h3>
              <p className="text-sm text-neutral-600">Lakukan pembayaran dengan <b>TIDAK DIBULATKAN</b>, sesuai nominal tertera dan tepat sampai tiga digit terakhir. Perbedaan nominal akan menghambat proses transaksi.</p> 
              <p className="text-sm text-neutral-600">Mohon lakukan pembayaran dalam waktu maksimal 2 jam.</p> 
            </div>
            
            <div className="bg-neutral-50 p-4 border border-black/5 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium text-neutral-500">Bank</span>
                  <span className="font-semibold">{bankDetails.bankName}</span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium text-neutral-500">Account Number</span>
                  <CopyableText text={bankDetails.accountNumber} label="Account Number">
                    <span className="font-mono font-semibold text-base tracking-wide">{bankDetails.accountNumber}</span>
                  </CopyableText>
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium text-neutral-500">Account Name</span>
                  <span className="font-semibold">{bankDetails.accountName}</span>
                </div>
              </div>

              <div className="border-t border-black/5 pt-4 space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-neutral-500">Subtotal</span>
                  <span>{formatPrice(subtotal, orderCurrency)}</span>
                </div>
                {shippingLine && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-neutral-500">Shipping ({shippingLine.method_title})</span>
                    <span>{formatPrice(shippingCost, orderCurrency)}</span>
                  </div>
                )}
                {order.fee_lines?.map((fee, idx) => {
                  if (fee.name === 'UNIQUE CODE') return null;
                  return (
                    <div key={idx} className="flex justify-between items-center text-sm">
                      <span className="text-neutral-500">{fee.name}</span>
                      <span>{formatPrice(parseFloat(fee.total), orderCurrency)}</span>
                    </div>
                  );
                })}
                <div className="pt-2 flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-wider">Total Amount</span>
                  <CopyableText text={order.total} label="Total Amount">
                    <span className="font-bold text-lg text-black font-heading">
                      {formatPrice(parseFloat(order.total), orderCurrency)}
                    </span>
                  </CopyableText>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 p-4 border border-yellow-200 text-xs text-yellow-800">
              <p><strong>PENTING:</strong> Sertakan Order ID <strong>#{order.number}</strong> ke dalam transfer reference/note.</p>
            </div>

            <div>
              <Button className="w-full h-12 text-sm bg-black hover:bg-black/90 font-bold uppercase tracking-widest text-white rounded-none cursor-pointer" asChild>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  Konfirmasi Pembayaran via WhatsApp
                </a>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Line Items */}
      <div className="border border-black bg-white">
        <div className="bg-neutral-50 px-4 py-3 border-b border-black">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Items</h3>
        </div>
        <div className="divide-y divide-black/5">
          {order.line_items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 px-4 py-4">
              {item.image?.src ? (
                <img
                  src={item.image.src}
                  alt={item.name}
                  className="w-16 h-16 object-cover border border-black/10 shrink-0"
                />
              ) : (
                <div className="w-16 h-16 bg-neutral-100 border border-black/10 flex items-center justify-center text-neutral-400 text-[10px] uppercase font-bold shrink-0">
                  No Image
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold uppercase truncate">{item.name}</p>
                <p className="text-xs text-neutral-500">
                  {item.quantity} × {formatPrice(parseFloat(item.price), orderCurrency)}
                </p>
              </div>
              <p className="text-sm font-bold shrink-0">
                {formatPrice(parseFloat(item.total), orderCurrency)}
              </p>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="border-t border-black px-4 py-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-neutral-500">Subtotal</span>
            <span>{formatPrice(subtotal, orderCurrency)}</span>
          </div>
          {shippingLine && (
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500">Shipping ({shippingTitle})</span>
              <span>{formatPrice(shippingCost, orderCurrency)}</span>
            </div>
          )}
          {order.unique_code && (
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500">Unique Code</span>
              <span>{formatPrice(parseInt(order.unique_code, 10), orderCurrency)}</span>
            </div>
          )}
          {order.fee_lines?.map((fee, idx) => {
            if (fee.name === 'UNIQUE CODE') return null;
            return (
              <div key={idx} className="flex justify-between text-sm">
                <span className="text-neutral-500">{fee.name}</span>
                <span>{formatPrice(parseFloat(fee.total), orderCurrency)}</span>
              </div>
            );
          })}
          <div className="flex justify-between text-sm font-bold pt-2 border-t border-black">
            <span className="uppercase tracking-wider">Total</span>
            <span>{formatPrice(parseFloat(order.total), orderCurrency)}</span>
          </div>
        </div>
      </div>

      {/* Payment & Shipping Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Billing Address */}
        <div className="border border-black p-4 bg-white">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-3">Billing Address</h3>
          <div className="text-sm space-y-1">
            <p className="font-medium">{order.billing.first_name} {order.billing.last_name}</p>
            <p className="text-neutral-600">{order.billing.address_1}</p>
            {order.billing.address_2 && <p className="text-neutral-600">{order.billing.address_2}</p>}
            <p className="text-neutral-600">
              {order.billing.city}{order.billing.state ? `, ${order.billing.state}` : ''} {order.billing.postcode}
            </p>
            <p className="text-neutral-600">{order.billing.country}</p>
            {order.billing.phone && <p className="text-neutral-500 text-xs mt-2">{order.billing.phone}</p>}
            {order.billing.email && <p className="text-neutral-500 text-xs">{order.billing.email}</p>}
          </div>
        </div>

        {/* Shipping Address */}
        <div className="border border-black p-4 bg-white">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-3">Shipping Address</h3>
          <div className="text-sm space-y-1">
            <p className="font-medium">{order.shipping.first_name} {order.shipping.last_name}</p>
            <p className="text-neutral-600">{order.shipping.address_1}</p>
            {order.shipping.address_2 && <p className="text-neutral-600">{order.shipping.address_2}</p>}
            <p className="text-neutral-600">
              {order.shipping.city}{order.shipping.state ? `, ${order.shipping.state}` : ''} {order.shipping.postcode}
            </p>
            <p className="text-neutral-600">{order.shipping.country}</p>
            {order.shipping.phone ? (
              <p className="text-neutral-500 text-xs mt-2">{order.shipping.phone}</p>
            ) : order.billing.phone ? (
              <p className="text-neutral-500 text-xs mt-2">{order.billing.phone}</p>
            ) : null}
          </div>
        </div>
      </div>

      {/* Payment Method */}
      <div className="border border-black p-4 bg-white">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-2">Payment Method</h3>
        <p className="text-sm">{order.payment_method_title}</p>
      </div>
    </div>
  );
}
