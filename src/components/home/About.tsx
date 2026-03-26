"use client";

export function About() {
  return (
    <section className="w-full bg-white pb-12 md:pb-8 pt-0 px-4 md:px-12">
      <div className="w-full">
        {/* Large Brand Title */}
        <h2 className="text-[20px] md:text-[28px] font-medium uppercase leading-tight mb-2">
          ABOUT JAMES BOOGIE
        </h2>

        {/* Brand Story Paragraph */}
        <div className="max-w-full">
          <p className="text-[13px] md:text-[15px] leading-relaxed md:leading-[1.8] text-black/80 font-regular">
            James Boogie represents a space where we can express our creativity in total freedom, doing what we love, without having to worry about all the rules of the fashion industry. Trying new materials, new concepts that we think are unique, and sometimes a little crazy. Inspiration for James Boogie came from many things, from what we saw and loved in life. There are many fashion references in James Boogie, from re-adopting military fashion regarding jackets to reinterpreting 80s to 2000s fashion, while other ideas emerge from films, comics, to music and arts.
          </p>
        </div>
      </div>
    </section>
  );
}
