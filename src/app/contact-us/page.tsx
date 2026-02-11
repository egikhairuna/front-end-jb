import { Metadata } from "next";
import { Mail, Phone, MapPin, Clock, ArrowUpRight } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Contact Us",
    description: "Get in touch with James Boogie. For inquiries, collaborations, or support, feel free to reach out to our team or visit our flagship store.",
};

export default function ContactUsPage() {
    return (
        <div className="flex-1 min-h-screen pt-24 md:pt-32 pb-20">
                <div className="max-w-[1920px] mx-auto px-6 md:px-10 lg:px-12">
                    {/* Header Section */}
                    <div className="mb-16 md:mb-24 max-w-4xl">
                        <h1 className="text-4xl md:text-5xl lg:text-5xl font-heading font-bold uppercase mb-6 tracking-tight">
                            Contact Us
                        </h1>
                        <p className="text-lg md:text-lg text-muted-foreground leading-relaxed max-w-2xl">
                            We will respond to every email, Monday to Friday, excluding holidays.
                        </p>
                    </div>

                    {/* Contact Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 md:gap-8 lg:gap-16">
                        
                        {/* Digital Contact */}
                        <div className="lg:col-span-5 space-y-12">
                            <section>
                                <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-6 flex items-center gap-2">
                                    <Mail className="h-4 w-4" /> Digital Inquiries
                                </h2>
                                <div className="space-y-8">
                                    <div className="group">
                                        <p className="text-sm text-neutral-500 mb-1">Email Us</p>
                                        <a 
                                            href="mailto:info@jamesboogie.com" 
                                            className="text-2xl md:text-2xl font-medium hover:opacity-50 transition-opacity flex items-center gap-2"
                                        >
                                            info@jamesboogie.com
                                            <ArrowUpRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </a>
                                    </div>
                                    
                                    <div className="group">
                                        <p className="text-sm text-neutral-500 mb-1">WhatsApp / Phone</p>
                                        <a 
                                            href="https://wa.me/6285157000263"
                                            target="_blank"
                                            rel="noopener noreferrer" 
                                            className="text-2xl md:text-2xl font-medium hover:opacity-50 transition-opacity flex items-center gap-2"
                                        >
                                            +62 851-5700-0263
                                            <ArrowUpRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </a>
                                    </div>
                                </div>
                            </section>

                            <section className="pt-8 border-t border-neutral-100">
                                <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">
                                    Customer Support Hours
                                </h2>
                                <p className="text-base">
                                    Monday — Friday<br />
                                    09:00 AM — 06:00 PM (WIB)
                                </p>
                            </section>
                        </div>

                        {/* Physical Store Info */}
                        <div className="lg:col-span-6 lg:col-start-7 space-y-12">
                            <section>
                                <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-6 flex items-center gap-2">
                                    <MapPin className="h-4 w-4" /> Visit Our Store
                                </h2>
                                <div className="bg-neutral-50 p-8 md:p-10 rounded-lg border border-neutral-100">
                                    <h3 className="text-2xl font-bold uppercase mb-4">James Boogie Flagship Store</h3>
                                    
                                    <div className="space-y-6">
                                        <address className="not-italic text-lg leading-relaxed text-neutral-600 block">
                                            Gambir Saketi 44 street<br />
                                            Bandung, Indonesia, 40123                                            
                                        </address>

                                        <div className="space-y-2">
                                            <div className="flex items-start gap-3 text-neutral-600">
                                                <div className="mt-1"><Clock className="h-4 w-4" /></div>
                                                <div>
                                                    <p className="font-medium text-black">Opening Hours</p>
                                                    <p>Everyday: 10:00 AM — 09:00 PM</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-4">
                                            <Link 
                                                href="/our-store" 
                                                className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider border-b border-black pb-1 hover:opacity-50 transition-opacity"
                                            >
                                                View Store Location <ArrowUpRight className="h-3 w-3" />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>

                    </div>
                </div>
        </div>
    );
}
