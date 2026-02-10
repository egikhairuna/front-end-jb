"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { cn } from "@/lib/utils";
import { Plus, Minus, MessageCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

const FAQ_DATA = {
  id: {
    hero: {
      subtitle: "Bantuan & Dukungan",
      title: "Pertanyaan yang Sering Diajukan",
      description: "Kami telah merangkum pertanyaan umum untuk membantu proses pemesanan Anda menjadi lebih mudah dan cepat."
    },
    cta: {
      title: "Masih butuh bantuan?",
      description: "Jika Anda tidak menemukan jawaban yang Anda cari, jangan ragu untuk menghubungi kami.",
      buttonText: "Hubungi Kami di WhatsApp"
    },
    items: [
      {
        question: "Bagaimana cara melakukan pemesanan?",
        answer: "Untuk melakukan pemesanan, silakan klik di sini. Pastikan untuk mengisi data pribadi Anda dengan benar untuk menghindari masalah pengiriman."
      },
      {
        question: "Bagaimana cara melacak pesanan saya?",
        answer: "Setelah Anda menerima nomor pelacakan melalui WhatsApp, Anda dapat melacak pengiriman Anda di situs resmi JNE menggunakan nomor pelacakan yang diberikan."
      },
      {
        question: "Di mana saya harus melakukan pembayaran?",
        answer: "Saat ini, kami menerima transfer bank (BCA) dan PayPal untuk pembayaran internasional."
      },
      {
        question: "Kapan batas waktu pembayaran?",
        answer: "Batas waktu pembayaran adalah 2 jam. Pesanan yang tidak dibayar dalam jangka waktu ini akan dibatalkan secara otomatis."
      },
      {
        question: "Bagaimana cara konfirmasi pembayaran?",
        answer: "Silakan klik di sini untuk mengonfirmasi pembayaran Anda."
      },
      {
        question: "Layanan kurir apa yang digunakan?",
        answer: "Pengiriman domestik ditangani oleh JNE, sedangkan pengiriman internasional menggunakan TLX."
      },
      {
        question: "Kapan pesanan saya akan dikirim?",
        answer: "Pesanan dikirim setelah konfirmasi pembayaran, dalam waktu maksimal 24 jam. Pengiriman dapat dilakukan pada hari yang sama atau hari kerja berikutnya."
      },
      {
        question: "Berapa biaya pengirimannya?",
        answer: "Biaya pengiriman dihitung secara otomatis berdasarkan jumlah dan berat pesanan."
      },
      {
        question: "Bagaimana cara mendapatkan nomor pelacakan?",
        answer: "Nomor pelacakan akan dikirim melalui WhatsApp satu hari setelah pesanan diproses."
      },
      {
        question: "Apa kebijakan pengembalian atau penukaran?",
        answer: "Klik di sini untuk melihat kebijakan pengembalian dan penukaran yang lengkap."
      }
    ]
  },
  en: {
    hero: {
      subtitle: "Help & Support",
      title: "Frequently Asked Questions",
      description: "We've compiled common questions to help make your ordering process easier and faster."
    },
    cta: {
      title: "Still need help?",
      description: "If you can't find the answer you're looking for, please don't hesitate to reach out to us.",
      buttonText: "Chat on WhatsApp"
    },
    items: [
      {
        question: "How do I place an order?",
        answer: "To place an order, please click here. Make sure to fill in your personal details correctly to avoid delivery issues."
      },
      {
        question: "How can I track my order?",
        answer: "Once you receive the tracking number via WhatsApp, you can track your shipment on the official JNE website using the provided tracking number."
      },
      {
        question: "Where should I make the payment?",
        answer: "Currently, we accept bank transfers (BCA) and PayPal for international payments."
      },
      {
        question: "What is the payment deadline?",
        answer: "The payment deadline is 2 hours. Orders not paid within this time frame will be automatically canceled."
      },
      {
        question: "How do I confirm my payment?",
        answer: "Please click here to confirm your payment."
      },
      {
        question: "Which courier services are used?",
        answer: "Domestic shipping is handled by JNE, while international shipping uses TLX."
      },
      {
        question: "When will my order be shipped?",
        answer: "Orders are shipped after payment confirmation, within a maximum of 24 hours. Shipping may occur on the same day or the next business day."
      },
      {
        question: "How much is the shipping cost?",
        answer: "Shipping costs are automatically calculated based on order quantity and weight."
      },
      {
        question: "How do I receive the tracking number?",
        answer: "The tracking number will be sent via WhatsApp one day after the order is processed."
      },
      {
        question: "What is the return or exchange policy?",
        answer: "Click here to view the complete return and exchange policy."
      }
    ]
  }
};

export function FAQClient() {
  const [lang, setLang] = useState<"en" | "id">("en");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const t = FAQ_DATA[lang];

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-32 pb-24 bg-white text-black">
        <div className="max-w-[1920px] mx-auto px-6 md:px-10 lg:px-12">
          
          {/* Header & Language Switcher */}
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
                Indonesian
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
            {/* FAQ Accordion Section */}
            <div className="lg:col-span-8 space-y-4">
              {t.items.map((item, index) => (
                <div 
                  key={index}
                  className="border-b border-neutral-100 last:border-0"
                >
                  <button
                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                    className="w-full flex items-center justify-between py-6 text-left group"
                  >
                    <span className="text-lg md:text-xl font-medium tracking-tight pr-8 transition-colors group-hover:text-neutral-500">
                      {item.question}
                    </span>
                    <div className="shrink-0 h-6 w-6 flex items-center justify-center">
                      {openIndex === index ? (
                        <Minus className="h-5 w-5" />
                      ) : (
                        <Plus className="h-5 w-5" />
                      )}
                    </div>
                  </button>
                  <div 
                    className={cn(
                      "overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
                      openIndex === index ? "max-h-[500px] mb-8" : "max-h-0"
                    )}
                  >
                    <p className="text-base md:text-lg text-neutral-600 font-light leading-relaxed max-w-3xl">
                      {item.answer}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Sidebar CTA Section */}
            <div className="lg:col-span-4 lg:self-start">
              <div className="bg-neutral-50 p-8 md:p-10 border border-neutral-100 sticky top-32">
                <div className="mb-6">
                  <div className="h-10 w-10 bg-black text-white flex items-center justify-center mb-6">
                    <MessageCircle className="h-5 w-5" />
                  </div>
                  <h3 className="text-2xl font-bold uppercase tracking-tight mb-4">
                    {t.cta.title}
                  </h3>
                  <p className="text-sm text-neutral-600 leading-relaxed mb-8">
                    {t.cta.description}
                  </p>
                </div>
                
                <a 
                  href="https://wa.me/6285157000263"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 w-full bg-black text-white text-[10px] font-bold tracking-widest uppercase py-4 px-6 hover:bg-neutral-800 transition-colors"
                >
                  {t.cta.buttonText}
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
