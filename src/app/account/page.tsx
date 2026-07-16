'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package, MapPin, User } from 'lucide-react';
import { useCurrency } from '@/lib/currency/context';

interface OrderSummary {
  id: number;
  number: string;
  status: string;
  total: string;
  dateCreated: string;
  trackingNumber?: string | null;
}

interface Profile {
  firstName: string;
  lastName: string;
  email: string;
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

export default function AccountDashboard() {
  const { formatPrice } = useCurrency();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [recentOrders, setRecentOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [profileRes, ordersRes] = await Promise.all([
          fetch('/api/account/profile', { credentials: 'same-origin' }),
          fetch('/api/account/orders?per_page=3', { credentials: 'same-origin' }),
        ]);

        if (profileRes.ok) {
          const data = await profileRes.json();
          setProfile(data.profile);
        }

        if (ordersRes.ok) {
          const data = await ordersRes.json();
          setRecentOrders(data.orders);
        }
      } catch {
        // Non-critical — dashboard still renders
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-neutral-100 animate-pulse w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-neutral-100 animate-pulse border border-black/5" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Welcome */}
      <div>
        <h2 className="text-xl font-bold uppercase tracking-wider">
          Hi{profile?.firstName ? `, ${profile.firstName}` : ''}
        </h2>
        <p className="text-sm text-neutral-500 mt-1">
          {profile?.email}
        </p>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/account/profile"
          className="flex items-center gap-4 p-6 border border-black hover:border-black transition-colors group"
        >
          <User className="h-5 w-5 text-neutral-400 group-hover:text-black transition-colors" />
          <div>
            <p className="text-sm font-bold uppercase tracking-wider">Profile</p>
            <p className="text-xs text-neutral-500">Edit your details</p>
          </div>
        </Link>
        <Link
          href="/account/orders"
          className="flex items-center gap-4 p-6 border border-black hover:border-black transition-colors group"
        >
          <Package className="h-5 w-5 text-neutral-400 group-hover:text-black transition-colors" />
          <div>
            <p className="text-sm font-bold uppercase tracking-wider">Orders</p>
            <p className="text-xs text-neutral-500">View order history</p>
          </div>
        </Link>
        <Link
          href="/account/addresses"
          className="flex items-center gap-4 p-6 border border-black hover:border-black transition-colors group"
        >
          <MapPin className="h-5 w-5 text-neutral-400 group-hover:text-black transition-colors" />
          <div>
            <p className="text-sm font-bold uppercase tracking-wider">Address Book</p>
            <p className="text-xs text-neutral-500">Manage your addresses</p>
          </div>
        </Link>
      </div>

      {/* Recent Orders */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold uppercase tracking-wider">Recent Orders</h3>
          <Link
            href="/account/orders"
            className="text-xs text-neutral-500 hover:text-black transition-colors uppercase tracking-wider"
          >
            View all →
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="border border-black p-8 text-center">
            <Package className="h-8 w-8 text-neutral-300 mx-auto mb-3" />
            <p className="text-sm text-neutral-500">No orders yet</p>
            <Link
              href="/shop"
              className="text-xs text-black font-bold uppercase tracking-wider hover:underline mt-2 inline-block"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="border border-black divide-y divide-black">
            {recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/account/orders/${order.id}`}
                className="flex items-center justify-between p-4 hover:bg-black/[0.02] transition-colors"
              >
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold">#{order.number}</p>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 shrink-0 ${statusColors[order.status] || 'bg-neutral-100 text-neutral-600'}`}>
                      {order.status.replace('-', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {new Date(order.dateCreated).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                  {/* On-Hold Payment Warning */}
                  {order.status === 'on-hold' && (
                    <p className="text-[10px] text-red-600 font-bold mt-1.5 uppercase tracking-wider leading-relaxed">
                      Silakan selesaikan pembayaran anda. Abaikan pesan ini jika sudah melakukan pembayaran 
                    </p>
                  )}
                  {/* Shipment Status */}
                  {order.trackingNumber ? (
                    <p className="text-[10px] text-green-700 font-bold mt-1.5 uppercase tracking-wider">
                      Shipped (JNE: {order.trackingNumber})
                    </p>
                  ) : (order.status === 'processing' || order.status === 'completed') ? (
                    <p className="text-[10px] text-neutral-500 font-bold mt-1.5 uppercase tracking-wider">
                      Preparing shipment
                    </p>
                  ) : null}
                </div>
                <p className="text-sm font-bold shrink-0">
                  {formatPrice(parseFloat(order.total))}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Order Status Legend */}
      <div className="p-6 border border-black bg-neutral-50/50 space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Order Status Guide</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="space-y-1">
            <span className="inline-block px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800">
              On Hold / Pending
            </span>
            <p className="text-neutral-500 leading-relaxed">
              Order has been received, but the payment transfer has not been processed or confirmed yet.
            </p>
          </div>
          <div className="space-y-1">
            <span className="inline-block px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800">
              Processing
            </span>
            <p className="text-neutral-500 leading-relaxed">
              Payment is successfully confirmed. Your order is being carefully prepared and packaged.
            </p>
          </div>
          <div className="space-y-1">
            <span className="inline-block px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-green-100 text-green-800">
              Completed
            </span>
            <p className="text-neutral-500 leading-relaxed">
              Payment confirmed, package has been shipped via courier, and dispatch tracking details are active.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
