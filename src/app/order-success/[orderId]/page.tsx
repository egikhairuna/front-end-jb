import { Metadata } from 'next';
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertTriangle, Clock } from "lucide-react";
import Link from "next/link";
import { getWooCommerceClient } from "@/lib/woocommerce/client";
import { formatPrice } from "@/lib/currency/config";
import { CopyableText } from "@/components/ui/copyable-text";
import { BankTransferInstructions } from "@/components/checkout/BankTransferInstructions";
import { isDomesticPaymentCountry } from "@/lib/payment";
import { WCOrderResponse, WCMetaData, WCFeeLine } from "@/types/woocommerce";

export const metadata: Metadata = {
  title: "Order Confirmation",
  robots: {
    index: false,
    follow: false,
  },
};

type Props = {
  params: Promise<{ orderId: string }>,
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function OrderSuccessPage({ params, searchParams }: Props) {
  const { orderId } = await params;
  const search = await searchParams;
  const orderKey = typeof search.key === 'string' ? search.key : null;

  if (!orderKey) {
    return <OrderError message="Missing order security key." />;
  }

  let order: WCOrderResponse | null = null;
  let errorMessage: string | null = null;

  try {
    const wooCommerceClient = getWooCommerceClient();
    order = await wooCommerceClient.getOrder(parseInt(orderId));
    
    // 🛡️ Security Check: Validate order key
    if (order.order_key !== orderKey) {
      console.error('❌ Order key mismatch!', { expected: order.order_key, received: orderKey });
      errorMessage = "Invalid security key for this order.";
    }
  } catch (error) {
    console.error('💥 Error fetching order:', error);
    errorMessage = "Could not retrieve order details.";
  }

  if (errorMessage || !order) {
    return <OrderError message={errorMessage || "Could not retrieve order details."} />;
  }

  // Extract shipping info from metadata or lines
  const shippingLine = order.shipping_lines?.[0];
  const shippingService = order.meta_data?.find((m: WCMetaData) => m.key === '_shipping_jne_service')?.value || '';
  
  // Extract unique payment code from order meta (BACS only)
  const uniqueCode = order.meta_data?.find((m: WCMetaData) => m.key === '_unique_payment_code')?.value || '';
  const transferAmount = order.meta_data?.find((m: WCMetaData) => m.key === '_transfer_amount')?.value || order.total;
  const isBacsPayment = order.payment_method === 'bacs';
  const orderCurrency = isDomesticPaymentCountry(order.billing?.country) ? 'IDR' : 'USD';
  const status = order.status?.toLowerCase() || 'pending';

  // Bank Details for domestic BACS transfer
  const bankDetails = {
    bankName: "BCA",
    accountNumber: "7772432383",
    accountName: "ERRY FERDIANTO"
  };

  const whatsappMessage = `Hi JamesBoogie, Saya sudah melakukan transfer untuk order #${order.number}. 
Total: ${formatPrice(parseFloat(order.total), orderCurrency)}
Mohon konfirmasi.`;
  const whatsappUrl = `https://wa.me/6285157000263?text=${encodeURIComponent(whatsappMessage)}`;

  // Header status state for card payments
  const isPaid = status === 'processing' || status === 'completed';
  const isFailed = status === 'failed' || status === 'cancelled';

  return (
    <>
      <Navbar />
      <div className="w-full px-4 md:px-8 lg:px-12 py-10 mt-20">
         <div className="max-w-2xl mx-auto space-y-8">
            
            {/* Header Banner */}
            {isBacsPayment ? (
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 text-green-600 rounded-full">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h1 className="text-3xl font-bold font-heading">Thank You!</h1>
                <p className="text-muted-foreground text-lg">Your order #{order.number} has been placed successfully.</p>
              </div>
            ) : isPaid ? (
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 text-green-600 rounded-full">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h1 className="text-3xl font-bold font-heading">Payment Confirmed!</h1>
                <p className="text-muted-foreground text-lg">Your card payment for order #{order.number} has been confirmed. We are preparing your shipment.</p>
              </div>
            ) : isFailed ? (
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 text-red-600 rounded-full">
                  <AlertTriangle className="w-10 h-10" />
                </div>
                <h1 className="text-3xl font-bold font-heading">Payment Failed</h1>
                <p className="text-muted-foreground text-lg">We were unable to complete card payment for order #{order.number}. Please try placing your order again.</p>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 text-blue-600 rounded-full">
                  <Clock className="w-10 h-10" />
                </div>
                <h1 className="text-3xl font-bold font-heading">Order Received!</h1>
                <p className="text-muted-foreground text-lg">Thank you! Your order #{order.number} has been received. We are awaiting final payment confirmation from your card issuer.</p>
              </div>
            )}

            {/* Bank Transfer Instructions with Unique Code (BACS only) */}
            {isBacsPayment && uniqueCode && (
              <BankTransferInstructions
                uniqueCode={uniqueCode}
                totalAmount={transferAmount}
                orderNumber={order.number}
              />
            )}

            {/* Bank Details Box (BACS only) */}
            {isBacsPayment ? (
              <div className="bg-card border rounded-lg p-6 space-y-6">
                  <div className="space-y-2">
                      <h3 className="font-semibold text-lg">Instruksi Pembayaran</h3>
                      <p className="text-sm text-muted-foreground">Lakukan pembayaran dengan <b>TIDAK DIBULATKAN</b>, sesuai nominal tertera dan tepat sampai tiga digit terakhir. Perbedaan nominal akan menghambat proses transaksi.</p> 
                      <p className="text-sm text-muted-foreground">Mohon lakukan pembayaran dalam waktu maksimal 2 jam.</p> 
                  </div>
                  
                  <div className="bg-muted p-4 rounded-md space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-muted-foreground">Bank</span>
                            <span className="font-semibold">{bankDetails.bankName}</span>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-muted-foreground">Account Number</span>
                            <CopyableText text={bankDetails.accountNumber} label="Account Number">
                              <span className="font-mono font-semibold text-lg tracking-wide">{bankDetails.accountNumber}</span>
                            </CopyableText>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-muted-foreground">Account Name</span>
                            <span className="font-semibold">{bankDetails.accountName}</span>
                        </div>
                      </div>

                      <div className="border-t pt-4 space-y-2">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span>{formatPrice(parseFloat(order.total) - parseFloat(order.shipping_total) - (order.fee_lines?.reduce((acc: number, fee: WCFeeLine) => acc + parseFloat(fee.total), 0) || 0), orderCurrency)}</span>
                        </div>
                        {shippingLine && (
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Shipping ({shippingLine.method_title} {shippingService})</span>
                                <span>{formatPrice(parseFloat(order.shipping_total), orderCurrency)}</span>
                            </div>
                        )}
                        {/* Display Fee Lines (Unique Code) */}
                        {order.fee_lines && order.fee_lines.length > 0 && order.fee_lines.map((fee: WCFeeLine, idx: number) => (
                          <div key={idx} className="flex justify-between items-center text-sm">
                              <span className="text-muted-foreground">{fee.name}</span>
                              <span>{formatPrice(parseFloat(fee.total), orderCurrency)}</span>
                          </div>
                        ))}
                        <div className="pt-2 flex justify-between items-center">
                             <span className="text-sm font-bold uppercase tracking-wider">Total Amount</span>
                             <CopyableText text={order.total} label="Total Amount">
                               <span className="font-bold text-xl text-primary font-heading">
                                  {formatPrice(parseFloat(order.total), orderCurrency)}
                               </span>
                             </CopyableText>
                        </div>
                      </div>
                  </div>

                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md text-sm text-yellow-800 dark:text-yellow-200">
                      <p><strong>PENTING:</strong> Sertakan Order ID <strong>#{order.number}</strong> ke dalam transfer reference/note.</p>
                  </div>
              </div>
            ) : (
              /* International Card Payment Order Summary */
              <div className="bg-card border rounded-lg p-6 space-y-6">
                <div className="flex justify-between items-center pb-3 border-b">
                  <div>
                    <h3 className="font-semibold text-lg">Order Summary</h3>
                    <p className="text-xs text-muted-foreground uppercase">Payment via Credit / Debit Card</p>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 uppercase rounded-full ${
                    isPaid ? 'bg-green-100 text-green-800' : isFailed ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {status}
                  </span>
                </div>

                <div className="bg-muted p-4 rounded-md space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Order Number</span>
                    <span className="font-bold">#{order.number}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatPrice(parseFloat(order.total) - parseFloat(order.shipping_total || '0'), orderCurrency)}</span>
                  </div>
                  {shippingLine && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Shipping ({shippingLine.method_title})</span>
                      <span>{formatPrice(parseFloat(order.shipping_total || '0'), orderCurrency)}</span>
                    </div>
                  )}
                  <div className="border-t pt-3 flex justify-between items-center">
                    <span className="text-sm font-bold uppercase tracking-wider">Total Paid</span>
                    <span className="font-bold text-xl text-primary font-heading">
                      {formatPrice(parseFloat(order.total), orderCurrency)}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground space-y-1">
                  <p>A confirmation email with shipping updates will be sent to <strong>{order.billing?.email}</strong>.</p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-4">
                {isBacsPayment && (
                  <Button className="w-full h-12 text-base bg-black hover:bg-black/80 font-bold" asChild>
                      <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                          Konfirmasi Pembayaran via WhatsApp
                      </a>
                  </Button>
                )}
                <Button variant="outline" className="w-full h-12" asChild>
                    <Link href="/shop">Continue Shopping</Link>
                </Button>
            </div>
         </div>
      </div>
    </>
  );
}

function OrderError({ message }: { message: string }) {
  return (
    <>
      <Navbar />
      <div className="w-full px-4 py-20 flex flex-col items-center text-center space-y-6">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold font-heading">Order Not Found</h1>
          <p className="text-muted-foreground">{message}</p>
        </div>
        <Button asChild>
          <Link href="/shop">Return to Shop</Link>
        </Button>
      </div>
    </>
  );
}
