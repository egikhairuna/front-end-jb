"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { 
  UserCircle, 
  Search, 
  Info, 
  CheckCircle2, 
  Truck, 
  ArrowRight,
  MessageCircle,
  HelpCircle
} from "lucide-react";
import { PiShoppingBag } from "react-icons/pi";
import Link from "next/link";

const CONTENT = {
  id: {
    hero: {
      subtitle: "Panduan Belanja",
      title: "Cara Melakukan Pemesanan",
      description: "Panduan lengkap untuk membantu Anda berbelanja dengan mudah dan aman di jamesboogie.com"
    },
    sections: [
      {
        id: "account",
        icon: UserCircle,
        title: "AKUN",
        description: "Anda tidak perlu mendaftar akun untuk melakukan pembelian di jamesboogie.com. Namun, kami menyarankan Anda untuk membuat akun untuk mengakses fitur eksklusif, layanan, dan informasi tambahan."
      },
      {
        id: "search",
        icon: Search,
        title: "PENCARIAN PRODUK",
        description: "Untuk menelusuri katalog kami dengan mudah, pilih kategori dari menu navigasi atau jelajahi produk unggulan di halaman utama. Untuk item yang lebih spesifik, gunakan opsi filter atau fitur pencarian situs web."
      },
      {
        id: "info",
        icon: Info,
        title: "INFORMASI PRODUK",
        description: "Di setiap halaman produk, Anda akan menemukan ukuran yang tersedia, deskripsi terperinci, dan komposisi produk. Klik pada gambar produk untuk melihat semua detail."
      }
    ],
    howTo: {
      title: "CARA MEMESAN PRODUK",
      steps: [
        "Pilih ukuran dan jumlah yang diinginkan pada halaman produk",
        "Tambahkan produk ke keranjang Anda",
        "Setelah selesai berbelanja, klik \"Lanjutkan ke Checkout\"",
        "Masukkan alamat email dan informasi pengiriman Anda",
        "Pilih metode pengiriman dan opsi pembayaran Anda",
        "Tinjau detail pesanan Anda dan klik \"BUAT PESANAN\"",
        "Anda akan menerima email konfirmasi pesanan beserta faktur Anda",
        "Transfer pembayaran ke rekening bank BCA yang tertera di faktur",
        "Kirim bukti pembayaran melalui kontak WhatsApp kami",
        "Gudang kami akan memproses pesanan Anda dan memberi tahu Anda setelah pesanan dikirim"
      ]
    },
    status: {
      title: "INFORMASI STATUS PESANAN",
      items: [
        {
          label: "Pesanan Sedang Disiapkan",
          description: "Pesanan Anda telah dikonfirmasi dan email konfirmasi pesanan yang berisi Nomor Pesanan Anda telah dikirim."
        },
        {
          label: "Pesanan Dikirim",
          description: "Setelah pesanan Anda dikirim dari gudang kami, Anda akan menerima email konfirmasi dengan Nomor Pelacakan."
        }
      ]
    },
    cta: {
      shop: "Belanja Sekarang",
      support: "Hubungi Dukungan (WhatsApp)",
      faq: "Lihat FAQ"
    }
  },
  en: {
    hero: {
      subtitle: "Shopping Guide",
      title: "How to Place an Order",
      description: "A complete guide to help you shop easily and securely at jamesboogie.com"
    },
    sections: [
      {
        id: "account",
        icon: UserCircle,
        title: "ACCOUNT",
        description: "You do not need to create an account to place an order on jamesboogie.com. However, we recommend registering an account to access exclusive features, services, and additional information."
      },
      {
        id: "search",
        icon: Search,
        title: "PRODUCT SEARCH",
        description: "To browse our catalog easily, select a category from the navigation menu or explore featured products on the homepage. To find something specific, use our filters or the website search function."
      },
      {
        id: "info",
        icon: Info,
        title: "PRODUCT INFORMATION",
        description: "On each product page, you will find available sizes, detailed descriptions, and product composition. Click on the product images to view all details."
      }
    ],
    howTo: {
      title: "HOW TO ORDER A PRODUCT",
      steps: [
        "Select the desired size and quantity on the product page",
        "Add the product to your cart",
        "Once you finish shopping, click \"Proceed to Checkout\"",
        "Enter your email address and shipping details",
        "Select your shipping and payment methods",
        "Review your information and click \"PLACE ORDER\"",
        "You will receive an order confirmation email with invoice details",
        "Transfer payment to the BCA bank account listed in the invoice",
        "Send proof of payment via our WhatsApp contact",
        "Our warehouse will process your order and notify you once it has been shipped"
      ]
    },
    status: {
      title: "ORDER STATUS INFORMATION",
      items: [
        {
          label: "Order Being Prepared",
          description: "Your order has been confirmed and a confirmation email containing your Order Number has been sent."
        },
        {
          label: "Order Shipped",
          description: "Once your order has been shipped from our warehouse, you will receive a confirmation email with a Tracking Number."
        }
      ]
    },
    cta: {
      shop: "Shop Now",
      support: "Contact Support (WhatsApp)",
      faq: "View FAQ"
    }
  }
};

export function HowToOrderClient() {
  const [lang, setLang] = useState<"en" | "id">("en");
  const t = CONTENT[lang];

  return (
    <div className="flex-1 min-h-screen pt-32 pb-24 bg-white text-black">
        <div className="w-full px-6 md:px-8 lg:px-12">
          
          {/* Header & Language Toggle */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 md:mb-24 gap-8">
            <div className="max-w-4xl">
              <span className="block text-sm font-bold tracking-widest uppercase text-neutral-400 mb-4">
                {t.hero.subtitle}
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-5xl font-bold uppercase tracking-tight leading-none">
                {t.hero.title}
              </h1>
              <p className="mt-6 text-lg text-neutral-600 font-light max-w-2xl leading-relaxed">
                {t.hero.description}
              </p>
            </div>
            <div className="flex gap-4 border-b border-black pb-2 self-start md:self-auto">
              <button 
                onClick={() => setLang("en")}
                className={cn(
                  "text-[10px] font-bold tracking-widest transition-opacity hover:opacity-100 uppercase",
                  lang === "en" ? "opacity-100" : "opacity-30"
                )}
              >
                English
              </button>
              <button 
                onClick={() => setLang("id")}
                className={cn(
                  "text-[10px] font-bold tracking-widest transition-opacity hover:opacity-100 uppercase",
                  lang === "id" ? "opacity-100" : "opacity-30"
                )}
              >
                Bahasa
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
            {/* Main Content */}
            <div className="lg:col-span-8 space-y-24">
              
              {/* Core Information Sections */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                {t.sections.map((section) => (
                  <div key={section.id} className="space-y-6">
                    <div className="h-12 w-12 bg-neutral-50 flex items-center justify-center border border-neutral-100">
                      <section.icon className="h-6 w-6 text-neutral-900" />
                    </div>
                    <h3 className="text-sm font-bold tracking-widest uppercase">{section.title}</h3>
                    <p className="text-sm text-neutral-600 leading-relaxed font-light">
                      {section.description}
                    </p>
                  </div>
                ))}
              </div>

              {/* Step-by-Step Selection */}
              <section className="space-y-12">
                <div className="flex items-center gap-4">
                  <div className="h-px flex-1 bg-neutral-100" />
                  <h2 className="text-2xl font-bold uppercase tracking-tight whitespace-nowrap">
                    {t.howTo.title}
                  </h2>
                  <div className="h-px flex-1 bg-neutral-100" />
                </div>

                <div className="relative pl-8 space-y-12 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-neutral-100">
                  {t.howTo.steps.map((step, i) => (
                    <div key={i} className="relative group">
                      <span className="absolute -left-[41px] top-0 h-6 w-6 rounded-full bg-white border-2 border-black flex items-center justify-center text-[10px] font-bold group-hover:bg-black group-hover:text-white transition-colors">
                        {i + 1}
                      </span>
                      <p className="text-lg md:text-xl font-medium tracking-tight leading-snug max-w-2xl uppercase italic">
                        {step}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Order Status */}
              <section className="bg-neutral-900 text-white p-8 md:p-12 space-y-10">
                <h2 className="text-lg font-bold tracking-widest uppercase text-neutral-400">
                  {t.status.title}
                </h2>
                <div className="grid md:grid-cols-2 gap-12">
                  {t.status.items.map((item, i) => (
                    <div key={i} className="space-y-4">
                      <div className="flex items-center gap-3">
                        {i === 0 ? <CheckCircle2 className="h-5 w-5" /> : <Truck className="h-5 w-5" />}
                        <h3 className="text-base font-bold uppercase tracking-tight">{item.label}</h3>
                      </div>
                      <p className="text-neutral-400 text-sm leading-relaxed font-light">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

            </div>

            {/* Sidebar CTA */}
            <div className="lg:col-span-4 lg:self-start">
              <div className="space-y-4 sticky top-32">
                <Link 
                  href="/shop"
                  className="flex items-center justify-between group w-full bg-black text-white p-8 hover:bg-neutral-800 transition-colors"
                >
                  <span className="text-xl font-bold uppercase tracking-tight">{t.cta.shop}</span>
                  <PiShoppingBag className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
                </Link>

                <a 
                  href="https://wa.me/6285157000263"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col gap-6 w-full border border-neutral-200 p-8 hover:bg-neutral-50 transition-colors"
                >
                  <div className="h-10 w-10 bg-neutral-100 flex items-center justify-center">
                    <MessageCircle className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <span className="block text-xs font-bold tracking-widest text-neutral-400 uppercase">Need help?</span>
                    <span className="block text-base font-bold uppercase tracking-tight">{t.cta.support}</span>
                  </div>
                </a>

                <Link 
                  href="/faq"
                  className="flex flex-col gap-6 w-full border border-neutral-200 p-8 hover:bg-neutral-50 transition-colors"
                >
                  <div className="h-10 w-10 bg-neutral-100 flex items-center justify-center">
                    <HelpCircle className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <span className="block text-xs font-bold tracking-widest text-neutral-400 uppercase">Questions?</span>
                    <span className="block text-base font-bold uppercase tracking-tight">{t.cta.faq}</span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
}
