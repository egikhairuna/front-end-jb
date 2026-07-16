'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Package } from 'lucide-react';

interface Order {
  id: number;
  number: string;
  status: string;
  total: string;
  currency: string;
  dateCreated: string;
  itemCount: number;
  paymentMethod: string;
  trackingNumber?: string | null;
}

interface Pagination {
  page: number;
  perPage: number;
  totalPages: number;
  total: number;
}

const statusColors: Record<string, string> = {
  'pending': 'bg-yellow-100 text-yellow-800',
  'processing': 'bg-amber-100 text-amber-800',
  'on-hold': 'bg-blue-100 text-blue-800',
  'completed': 'bg-green-100 text-green-800',
  'cancelled': 'bg-red-100 text-red-800',
  'refunded': 'bg-purple-100 text-purple-800',
  'failed': 'bg-red-100 text-red-800',
};

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    async function fetchOrders() {
      setLoading(true);
      try {
        const response = await fetch(`/api/account/orders?page=${page}&per_page=10`, {
          credentials: 'same-origin',
        });

        if (response.status === 401) {
          window.location.href = '/account/login?expired=true';
          return;
        }

        if (response.ok) {
          const data = await response.json();
          setOrders(data.orders);
          setPagination(data.pagination);
        }
      } catch {
        // Error handled by empty state
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, [page]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-6 bg-neutral-100 animate-pulse w-32" />
        {[1, 2, 3].map(i => (
          <div key={i} className="h-20 bg-neutral-100 animate-pulse border border-black/5" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold uppercase tracking-wider pb-2 border-b border-black">
        Order History
      </h2>

      {orders.length === 0 ? (
        <div className="border border-black/10 p-12 text-center">
          <Package className="h-10 w-10 text-neutral-300 mx-auto mb-4" />
          <p className="text-sm text-neutral-500 mb-4">You haven&apos;t placed any orders yet.</p>
          <Link
            href="/shop"
            className="inline-block bg-black text-white px-8 py-3 text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-black border border-black transition-all"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block border border-black/10">
            <table className="w-full">
              <thead>
                <tr className="border-b border-black/10 bg-neutral-50">
                  <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-neutral-500">Order</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-neutral-500">Date</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-neutral-500">Status</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-neutral-500">Items</th>
                  <th className="text-right px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-neutral-500">Total</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    onClick={() => router.push(`/account/orders/${order.id}`)}
                    className="hover:bg-black/[0.02] transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-4 text-sm font-bold">#{order.number}</td>
                    <td className="px-4 py-4 text-sm text-neutral-500">
                      <div>
                        {new Date(order.dateCreated).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                        {order.status === 'on-hold' && (
                          <p className="text-[10px] text-red-600 font-bold mt-1 uppercase tracking-wider leading-relaxed">
                            Silakan selesaikan pembayaran anda.<br />Abaikan pesan ini jika sudah melakukan pembayaran
                          </p>
                        )}
                        {order.trackingNumber ? (
                          <p className="text-[10px] text-green-700 font-bold mt-1 uppercase tracking-wider leading-none">
                            Shipped (JNE: {order.trackingNumber})
                          </p>
                        ) : (order.status === 'processing' || order.status === 'completed') ? (
                          <p className="text-[10px] text-neutral-500 font-bold mt-1 uppercase tracking-wider leading-none">
                            Preparing shipment
                          </p>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 ${statusColors[order.status] || 'bg-neutral-100 text-neutral-600'}`}>
                        {order.status.replace('-', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-neutral-500">{order.itemCount} item{order.itemCount !== 1 ? 's' : ''}</td>
                    <td className="px-4 py-4 text-sm font-bold text-right">
                      Rp {parseFloat(order.total).toLocaleString('id-ID')}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Link
                        href={`/account/orders/${order.id}`}
                        className="text-xs font-bold uppercase tracking-wider text-neutral-500 hover:text-black transition-colors"
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/account/orders/${order.id}`}
                className="block border border-black/10 p-4 hover:border-black/30 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-bold">#{order.number}</p>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 ${statusColors[order.status] || 'bg-neutral-100 text-neutral-600'}`}>
                    {order.status.replace('-', ' ')}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-neutral-500">
                  <span>
                    {new Date(order.dateCreated).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                    {' · '}
                    {order.itemCount} item{order.itemCount !== 1 ? 's' : ''}
                  </span>
                  <span className="font-bold text-sm text-black">
                    Rp {parseFloat(order.total).toLocaleString('id-ID')}
                  </span>
                </div>
                {/* On-Hold / Shipment Status text for mobile card */}
                {order.status === 'on-hold' && (
                  <p className="text-[10px] text-red-600 font-bold mt-2 uppercase tracking-wider leading-relaxed">
                    Silakan selesaikan pembayaran anda. Abaikan pesan ini jika sudah melakukan pembayaran
                  </p>
                )}
                {order.trackingNumber ? (
                  <p className="text-[10px] text-green-700 font-bold mt-2 uppercase tracking-wider">
                    Shipped (JNE: {order.trackingNumber})
                  </p>
                ) : (order.status === 'processing' || order.status === 'completed') ? (
                  <p className="text-[10px] text-neutral-500 font-bold mt-2 uppercase tracking-wider">
                    Preparing shipment
                  </p>
                ) : null}
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider border border-black/10 disabled:opacity-30 hover:border-black transition-colors disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-xs text-neutral-500 px-4">
                Page {page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                disabled={page >= pagination.totalPages}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider border border-black/10 disabled:opacity-30 hover:border-black transition-colors disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
