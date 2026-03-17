"use client";

import React, { useState } from "react";
import { X, ChevronRight, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface FindMySizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSize: (size: string) => void;
}

const SIZE_CHART: Record<string, { height: [number, number]; weight: [number, number] }> = {
  S:   { height: [155, 165], weight: [45, 55]  },
  M:   { height: [165, 170], weight: [55, 60]  },
  L:   { height: [170, 175], weight: [60, 65]  },
  XL:  { height: [175, 180], weight: [65, 70]  },
  XXL: { height: [180, 185], weight: [70, 100] },
};

const SIZES = ["S", "M", "L", "XL", "XXL"];

const TRANSLATIONS = {
  en: {
    title: "Find My Size",
    back: "Back",
    male: "Male",
    female: "Female",
    height: "Height",
    weight: "Weight",
    continue: "Continue",
    recommended: "Recommended for you",
    men: "Men",
    women: "Women",
    goodChance: "There is a good chance this size fits you perfectly.",
    recalculate: "Recalculate",
    select: (size: string) => `Select ${size}`,
    errorEmpty: "Please enter your height and weight to continue.",
    errorHeight: "Please enter a valid height between 100–250 cm.",
    errorWeight: "Please enter a valid weight between 30–200 kg.",
  },
  id: {
    title: "Temukan Ukuran",
    back: "Kembali",
    male: "Pria",
    female: "Wanita",
    height: "Tinggi",
    weight: "Berat",
    continue: "Lanjutkan",
    recommended: "Rekomendasi untuk kamu",
    men: "Pria",
    women: "Wanita",
    goodChance: "Ukuran ini kemungkinan besar akan cocok untukmu.",
    recalculate: "Hitung Ulang",
    select: (size: string) => `Pilih ${size}`,
    errorEmpty: "Masukkan tinggi dan berat badanmu untuk melanjutkan.",
    errorHeight: "Masukkan tinggi badan yang valid antara 100–250 cm.",
    errorWeight: "Masukkan berat badan yang valid antara 30–200 kg.",
  },
} as const;

type Lang = keyof typeof TRANSLATIONS;

export function FindMySizeModal({ isOpen, onClose, onSelectSize }: FindMySizeModalProps) {
  const [lang, setLang] = useState<Lang>("en");
  const [view, setView] = useState<"form" | "result">("form");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [error, setError] = useState("");
  const [recommendedSize, setRecommendedSize] = useState("");

  const t = TRANSLATIONS[lang];

  if (!isOpen) return null;

  const calculateSize = (h: number, w: number): string => {
    const matches: string[] = [];
    Object.entries(SIZE_CHART).forEach(([size, range]) => {
      if (
        h >= range.height[0] && h <= range.height[1] &&
        w >= range.weight[0] && w <= range.weight[1]
      ) {
        matches.push(size);
      }
    });

    if (matches.length > 0) return matches[Math.floor(matches.length / 2)];

    let baseSize = "M";
    let minDist = Infinity;
    Object.entries(SIZE_CHART).forEach(([size, range]) => {
      const hC = (range.height[0] + range.height[1]) / 2;
      const wC = (range.weight[0] + range.weight[1]) / 2;
      const d = Math.sqrt(Math.pow((h - hC) / 40, 2) + Math.pow((w - wC) / 70, 2));
      if (d < minDist) { minDist = d; baseSize = size; }
    });

    return baseSize;
  };

  const handleContinue = () => {
    const h = parseFloat(height);
    const w = parseFloat(weight);

    if (!height || !weight || isNaN(h) || isNaN(w)) {
      setError(t.errorEmpty);
      return;
    }
    if (h < 100 || h > 250) {
      setError(t.errorHeight);
      return;
    }
    if (w < 30 || w > 200) {
      setError(t.errorWeight);
      return;
    }

    setError("");
    setRecommendedSize(calculateSize(h, w));
    setView("result");
  };

  const handleSelectRecommendation = () => {
    onSelectSize(recommendedSize);
    handleClose();
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setView("form");
      setHeight("");
      setWeight("");
      setError("");
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />

      {/* Modal */}
      <div className="relative w-full sm:max-w-lg bg-white mx-0 sm:mx-4 overflow-hidden border-t sm:border border-black/10 shadow-2xl animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">

        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-neutral-100">
          {/* Left: back button or title */}
          {view === "result" ? (
            <button
              onClick={() => setView("form")}
              className="flex items-center gap-1.5 text-[12px] font-medium uppercase tracking-[0.18em] text-neutral-400 hover:text-black transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              {t.back}
            </button>
          ) : (
            <span className="text-[12px] font-medium uppercase tracking-[0.18em] text-black">{t.title}</span>
          )}

          {/* Right: language toggle + close */}
          <div className="flex items-center gap-3">
            {/* Lang toggle */}
            <div className="flex border border-neutral-200 overflow-hidden">
              {(["en", "id"] as Lang[]).map((l) => (
                <button
                  key={l}
                  onClick={() => { setLang(l); setError(""); }}
                  className={cn(
                    "px-2.5 py-1 text-[12px] font-bold uppercase tracking-widest transition-all cursor-pointer",
                    lang === l ? "bg-black text-white" : "text-black/30 hover:text-black"
                  )}
                >
                  {l}
                </button>
              ))}
            </div>
            <button
              onClick={handleClose}
              className="p-1 text-neutral-400 hover:text-black transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-7 pt-7 pb-8 h-[360px] flex flex-col overflow-hidden">
          {view === "form" ? (
            <>
              {/* Gender Toggle */}
              <div className="flex border border-neutral-150 mb-8">
                {(["male", "female"] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    className={cn(
                      "flex-1 py-3 text-[12px] font-medium uppercase tracking-[0.18em] transition-all cursor-pointer",
                      gender === g ? "bg-black text-white" : "text-black/30 hover:text-black"
                    )}
                  >
                    {g === "male" ? t.male : t.female}
                  </button>
                ))}
              </div>

              {/* Large number inputs */}
              <div className="grid grid-cols-2 gap-6 mb-5">
                {/* Height */}
                <div>
                  <div className="flex items-baseline justify-between mb-3">
                    <label className="text-[12px] font-medium uppercase tracking-widest text-black/75">{t.height}</label>
                    <span className="text-[12px] font-mono text-black/30">cm</span>
                  </div>
                  <input
                    type="number"
                    placeholder="175"
                    value={height}
                    onChange={(e) => { setHeight(e.target.value); setError(""); }}
                    className={cn(
                      "w-full text-[42px] font-extralight tracking-tight text-black bg-transparent border-b-[1.5px] pb-2 pt-1 focus:outline-none transition-colors placeholder:text-black/10 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                      error && !height ? "border-red-400" : "border-neutral-200 focus:border-black"
                    )}
                  />
                </div>

                {/* Weight */}
                <div>
                  <div className="flex items-baseline justify-between mb-3">
                    <label className="text-[12px] font-medium uppercase tracking-widest text-black/75">{t.weight}</label>
                    <span className="text-[12px] font-mono text-black/30">kg</span>
                  </div>
                  <input
                    type="number"
                    placeholder="70"
                    value={weight}
                    onChange={(e) => { setWeight(e.target.value); setError(""); }}
                    className={cn(
                      "w-full text-[42px] font-extralight tracking-tight text-black bg-transparent border-b-[1.5px] pb-2 pt-1 focus:outline-none transition-colors placeholder:text-black/10 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                      error && !weight ? "border-red-400" : "border-neutral-200 focus:border-black"
                    )}
                  />
                </div>
              </div>

              {/* Inline error */}
              {error && (
                <p className="text-[11px] text-red-500 mb-3 font-medium">{error}</p>
              )}

              <div className="flex-1" />

              <button
                type="button"
                onClick={handleContinue}
                className="w-full h-14 bg-black text-white hover:bg-neutral-900 text-[12px] font-bold uppercase tracking-[0.2em] transition-all group flex items-center justify-center gap-2 cursor-pointer"
              >
                {t.continue}
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </>
          ) : (
            <div className="flex flex-col flex-1">
              <p className="text-[12px] font-regular uppercase tracking-[0.18em] text-black mb-4">{t.recommended}</p>

              {/* Giant size display */}
              <div className="flex items-end gap-5 pb-6 border-b border-neutral-100 mb-6">
                <span className="text-[96px] font-black tracking-tighter text-black leading-none">{recommendedSize}</span>
                <div className="mb-3 space-y-1">
                  <p className="text-[12px] font-regular uppercase tracking-[0.18em] text-black">
                    {gender === "male" ? t.men : t.women}
                  </p>
                  {height && weight && (
                    <p className="text-[12px] font-regular text-black">{height} cm · {weight} kg</p>
                  )}
                </div>
              </div>

              <p className="text-[12px] text-black font-regular tracking-wide leading-relaxed mb-2">
                {t.goodChance}
              </p>

              <div className="flex-1" />

              <div className="flex gap-3 pt-6">
                <button
                  onClick={() => setView("form")}
                  className="flex-1 h-14 border border-black text-[12px] font-bold uppercase tracking-[0.15em] text-black hover:bg-black hover:text-white transition-all cursor-pointer"
                >
                  {t.recalculate}
                </button>
                <button
                  onClick={handleSelectRecommendation}
                  className="flex-1 h-14 bg-black text-white hover:bg-neutral-900 text-[12px] font-bold uppercase tracking-[0.2em] transition-all cursor-pointer"
                >
                  {t.select(recommendedSize)}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
