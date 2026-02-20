"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const CONTENT = {
  en: {
    title: "RETURNS",
    items: [
      "We can only exchange goods for products with manufacturing defects such as damage, holes, tears, etc.",
      "Items must have original tags as included upon receipt.",
      "Goods must be returned no later than 1 day after the goods are received.",
      "We are not responsible for lost items returned during return delivery.",
      "We have the right to refuse an exchange if the item has been damaged, torn or washed.",
      "Repackage your returned items safely.",
      "Send your returned goods to the address:",
    ],
    address: {
      name: "James Boogie",
      street: "Jl Gambir Saketi No 44, Bandung.",
      phone: "+62 851 5700 0623",
    },
    footerItems: [
      "New items will be sent after we receive and confirm your return or exchange.",
      "Initial shipping costs are non-refundable.",
      "Re-delivery costs are fully borne by the buyer unless there is an error on our part.",
    ],
  },
  id: {
    title: "PENGEMBALIAN",
    items: [
      "Kami hanya dapat menukar barang untuk produk dengan cacat produksi seperti kerusakan, lubang, robek, dll.",
      "Barang harus memiliki tag asli seperti yang disertakan saat diterima.",
      "Barang harus dikembalikan paling lambat 1 hari setelah barang diterima.",
      "Kami tidak bertanggung jawab atas barang yang hilang selama pengiriman kembali.",
      "Kami berhak menolak pertukaran jika barang telah rusak, robek, atau dicuci.",
      "Kemas kembali barang yang Anda kembalikan dengan aman.",
      "Kirim barang yang Anda kembalikan ke alamat:",
    ],
    address: {
      name: "James Boogie",
      street: "Jl Gambir Saketi No 44, Bandung.",
      phone: "+62 851 5700 0623",
    },
    footerItems: [
      "Barang baru akan dikirim setelah kami menerima dan mengonfirmasi pengembalian atau pertukaran Anda.",
      "Biaya pengiriman awal tidak dapat dikembalikan.",
      "Biaya pengiriman kembali sepenuhnya ditanggung oleh pembeli kecuali terdapat kesalahan dari pihak kami.",
    ],
  },
};

export function ReturnsRefundsClient() {
  const [lang, setLang] = useState<"en" | "id">("en");
  const t = CONTENT[lang];

  return (
    <div className="flex-1 pt-32 pb-24 w-full bg-white text-black min-h-screen">
        <div className="w-full px-6 md:px-8 lg:px-12">
          {/* Header & Language Toggle */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 md:mb-24 gap-8">
            <div className="max-w-4xl">
              <span className="block text-sm font-bold tracking-widest uppercase text-neutral-400 mb-4">
                Assistance
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold uppercase tracking-tight leading-none">
                {t.title}
              </h1>
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
            {/* Left Column: Guidelines */}
            <div className="lg:col-span-7 space-y-12">
              <ul className="space-y-10">
                {t.items.map((item, index) => (
                  <li key={index} className="flex gap-6 group">
                    <span className="text-neutral-300 font-bold text-xs pt-1.5 group-hover:text-black transition-colors">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <p className="text-base md:text-lg font-medium leading-relaxed max-w-2xl uppercase tracking-tight">
                      {item}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right Column: Address & Policy Details */}
            <div className="lg:col-span-5 space-y-12">
              {/* Address Card */}
              <div className="bg-neutral-900 text-white p-8 md:p-10 space-y-6">
                <div className="space-y-4">
                  <span className="block text-[10px] font-bold tracking-[0.3em] uppercase text-neutral-400">Return Address</span>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold uppercase tracking-tight">{t.address.name}</h3>
                    <div className="h-px w-8 bg-white/20 my-4" />
                    <p className="text-lg font-light text-neutral-300">{t.address.street}</p>
                    <p className="text-lg font-light text-neutral-300">{t.address.phone}</p>
                  </div>
                </div>
              </div>

              {/* Policy Footer Items */}
              <div className="space-y-6">
                {t.footerItems.map((item, index) => (
                  <div key={index} className="flex gap-4 items-start p-4 bg-neutral-50 border border-neutral-100">
                    <div className="h-1.5 w-1.5 bg-black mt-2 shrink-0 rounded-full" />
                    <p className="text-sm font-bold uppercase tracking-tight leading-relaxed">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
    </div>
  );
}
