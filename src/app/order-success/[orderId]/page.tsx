

import { Metadata } from 'next';
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Order Success",
  robots: {
    index: false,
    follow: false,
  },
};
import { CheckCircle2, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { wooCommerceClient } from "@/lib/woocommerce/client";
import { formatPrice } from "@/lib/utils";
import { CopyableText } from "@/components/ui/copyable-text";
import { BankTransferInstructions } from "@/components/checkout/BankTransferInstructions";

// Types
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

  let order;
  try {
    // Fetch order from WooCommerce REST API
    order = await wooCommerceClient.getOrder(parseInt(orderId));
    
    // 🛡️ Security Check: Validate order key
    if (order.order_key !== orderKey) {
      console.error('❌ Order key mismatch!', { expected: order.order_key, received: orderKey });
      return <OrderError message="Invalid security key for this order." />;
    }
  } catch (error) {
    console.error('💥 Error fetching order:', error);
    return <OrderError message="Could not retrieve order details." />;
  }

  // Extract shipping info from metadata or lines
  const shippingLine = order.shipping_lines?.[0];
  const shippingService = order.meta_data?.find((m: any) => m.key === '_shipping_jne_service')?.value || '';
  
  // Extract unique payment code from order meta
  const uniqueCode = order.meta_data?.find((m: any) => m.key === '_unique_payment_code')?.value || '';
  const transferAmount = order.meta_data?.find((m: any) => m.key === '_transfer_amount')?.value || order.total;
  const isBacsPayment = (order as any).payment_method === 'bacs';
  
  // Bank Details (Could be fetched from env or settings)
  const bankDetails = {
    bankName: "BCA",
    accountNumber: "7772432383",
    accountName: "ERRY FERDIANTO"
  };

  const whatsappMessage = `Hi JamesBoogie, Saya sudah melakukan transfer untuk order #${order.number}. 
Total: Rp ${parseFloat(order.total).toLocaleString('id-ID')}
Mohon konfirmasi.`;
  const whatsappUrl = `https://wa.me/6285157000263?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <>
      <Navbar />
      <div className="w-full px-4 md:px-8 lg:px-12 py-10 mt-20">
         <div className="max-w-2xl mx-auto space-y-8">
            <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 text-green-600 rounded-full">
                    <CheckCircle2 className="w-10 h-10" />
                </div>
                <h1 className="text-3xl font-bold font-heading">Thank You!</h1>
                <p className="text-muted-foreground text-lg">Your order #{order.number} has been placed successfully.</p>
            </div>

            {/* Bank Transfer Instructions with Unique Code (for BACS only) */}
            {isBacsPayment && uniqueCode && (
              <BankTransferInstructions
                uniqueCode={uniqueCode}
                totalAmount={transferAmount}
                orderNumber={order.number}
              />
            )}

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
                          <span>Rp {(parseFloat(order.total) - parseFloat(order.shipping_total) - (order.fee_lines?.reduce((acc, fee) => acc + parseFloat(fee.total), 0) || 0)).toLocaleString('id-ID')}</span>
                      </div>
                      {shippingLine && (
                          <div className="flex justify-between items-center text-sm">
                              <span className="text-muted-foreground">Shipping ({shippingLine.method_title} {shippingService})</span>
                              <span>Rp {parseFloat(order.shipping_total).toLocaleString('id-ID')}</span>
                          </div>
                      )}
                      {/* Display Fee Lines (Unique Code) */}
                      {order.fee_lines && order.fee_lines.length > 0 && order.fee_lines.map((fee: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">{fee.name}</span>
                            <span>Rp {parseFloat(fee.total).toLocaleString('id-ID')}</span>
                        </div>
                      ))}
                      <div className="pt-2 flex justify-between items-center">
                           <span className="text-sm font-bold uppercase tracking-wider">Total Amount</span>
                           <CopyableText text={order.total} label="Total Amount">
                             <span className="font-bold text-xl text-primary font-heading">
                                Rp {parseFloat(order.total).toLocaleString('id-ID')}
                             </span>
                           </CopyableText>
                      </div>
                    </div>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md text-sm text-yellow-800 dark:text-yellow-200">
                    <p><strong>PENTING:</strong> Sertakan Order ID <strong>#{order.number}</strong> ke dalam transfer reference/note.</p>
                </div>
            </div>

            <div className="space-y-4">
                <Button className="w-full h-12 text-base bg-black hover:bg-black/80 font-bold" asChild>
                    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                        Konfirmasi Pembayaran via WhatsApp
                    </a>
                </Button>
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
