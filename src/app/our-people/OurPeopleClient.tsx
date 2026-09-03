"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const TEAM = [
  {
    name: "M AKBAR RAFSANJANI",
    role: "Founder & Chief Executive Officer",
    bio: "When I was a child, I enjoyed drawing and had a slightly different personality compared to my peers. At the age of 15, precisely when I entered middle school, I developed a strong interest in films set during World War era and movies portraying teenage mischief from Britain, which eventually led to my fascination with delving into vintage military fashion and British subculture fashion. My interest in fashion emerged organically, and I always felt confident in standing out in my appearance, often becoming the center of attention. I never thought of becoming a fashion designer. The rigors of life and artistic culture have accompanied my life journey until finally in 2017, God gave me the inspiration to build a brand called “JAMES BOOGIE”. At James Boogie, I always pour all my life experiences into fashion as a medium for self-expression. I do what I love and don’t pay too much attention to the noise of the fashion industry. It’s all about feeling and satisfaction in building James Boogie.",
    image: "https://vps.jamesboogie.com/wp-content/uploads/2026/02/Jebs.jpg", 
    alt: "James Boogie - Founder & Creative Director portrait"
  },
  {
    name: "ERRY FERDIANTO",
    role: "Chief Operating Officer",
    bio: "Good work starts with honesty. In a world where trends change so quickly, staying true to what we believe in is more important than ever. Every product starts with an idea, a story, and a genuine passion for creating something meaningful. Rather than chasing trends, the focus is on making products with character, quality, and attention to detail. Success is not about being the loudest brand or following every trend. It is about creating with honesty, staying consistent with our values, and making products that people can truly appreciate and enjoy for years to come.",
    image: "https://vps.jamesboogie.com/wp-content/uploads/2026/02/Om-hers-scaled.jpg", 
    alt: "Erry Ferdianto - COO portrait"
  },
  {
    name: "DICKY FIRMANSYAH",
    role: "Chief Marketing Officer",
    bio: "The fashion industry often prioritizes speed and cost efficiency to maximize profits. Low prices for the latest styles may seem like a good deal, but these apparent savings often come at significant environmental and social costs. I share the same concerns regarding the fashion industry’s impact on the environment and society. Slow fashion advocates for a different approach—it’s about designing, producing, consuming, and living in a more sustainable and mindful way. So, I encourage you to choose slow fashion. Choose James Boogie, where we prioritize sustainability and ethical practices in every aspect of our work.",
    image: "https://vps.jamesboogie.com/wp-content/uploads/2026/02/Pa-Dikey-scaled.jpg", 
    alt: "Dicky Firmansyah - CMO portrait"
  },
  {
    name: "ALGHIFARI KHAIRUNA",
    role: "Full Stack Developer and Graphic Designer",
    bio: "I started this adventure by participating in James Boogie's Design Assets, of which I am the Graphic Designer. My practice is geared towards the cross-pollination of different fields and inspirations. Based on a thorough visual research, spanning from Hand-drawing, to visual arts. my artistic identity benefits from a layered approach to image making. With a specific attention to lighting and mood, and a strong interest in body anatomy as a way to investigate form, my practice aims to create the perfect balance between the subject's peculiarities and my signature style. I was born in Bandung, where I live and work for James Boogie and take responsibilities for Website and Commercial System",
    image: "https://vps.jamesboogie.com/wp-content/uploads/2026/02/Rev-1-of-1-scaled.jpg", 
    alt: "Alghifari Khairuna - Full Stack Developer and Graphic Designer portrait"
  },
  {
    name: "MEGA WASTUKENCANA",
    role: "Videographer and Graphic Designer",
    bio: "I began my journey at James Boogie in 2020 as a Freelancer in the photography & videography department. In 2023, I took on the responsibility for James Boogie’s social media visuals. Between 2020-2023, I also ventured into the filmmaking department for 2 years. After that, my instinct remained in the world of fashion, particularly fashion photography and videography. Being at James Boogie subdued my hunger for capturing fashion visuals. Until now, I still feel hungry.",
    image: "https://vps.jamesboogie.com/wp-content/uploads/2026/02/Rev2-1-of-1-scaled.jpg", 
    alt: "Mega Wastukencana - Videographer and Graphic Designer portrait"
  },
  {
    name: "MARWAN SEVANTA",
    role: "Production Coordinator",
    bio: "Let me introduce myself, I'm Marwan. I've been with James Boogie since 2022, initially starting as a shopkeeper. Immersing myself in the world of James Boogie products was a novel experience, allowing me to grasp their distinctive character. In the past year, I earned a promotion to the production department, where I’ve been responsible for overseeing the production flow. I utilize my problem-solving skills to efficiently address any issues that arise during production. I am deeply committed to continually learning about James Boogie and its unique characteristics. My goal is to leverage this knowledge to consistently provide the best possible experience for our customers",
    image: "https://vps.jamesboogie.com/wp-content/uploads/2026/02/Marwan-cina-scaled.jpg", 
    alt: "Marwan Sevanta - Production Coordinator portrait"
  },
  {
    name: "RIZAL PRATAMA",
    role: "Research And Development",
    bio: "Joined in February 2024, a fashion enthusiast. Interested in deconstructing jackets, especially military based jackets.",
    image: "https://vps.jamesboogie.com/wp-content/uploads/2026/09/OUR-PEOPLE-5-2-scaled.jpg", 
    alt: "Rizal Pratama - Research And Development portrait"
  },
  {
    name: "M FATHUROCHMAN",
    role: "Sales Associate",
    bio: "I'm also called Kentob, joined James Boogie at the beginning of 2024 and a lot here I learned a lot with everyone in the james boogie division. now I'm in the warehouse and shopkeeper division",
    image: "https://vps.jamesboogie.com/wp-content/uploads/2026/02/Kentob-scaled.jpg", 
    alt: "M Fathurochman - Sales Associate portrait"
  },
  {
    name: "RIFQI MAULANA",
    role: "Content Writer",
    bio: "Starting the journey as a journalist in one of the national media who based in Bandung. I’m a copywriter with a strong passion for fashion and other youth culture. Contributing at James Boogie since 2024. My work blends storytelling with a sharp eye for detail, especially when it comes to exploring different fashion cultures and aesthetics. I’m particularly drawn to workwear and military-inspired styles—both for their functionality and rich historical context. Through my writing, I aim to unpack the layers behind these fashion movements and share the stories that make them compelling",
    image: "https://vps.jamesboogie.com/wp-content/uploads/2026/02/Profile-Pic-QQ-scaled.jpg", 
    alt: "Rifqi Maulana - Content Writer portrait"
  },
  {
    name: "VEGGA SEPTIAN",
    role: "Marketing Communication",
    bio: "I'm Vegga Septian Mulyawan, a creative problem-solver who thrives on discovering unconventional solutions and infusing every project with passion and originality. Every challenge is an opportunity to learn, grow, and push boundaries—and every lesson I learn, no matter how small, finds its way into my work at James Boogie, where I'm committed to delivering nothing but the best. Beyond creativity, I deeply value strong collaboration and meaningful connections, ensuring that every project is not only successful but also leaves a lasting impact. Outside of work, I'm passionate about music, film, and various forms of art and entertainment—because inspiration can come from anywhere.",
    image: "https://vps.jamesboogie.com/wp-content/uploads/2026/02/Profile-Pic-Kapeg-scaled.jpg", 
    alt: "Vegga Septian - Marketing Communication portrait"
  },
  {
    name: "AKHIL VIRGIAWAN",
    role: "Sales Associate",
    bio: "James Boogie has never felt foreign to me. it grew from the very same place that shaped me",
    image: "https://vps.jamesboogie.com/wp-content/uploads/2026/02/Profile-Pic-Akil-scaled.jpg", 
    alt: "Akhil Virgiawan - Sales Associate portrait"
  },
  {
    name: "SAMIR ASWADIE",
    role: "Sales Advisor",
    bio: "Part of the team behind James Boogie, taking care of customer relations, online orders, and the details that complete the experience of the brand.",
    image: "https://vps.jamesboogie.com/wp-content/uploads/2026/02/Profile-Pic-Omkuh-scaled.jpg", 
    alt: "Samir Aswadie - Sales Advisor portrait"
  },
  {
    name: "HELMY ADAM",
    role: "Photographer",
    bio: "With a background in journalism and a focus on photojournalism, I eventually found my way into a career as a product photographer. When I first joined James Boogie, I worked closely with the Quality Control team. After some time, I was given the opportunity to join the Creative Team as a photographer. I was excited about the opportunity and genuinely enjoyed the work.",
    image: "https://vps.jamesboogie.com/wp-content/uploads/2026/09/OUR-PEOPLE-8-scaled.jpg", 
    alt: "Helmy Adam - Photographer portrait"
  },
  {
    name: "YOGI GUNAWAN",
    role: "Research & Development",
    bio: "Finding my way to the James Boogie family was no coincidence; it was all part of God's plan. I hope to contribute goodness to this family, not only in this world but also in a way that proves beneficial for the eternal life God has promised.",
    image: "https://vps.jamesboogie.com/wp-content/uploads/2026/09/OUR-PEOPLE-4-scaled.jpg", 
    alt: "Yogi Gunawan - Photographer portrait"
  },
  {
    name: "M FERRY S",
    role: "Sales Associate",
    bio: "My name is Muhammad Ferry Sodikin, but I'm more often called Phey. It's simpler, more casual, and more personal. I joined James Boogie with a personal mission: to help develop this brand and take it 10 steps ahead of other brands in Indonesia, while building a presence that can be recognized around the world—especially across Asia, Europe, and America. My message is simple, never be afraid or ashamed to learn, and never stop learning. Because even the smallest things can teach us something valuable, and from those small things, we can create changes that lead to something much bigger.",
    image: "https://vps.jamesboogie.com/wp-content/uploads/2026/09/OUR-PEOPLE-6-scaled.jpg", 
    alt: "M Ferry S - Photographer portrait"
  },
  {
    name: "KURNIAWAN",
    role: "Head Quality Control",
    bio: "It all started when a friend introduced me to the James Boogie brand in 2022, prompting me to begin collecting some of their products. Then, in April 2025 following a rather complicated yet amusing series of events. I joined the James Boogie team, where I remain to this day.",
    image: "https://vps.jamesboogie.com/wp-content/uploads/2026/09/OUR-PEOPLE-7-scaled.jpg", 
    alt: "Kurniawan - Head Quality Control portrait"
  },
  {
    name: "HENDRA KURNIA",
    role: "Product Developer",
    bio: "Being parts of James Boogie aligned creative team is in line with a personal vision that feels challenges to explore fashionable jacket design models.",
    image: "https://vps.jamesboogie.com/wp-content/uploads/2026/09/OUR-PEOPLE-2-scaled.jpg", 
    alt: "Hendra Kurnia - Product Developer portrait"
  },
  {
    name: "MUSTOFA RISQI",
    role: "Product Designer",
    bio: "I've been passionate about drawing since I was a kid, which eventually led me to study Visual Communication Design and Product Design. Along the way, I developed a strong interest in fashion and exploring new creative ideas. I joined James Boogie as a university intern and later became part of the R&D team. Today, I focus on developing fresh ideas and turning sketches into products that people can actually wear. What I enjoy most is seeing an idea come to life—from a simple sketch on paper into a finished product.",
    image: "https://vps.jamesboogie.com/wp-content/uploads/2026/09/OUR-PEOPLE-10-scaled.jpg", 
    alt: "Mustofa Risqi - Product Designer portrait"
  },
  {
    name: "REHAN PRATAMA",
    role: "Quality Control Staff",
    bio: "Starting my career at James Boogie as a Quality Control in 2025 since James Boogie started the Fancy season. From the beginning I knew very well that James Boogie is not just an ordinary brand, he shows his pop military identity which is so thick and very professional in his field. so what I always do is always guided by There is a soul in every product. that every product that I work on really has its own soul, making sure that everything I do is in accordance with what has become a provision for james boogie, so that everyone who wears products from james boogie feels so proud and comfortable with what he wears. and lastly for me james boogie is not just A brand, but an identity and family so I will always serve and dedicate my life to James Boogie.",
    image: "https://vps.jamesboogie.com/wp-content/uploads/2026/09/OUR-PEOPLE-1-scaled.jpg", 
    alt: "Rehan Pratama - Quality Control Staff portrait"
  },
  {
    name: "ILHAM FATHIR",
    role: "Quality Control Staff",
    bio: "It all started with an invitation from a friend joining James Boogie was a new experience for me one that stood in stark contrast to my previous work background. I learned how to work in the creative industry and the importance of constantly exploring new possibilities. A new family, a new journey, and a new spirit.",
    image: "https://vps.jamesboogie.com/wp-content/uploads/2026/09/OUR-PEOPLE-9-scaled.jpg", 
    alt: "Ilham Fathir - Quality Control Staff portrait"
  },
  {
    name: "KIKI MUHAMMAD",
    role: "Office Assistant",
    image: "https://vps.jamesboogie.com/wp-content/uploads/2026/09/OUR-PEOPLE-3-scaled.jpg", 
    alt: "Kiki Muhammad - Office Assistant portrait"
  },
  {
    name: "FIKRI SYABAN ALGHIFARI",
    role: "Quality Control Staff",
    bio: "Hello, I am Fikri, and I am often called Tarjoe by some of my close relatives. Visuals and fashion have always drawn me to learn about and dive into this industry. I started my career as a Quality Control in 2025, and as time went on, by the will and permission of Allah, I had the opportunity to join the Quality Control team at James Boogie. Working with the incredible people there has been one of the most unimaginable moments of my life. I also want to thank my wife, parents, and friends who always pray for the best in my life. I hope my presence on the James Boogie team will bring positive value to both the team and the company.",
    image: "https://vps.jamesboogie.com/wp-content/uploads/2026/09/OUR-PEOPLE-11-scaled.jpg", 
    alt: "Fikri Syaban Alghifari - Quality Control Staff"
  },
];

export function OurPeopleClient() {
  return (
    <div className="flex-1 min-h-screen pt-24 bg-white text-black">
        {/* Page Hero */}
        <section className="px-6 md:px-8 lg:px-12 py-24 md:py-32 border-b border-neutral-100">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-4xl lg:text-5xl font-bold uppercase tracking-tighter leading-none mb-12">
              Our People
            </h1>
            <p className="text-xl md:text-xl font-light text-neutral-600 max-w-2xl leading-relaxed italic">
              The hands, minds, and spirits behind James Boogie. A collective dedicated to craftsmanship, passion, and the evolution of the Pop Military brand.
            </p>
          </div>
        </section>

        {/* Team Sections */}
        <div className="flex flex-col">
          {TEAM.map((person, index) => (
            <section 
              key={person.name}
              className={cn(
                "flex flex-col md:flex-row items-stretch min-h-[70vh] lg:min-h-screen border-b border-neutral-100",
                index % 2 !== 0 && "md:flex-row-reverse"
              )}
            >
              {/* Image Content */}
              <div className="w-full md:w-1/2 relative min-h-[500px] md:min-h-auto bg-neutral-100 overflow-hidden group">
                <Image
                  src={person.image}
                  alt={person.alt}
                  fill
                  className="object-cover object-top grayscale hover:grayscale-0 transition-all duration-700 ease-in-out"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority={index === 0}
                />
              </div>

              {/* Text Content */}
              <div className="w-full md:w-1/2 flex items-start justify-center pt-10 pb-10 px-10 bg-white">
                <div className="w-full space-y-12">
                  <header className="space-y-2">
                    <h2 className="text-base font-bold uppercase tracking-wider">
                      {person.name}
                    </h2>
                    <span className="block text-xs font-bold tracking-widest text-neutral-400 uppercase">
                      {person.role}
                    </span>
                  </header>
                  
                  <div className="space-y-8">
                    <p className="text-sm text-neutral-600 font-light leading-relaxed">
                      {person.bio}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          ))}
        </div>

        {/* Footer Navigation */}
        <section className="px-6 md:px-8 lg:px-12 py-24 bg-neutral-50 border-t border-neutral-100 text-center">
          <div className="max-w-2xl mx-auto space-y-12">
            <h3 className="text-3xl font-bold uppercase tracking-tight">
              Discover Our Journey
            </h3>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link 
                href="/our-story"
                className="group flex items-center gap-3 text-sm font-bold tracking-widest uppercase pb-1 border-b-2 border-transparent hover:border-black transition-all"
              >
                Our Story
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="/shop"
                className="group flex items-center gap-3 text-sm font-bold tracking-widest uppercase pb-1 border-b-2 border-transparent hover:border-black transition-all"
              >
                Explore Collections
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </section>
    </div>
  );
}
