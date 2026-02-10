import { Navbar } from "@/components/layout/Navbar";
import { Metadata } from "next";
import { ShieldCheck, XCircle, FileText, Mail, ArrowUpRight, Clock, AlertCircle, MessageCircle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
    title: "Our Services - Product Warranty | James Boogie",
    description: "Learn about the James Boogie product warranty. We stand behind our quality with comprehensive coverage for manufacturing defects and hardware issues.",
};

export default function OurServicesPage() {
    return (
        <>
            <Navbar />
            <main className="min-h-screen pt-24 md:pt-32 pb-20">
                <div className="max-w-[1920px] mx-auto px-6 md:px-10 lg:px-12">
                    
                    {/* 1. Hero Section */}
                    <div className="mb-20 md:mb-28 max-w-4xl">
                        <span className="block text-sm font-bold tracking-widest uppercase text-muted-foreground mb-4">
                            Our Services
                        </span>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold uppercase mb-6 tracking-tight">
                            Product Warranty
                        </h1>
                        <p className="text-lg md:text-lg text-neutral-600 leading-relaxed max-w-3xl font-light">
                            6 Months Warranty
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
                        
                        {/* Left Column: Main Content */}
                        <div className="lg:col-span-7 space-y-20">
                            
                            {/* 2. Warranty Overview */}
                            <section>
                                <div className="prose prose-lg prose-neutral max-w-none">
                                    <p className="text-base leading-relaxed text-neutral-600">
                                        This warranty only applies to the original purchaser and only applies if the garment has been used normally. The warranty will be void if there is damage caused by misuse, alteration, excessive wear, neglect or other accidents and other human errors.
                                    </p>
                                </div>
                            </section>

                            {/* 3. Coverage Details */}
                            <section className="space-y-8">
                                <h2 className="text-2xl font-bold uppercase tracking-tight flex items-center gap-3">
                                    <ShieldCheck className="h-6 w-6" /> What's Covered
                                </h2>
                                <div className="grid sm:grid-cols-2 gap-6">
                                    {[
                                        "Cracks or logos coming off the jacket",
                                        "Loose buttons",
                                        "Faulty stitching)",
                                        "Broken zippers and loose the drawcord strings."
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-start gap-3 p-4 bg-neutral-50 rounded-lg border border-neutral-100">
                                            <ShieldCheck className="h-5 w-5 text-neutral-900 mt-0.5 shrink-0" />
                                            <span className="font-medium text-neutral-800">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <section className="space-y-8">
                                <h2 className="text-2xl font-bold uppercase tracking-tight flex items-center gap-3 text-neutral-500">
                                    <XCircle className="h-6 w-6" /> What's Not Covered
                                </h2>
                                <div className="grid sm:grid-cols-2 gap-6">
                                    {[
                                        "Misuse",
                                        "Alteration",
                                        "Excessive wear and tear",
                                        "Neglect or other accidents and other human errors"
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-start gap-3 p-4 bg-white border border-neutral-200 rounded-lg opacity-75">
                                            <XCircle className="h-5 w-5 text-neutral-400 mt-0.5 shrink-0" />
                                            <span className="font-medium text-neutral-600">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* 6. Warranty Period */}
                            <section className="bg-neutral-900 text-white p-8 md:p-10">
                                <div className="flex items-start gap-6">
                                    <Clock className="h-8 w-8 text-white shrink-0 mt-1" />
                                    <div>
                                        <h3 className="text-xl font-bold uppercase tracking-wider mb-2">Warranty Period</h3>
                                        <p className="text-3xl font-light mb-4 text-white">6 Months</p>
                                        <p className="text-neutral-400 leading-relaxed">
                                            This James Boogie product is warranty for 6 months from the date of purchase. If returned during this period, due to cracks or logos coming off the jacket, loose buttons, faulty stitching, broken zippers and loose the drawcord strings. We will repair or replace it, at our direction, completely free of charge.
                                        </p>
                                    </div>
                                </div>
                            </section>

                        </div>

                        {/* Right Column: Process & Visuals */}
                        <div className="lg:col-span-5 space-y-12">
                            
                            {/* 5. How to Use (Timeline) */}
                            <section className="bg-neutral-50 border border-neutral-100 p-8">
                                <h2 className="text-lg font-bold uppercase tracking-widest mb-8 flex items-center gap-2">
                                    <FileText className="h-5 w-5" /> How to Claim
                                </h2>
                                <p className="mb-8">When making a claim, please return the product to our store or you can send a text message to our contact, along with the warranty card, bringing the badge, damaged buttons, drawcord string and zippers and this purchase receipt.</p>
                                <p className="mb-8">Our people will make a note of your purchase details using the space below and please keep this warranty card in a safe place along with your receipt details.</p>
                                <div className="relative pl-8 space-y-10 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-neutral-200">
                                    {[
                                        { title: "Keep Your Card", desc: "Ensure you have your physical warranty card and purchase receipt." },
                                        { title: "Contact Support", desc: "Email our support team with photos of the issue." },
                                        { title: "Verification", desc: "Our team will review your case using the card serial number." },
                                        { title: "Resolution", desc: "We will arrange a repair or replacement for valid claims." }
                                    ].map((step, i) => (
                                        <div key={i} className="relative">
                                            <span className="absolute -left-[41px] top-0 h-6 w-6 rounded-full bg-white border-2 border-neutral-900 flex items-center justify-center text-[10px] font-bold">
                                                {i + 1}
                                            </span>
                                            <h3 className="font-bold text-lg mb-1">{step.title}</h3>
                                            <p className="text-neutral-600 text-sm leading-relaxed">{step.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* 8. Support CTA */}
                            <section className="bg-white border border-neutral-200 p-8 text-center space-y-6">
                                <div className="inline-flex h-12 w-12 items-center justify-center bg-neutral-100 mb-2">
                                    <MessageCircle className="h-6 w-6 text-neutral-900" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold uppercase mb-2">Need Assistance?</h3>
                                    <p className="text-neutral-500 mb-6">
                                        If you have questions about your coverage or need to start a claim, we're here to help.
                                    </p>
                                    <a 
                                        href="https://wa.me/6285157000263"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center justify-center gap-2 w-full bg-neutral-900 text-white font-bold tracking-wider uppercase py-4 px-8 hover:bg-black transition-colors"
                                    >
                                        Chat on WhatsApp
                                    </a>
                                </div>
                            </section>

                            <div className="flex items-start gap-4 p-4 bg-amber-50 text-amber-900 text-sm">
                                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                                <p>
                                    <strong>Note:</strong> Warranty claims without the original warranty card may be rejected. 
                                    Please store it safely.
                                </p>
                            </div>

                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}
