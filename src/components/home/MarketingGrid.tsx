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
    <section className="w-full bg-black">
      {/* 
        Mobile: Horizontal Scroll Snap
        Desktop: Grid
      */}
      <div className="flex md:grid md:grid-cols-3 w-full h-[500px] md:h-[600px] overflow-x-auto md:overflow-hidden snap-x snap-mandatory scrollbar-hide">
        {marketingItems.map((item, index) => (
          <div
            key={index}
            className="relative min-w-full md:min-w-0 w-full h-full snap-center group border-r border-neutral-800 last:border-r-0"
          >
            <Link href={item.href} className="block w-full h-full relative">
              {/* Image Background */}
              <div className="absolute inset-0">
                <Image
                  src={item.image}
                  alt={item.alt}
                  fill
                  className="object-cover transition-transform duration-700"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors duration-500" />
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent" />
              </div>

              {/* Text Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10 pointer-events-none">
                 <div className="transform transition-transform duration-500 md:translate-y-4 md:group-hover:translate-y-0">
                    <h2 className="text-white font-bold text-xl md:text-2xl mb-2 tracking-wider">
                      {item.title}
                    </h2>
                    <span className="inline-block text-white/80 text-sm font-mono tracking-[0.2em] uppercase border-b border-transparent group-hover:border-white/80 transition-all duration-300 pb-1">
                      {item.linkText}
                    </span>
                 </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
