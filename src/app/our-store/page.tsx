import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Our Store | James Boogie",
    description: "Visit our physical store location. James Boogie - A Pop Military Brand with a premium retail presence.",
};

export const dynamic = "force-dynamic";

export default function OurStorePage() {
    return (
        <div className="flex-1 min-h-screen pt-24 md:pt-32 pb-20">
                <div className="w-full">
                    {/* Page Header */}
                    <section className="px-6 md:px-8 lg:px-12 mb-12 md:mb-16">
                        <h1 className="text-4xl md:text-5xl font-heading font-bold uppercase mb-4 tracking-tight">
                            Our Store
                        </h1>
                        <p className="text-base md:text-lg text-muted-foreground max-w-2xl">
                            Experience James Boogie in person. Visit our flagship store to explore our latest collections and immerse yourself in the Pop Military Brands.
                        </p>
                    </section>

                    {/* Store Information & Map Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 px-6 md:px-8 lg:px-12">
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

                        {/* Google Maps Embed */}
                        <section>
                            <div className="w-full h-[400px] md:h-[500px] rounded-lg overflow-hidden shadow-lg">
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.9617130721645!2d107.62682587573929!3d-6.895183167477032!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68e71eca9559a3%3A0x144e5f33bc011b67!2sJames%20Boogie!5e0!3m2!1sen!2sid!4v1770263626105!5m2!1sen!2sid"
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    allowFullScreen
                                    title="James Boogie Store Location"
                                />
                            </div>
                        </section>
                    </div>
                </div>
        </div>
    );
}
