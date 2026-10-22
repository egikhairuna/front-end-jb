import Link from "next/link";

export function Hero() {
  return (
    <section className="relative w-full h-screen h-[100svh] min-h-screen bg-neutral-900 text-white flex items-end justify-center overflow-hidden p-8 pb-28 md:pb-20">
      {/* Background Videos */}
      <div className="absolute inset-0 z-0">
        {/* Desktop Video: screens >= 768px */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="hidden md:block absolute inset-0 w-full h-full object-cover object-center"
        >
          <source
            src="https://vps.jamesboogie.com/wp-content/uploads/2026/10/Ballsy-Web.mp4"
            type="video/mp4"
          />
        </video>

        {/* Mobile Video: screens < 768px */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="block md:hidden absolute inset-0 w-full h-full object-cover object-center"
        >
          <source
            src="https://vps.jamesboogie.com/wp-content/uploads/2026/10/Ballsy-Mobile.mp4"
            type="video/mp4"
          />
        </video>

        {/* Dark Overlay */}
        <div className="absolute inset-0 pointer-events-none bg-black/15 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      {/* Hero Text Overlay */}
      <header className="relative z-10 max-w-4xl flex flex-col items-center text-center space-y-1.5 mb-2 md:mb-4">
        <h1 className="text-3xl md:text-5xl font-medium font-heading tracking-wider leading-tight uppercase">
          BALLSY &apos;026
        </h1>
        <p className="text-[10px] md:text-xs text-neutral-300 tracking-[0.4em] uppercase font-medium">
          A different kind of nerve, a different kind of freedom.
        </p>
        <div className="flex items-center justify-center pt-1">
          <Link
            href="#"
            className="group flex items-center gap-2 text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase hover:opacity-70 transition-opacity"
          >
            COMING SOON
            <span className="text-[10px] md:text-lg mb-[0.2em] font-regular transition-transform group-hover:translate-x-1">
              &gt;
            </span>
          </Link>
        </div>
      </header>
    </section>
  );
}
