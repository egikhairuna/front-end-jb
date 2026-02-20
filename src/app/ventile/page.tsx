import { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { VentileTimeline } from "@/components/story/VentileTimeline";
import Image from "next/image";

export const metadata: Metadata = {
  title: "James Boogie | Ventile®",
  description: "Discover the heritage and technical innovation of Ventile® fabrics used by James Boogie. From British military origins to sustainable high-performance outerwear.",
  openGraph: {
    title: "James Boogie | Ventile®",
    description: "Started from the last 1930s at Shirley Institute in Manchester. Ventile is a high performance textile perfectly suited to outerwear.",
    images: ["/images/ventile-og.jpg"],
  },
};

export const dynamic = "force-dynamic";

export default function VentilePage() {
  return (
    <>
      <Navbar />
      <main className="pt-32 pb-24 w-full bg-white text-black min-h-screen">
        <div className="w-full px-6 md:px-8 lg:px-12 space-y-16">
          {/* Narrative Paragraph */}
          <section className="max-w-none">
            <h1 className="text-3xl md:text-5xl font-bold uppercase tracking-tight mb-8">
              James Boogie | Ventile®
            </h1>
            <div className="prose prose-xl max-w-none text-base leading-relaxed font-regular">
              <p>
                Started from the last 1930s at Shirley Institute in Manchester. Ventile is a high performance textile that is perfectly suited to outerwear. Created in the United Kingdom for the British army during the Second World War, it is a tightly-weaved cotton made from fibers that have been specially selected for their length, called “extra long staple” fibers. British cotton Ventile® is still used to make uniforms and jumpsuits by various air forces to this day. It’s densely woven construction provides excellent waterproofing and protection in extreme climates. Successfully going through the world war and saving many lives. In 2019, ventile have the campaign “Join the movement. Love the environment. Choose slow fashion.” James Boogie connected with ventile to take action against the current fashion industry, and choose slow fashion. Since its founding in 2017, James Boogie has continued to develop several innovations and try to draw new connecting lines, forming a kind of roadmap of inspiration and antagonism that produces new movements, which are not completely untouched by the old ones. It’s all about fabrics, it’s about passion, it’s about being inspired by real things and functional inspirations and then putting it all together. It’s about longevity, it’s about heritage. Born from the desire to break tradition, looking forward to a vision that fits and a new tactile sensation. Crafted proper, longer than ever.
              </p>
            </div>
          </section>

          {/* Timeline Section */}
          <section className="w-full pt-20 overflow-x-auto px-12 scrollbar-hide">
            <VentileTimeline />
          </section>

          {/* Additional Narrative and Images */}
          <section className="space-y-12 pt-12">
            <div className="prose prose-xl max-w-none text-black leading-relaxed font-regular">
              <p>
                Born as a problem-solving fabric, VENTILE® its well-known as the unbeatable waterproofing performance and the exclusivity of the extra long staple cotton fibres they are based on. It is also treated with a PFC-free DWR (durable water repellant). This fabric is works by weaving together as many loosely twisted fibres as possible and when the fiber gets damp the yarn expands and seal sthe fabric to make it waterproof. Whilst it’s lightweight yet protective properties made it an ideal innovation for James Boogie who reinterpreted and augmented VENTILE® through the jackets. This is not, however, the only thing that makes VENTILE® unique – it is also the densest woven cotton fabric on the market with a hydrostatic head that can’t be matched – while retaining its breathability it is completely impenetrable to water molecules up to a water column of 600mm. Due to the incredibly dense structure of the fabric, Ventile is pre-treated and dyed using a specifically developed process to ensure the best possible dye penetration, while avoiding creases, stains, stripes and shading which would affect the end product. If the raw materials for Ventile Original are exclusive, then those for the Ventile Eco range are even more so. Ventile Eco Organic is made from sustainably grown organic certified cottons which have not been subjected to any pesticides or chemical fertilisers. While its lack of any PTFE membrane makes Ventile® the perfect ecological choice. We have used this prestigious fabric on two James Boogie jackets, JV_L24_ROYAL_BLUE and JV_L24_ANTIQUE_BRONZE.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="aspect-[4/5] relative overflow-hidden border border-black/5">
                <Image
                  src="/images/JV-lookbook.jpg"
                  alt="James Boogie Ventile Lookbook"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <div className="aspect-[4/5] relative overflow-hidden border border-black/5">
                <Image
                  src="/images/JV-lookbook2.jpg"
                  alt="James Boogie Ventile Lookbook 2"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
