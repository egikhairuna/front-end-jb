import { Metadata } from "next";
import { StoreMap } from "@/components/store/StoreMap";

export const metadata: Metadata = {
    title: "Our Store | James Boogie",
    description: "Visit our physical store location. James Boogie - A Pop Military Brand with a premium retail presence.",
};

export const dynamic = "force-dynamic";

export default function OurStorePage() {
    return (
        <div className="flex-1 min-h-screen pt-24 md:pt-32 lg:pb-20">
                <div className="w-full">
                    {/* Store Information & Map Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
                        {/* Left Column: Header & Store Information */}
                        <div className="space-y-12 px-6 md:px-8 lg:px-0 lg:pl-12">
                            {/* Page Header */}
                            <section>
                                <h1 className="text-4xl md:text-5xl font-heading font-bold uppercase mb-4 tracking-tight">
                                    Our Store
                                </h1>
                                <p className="text-base md:text-lg text-muted-foreground">
                                    Experience James Boogie in person. Visit our flagship store to explore our latest collections and immerse yourself in the Pop Military Brands.
                                </p>
                            </section>

                            {/* Store Information */}
                            <section className="space-y-8">
                                <div>
                                    {/* Address */}
                                    <div className="mb-6">
                                        <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground mb-2">
                                            Address
                                        </h3>
                                        <address className="not-italic text-base leading-relaxed">
                                            Gambir Saketi 44 street<br />
                                            Bandung, Indonesia<br />
                                            40123
                                        </address>
                                    </div>

                                    {/* Opening Hours */}
                                    <div className="mb-6">
                                        <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground mb-2">
                                            Opening Hours
                                        </h3>
                                        <div className="text-base space-y-1">
                                            <p>Everyday: 10:00 AM - 9:00 PM</p>
                                        </div>
                                    </div>

                                    {/* Contact */}
                                    <div className="mb-6">
                                        <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground mb-2">
                                            Contact
                                        </h3>
                                        <div className="text-base space-y-1">
                                            <p>
                                                <a 
                                                    href="https://wa.me/6285157000263" 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="hover:underline transition-all"
                                                >
                                                    WhatsApp: +62 851-5700-0263
                                                </a>
                                            </p>
                                        </div>
                                    </div>

                                    {/* Optional Store Description */}
                                    <div className="pt-4 border-t border-border">
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            Our flagship store offers a curated selection of James Boogie collections, 
                                            personalized styling assistance, and an immersive brand experience. 
                                            We look forward to welcoming you.
                                        </p>
                                    </div>
                                </div>
                            </section>
                        </div>

                        {/* Store Map */}
                        <section className="h-full lg:pr-12">
                            <div className="w-full h-[450px] lg:h-full lg:min-h-[600px] overflow-hidden lg:shadow-xl lg:border lg:border-black/5 bg-neutral-100 relative z-0 border-y border-black/5 lg:border-y">
                                <StoreMap />
                            </div>
                        </section>
                    </div>
                </div>
        </div>
    );
}
