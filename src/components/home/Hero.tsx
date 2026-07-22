import { getImageProps } from "next/image";
import Link from "next/link";

export function Hero() {
  const common = {
    alt: "James Boogie",
    sizes: "100vw",
    priority: true,
    quality: 85,
  };

  const {
    props: { srcSet: desktopSrcSet },
  } = getImageProps({
    ...common,
    src: "https://vps.jamesboogie.com/wp-content/uploads/2026/07/Zesty_Poster_Landscape-scaled.jpg",
    width: 1920,
    height: 1080,
  });

  const {
    props: { srcSet: mobileSrcSet, src: mobileSrc },
  } = getImageProps({
    ...common,
    src: "https://vps.jamesboogie.com/wp-content/uploads/2026/07/Thumbnail_Teaser-Zesty-1-scaled.jpg",
    width: 828,
    height: 1104,
  });

  return (
    <section className="relative w-full h-screen h-[100svh] min-h-screen bg-neutral-900 text-white flex items-end justify-center overflow-hidden p-8 pb-28 md:pb-20">
      {/* Background Images — picture element ensures only ONE image is downloaded */}
      <div className="absolute inset-0 z-0">
        <picture style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          {/* Desktop: screens >= 768px → landscape image */}
          <source media="(min-width: 768px)" srcSet={desktopSrcSet} />
          {/* Mobile: default → portrait image */}
          <source media="(max-width: 767px)" srcSet={mobileSrcSet} />
          <img
            src={mobileSrc}
            alt="James Boogie"
            fetchPriority="high"
            decoding="async"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center",
            }}
          />
        </picture>

        {/* Dark Overlay */}
        <div className="absolute inset-0 pointer-events-none bg-black/15 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      {/* Hero Text Overlay */}
      <header className="relative z-10 max-w-4xl flex flex-col items-center text-center space-y-1.5 mb-2 md:mb-4">
        <h1 className="text-3xl md:text-5xl font-medium font-heading tracking-wider leading-tight uppercase">
          ZESTY &apos;026
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
