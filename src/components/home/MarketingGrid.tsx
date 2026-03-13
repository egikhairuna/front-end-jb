import Link from "next/link";
import Image from "next/image";

const marketingItems = [
  {
    title: "CONTACT US",
    linkText: "LEARN MORE",
    href: "/contact-us",
    image: "/marketing/badge.png",
    alt: "Abstract metal design representing contact",
  },
  {
    title: "OUR STORES",
    linkText: "VIEW MORE",
    href: "/our-store",
    image: "/marketing/store2.png",
    alt: "Modern store interior with red accents",
  },
  {
    title: "OUR SERVICES",
    linkText: "VIEW MORE",
    href: "/our-services",
    image: "/marketing/service.png",
    alt: "Futuristic laboratory with orange jacket",
  },
];

export function MarketingGrid() {
  return (
    <section className="w-full bg-black border-t border-white/5">
      <div className="flex md:grid md:grid-cols-3 w-full overflow-x-auto scrollbar-hide snap-x snap-mandatory">
        {marketingItems.map((item, index) => (
          <Link 
            key={index}
            href={item.href} 
            className="flex-none w-[100vw] md:w-auto aspect-[4/5] md:aspect-[3/4] lg:aspect-[4/5] relative group block overflow-hidden snap-start border-r border-white/10 last:border-r-0 bg-neutral-900"
          >
            {/* Image Background */}
            <div className="absolute inset-0">
              <Image
                src={item.image}
                alt={item.alt}
                fill
                priority={index === 0}
                className="object-cover transition-transform duration-1000 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              {/* Dark Overlay */}
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors duration-500" />
            </div>

            {/* Text Overlay */}
            <div className="absolute inset-0 flex flex-col p-6 md:p-10">
              {/* Title - Middle Area */}
              <div className="flex-1 flex items-center">
                <h2 className="text-white font-medium text-[13px] md:text-[14px] tracking-[0.2em] uppercase">
                  {item.title}
                </h2>
              </div>

              {/* Bottom Link */}
              <div className="mt-auto">
                <span className="inline-block text-white text-[11px] font-medium tracking-[0.2em] uppercase border-b border-white pb-0.5">
                  {item.linkText}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
