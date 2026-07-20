import Image from "next/image";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative w-full h-[100vh] md:h-screen bg-neutral-900 text-white flex items-end justify-center overflow-hidden p-8 pb-16 md:pb-20">
      {/* Background Images */}
      <div className="absolute inset-0 z-0">
        {/* Mobile image */}
        <div className="md:hidden relative w-full h-full">
          <Image
            src="https://vps.jamesboogie.com/wp-content/uploads/2026/07/Thumbnail_Teaser-Zesty-1-scaled.jpg"
            alt="James Boogie Mobile Hero"
            fill
            sizes="100vw"
            style={{ objectFit: "cover", objectPosition: "center" }}
            priority
            quality={85}
          />
        </div>

        {/* Desktop image */}
        <div className="hidden md:block relative w-full h-full">
          <Image
            src="https://vps.jamesboogie.com/wp-content/uploads/2026/07/Zesty_Poster_Landscape-scaled.jpg"
            alt="James Boogie Desktop Hero"
            fill
            sizes="100vw"
            style={{ objectFit: "cover", objectPosition: "center" }}
            priority
            quality={85}
          />
        </div>

        {/* Dark Overlay */}
        <div className="absolute inset-0 pointer-events-none bg-black/15 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      {/* Hero Text Overlay */}
      <header className="relative z-10 max-w-4xl flex flex-col items-center text-center space-y-1.5 mb-2 md:mb-4">
        <h1 className="text-3xl md:text-5xl font-medium font-heading tracking-wider leading-tight uppercase">
          ZESTY '026
        </h1>
        <p className="text-[10px] md:text-xs text-neutral-300 tracking-[0.4em] uppercase font-medium">
          A rogue transmission who ignites the canvas.
        </p>
        <div className="flex items-center justify-center pt-1">
          <Link
            href="#"
            className="group flex items-center gap-2 text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase hover:opacity-70 transition-opacity"
          >
            Coming Soon
            <span className="text-[10px] md:text-lg mb-[0.2em] font-regular transition-transform group-hover:translate-x-1">
              &gt;
            </span>
          </Link>
        </div>
      </header>
    </section>
  );
}
