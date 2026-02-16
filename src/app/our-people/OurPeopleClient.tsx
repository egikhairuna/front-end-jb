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
    bio: "As a pivotal part of my responsibilities, I serve as a conduit for ideas originating from the CEO and my team. One of my primary objectives is to ensure smooth operational flow within the company, strategically maximizing efficiency. I am deeply involved in maintaining and enhancing the standards of our products and services through rigorous quality control measures. Financial management is another crucial aspect of my role. I am accountable for formulating and managing budgets, meticulously monitoring expenditures, and safeguarding the company’s cash flow to ensure financial sustainability, steering the company towards long-term success and resilience amidst economic uncertainties. Through a strategic foresight, careful planning, and decisive action, I strive to drive the company towards sustainable growth and success in a dynamic and competitive business landscape.",
    image: "https://vps.jamesboogie.com/wp-content/uploads/2026/02/Om-hers-scaled.jpg", 
    alt: "Elena Rossetic - Head of Operations portrait"
  },
  {
    name: "DICKY FIRMANSYAH",
    role: "Chief Marketing Officer",
    bio: "The fashion industry often prioritizes speed and cost efficiency to maximize profits. Low prices for the latest styles may seem like a good deal, but these apparent savings often come at significant environmental and social costs. I share the same concerns regarding the fashion industry’s impact on the environment and society. Slow fashion advocates for a different approach—it’s about designing, producing, consuming, and living in a more sustainable and mindful way. So, I encourage you to choose slow fashion. Choose James Boogie, where we prioritize sustainability and ethical practices in every aspect of our work.",
    image: "https://vps.jamesboogie.com/wp-content/uploads/2026/02/Pa-Dikey-scaled.jpg", 
    alt: "Thomas Vander - Master Craftsman portrait"
  },
  {
    name: "ALGHIFARI KHAIRUNA",
    role: "Full Stack Developer and Graphic Designer",
    bio: "I started this adventure by participating in James Boogie’s Design Assets, of which I am the Graphic Designer. My practice is geared towards the cross-pollination of different fields and inspirations. Based on a thorough visual research, spanning from Hand-drawing, to visual arts. my artistic identity benefits from a layered approach to image making. With a specific attention to lighting and mood, and a strong interest in body anatomy as a way to investigate form, my practice aims to create the perfect balance between the subject’s peculiarities and my signature style. My first significant venture is represented by the fashion field, where I currently collaborate with the most important majors in the Indonesian Brand. Later, Among my projects, the most important are: James Boogie X Maternal. an crisp alliance between two syndicates of polar opposites. James Boogie and Maternal team up to collaborate for the first time. This collaboration synthesizes two ideas and gave birth to limited edition items influenced by the culture of military fashion pop culture. I was born in Bandung, where I live and work for James Boogie and take responsibilities for Website and Commercial System",
    image: "https://vps.jamesboogie.com/wp-content/uploads/2026/02/Rev-1-of-1-scaled.jpg", 
    alt: "Elena Rossetic - Head of Operations portrait"
  },
  {
    name: "MEGA WASTUKENCANA",
    role: "Videographer and Graphic Designer",
    bio: "I began my journey at James Boogie in 2020 as a Freelancer in the photography & videography department. In 2023, I took on the responsibility for James Boogie’s social media visuals. Between 2020-2023, I also ventured into the filmmaking department for 2 years. After that, my instinct remained in the world of fashion, particularly fashion photography and videography. Being at James Boogie subdued my hunger for capturing fashion visuals. Until now, I still feel hungry.",
    image: "https://vps.jamesboogie.com/wp-content/uploads/2026/02/Rev2-1-of-1-scaled.jpg", 
    alt: "Elena Rossetic - Head of Operations portrait"
  },
  {
    name: "MARWAN SEVANTA",
    role: "Production Coordinator",
    bio: "Let me introduce myself, I’m Marwan. I’ve been with James Boogie since 2022, initially starting as a shopkeeper. Immersing myself in the world of James Boogie products was a novel experience, allowing me to grasp their distinctive character. In the past year, I earned a promotion to the production department, where I’ve been responsible for overseeing the production flow. I utilize my problem-solving skills to efficiently address any issues that arise during production. I am deeply committed to continually learning about James Boogie and its unique characteristics. My goal is to leverage this knowledge to consistently provide the best possible experience for our customers",
    image: "https://vps.jamesboogie.com/wp-content/uploads/2026/02/Marwan-cina-scaled.jpg", 
    alt: "Elena Rossetic - Head of Operations portrait"
  },
  {
    name: "RIZAL PRATAMA",
    role: "Research And Development",
    bio: "Joined in February, a fashion enthusiast. Interested in deconstructing jackets, especially military based jackets.",
    image: "https://vps.jamesboogie.com/wp-content/uploads/2026/02/Mang-Ijal-scaled.jpg", 
    alt: "Elena Rossetic - Head of Operations portrait"
  },
  {
    name: "ARIF MULYANA",
    role: "Quality Control",
    bio: "As an aspiring professional in the world of fashion, I am grateful to James Boogie for providing me with the opportunity to join their esteemed team. This marks the beginning of my career journey in the fashion industry, leveraging my background and passion for all things fashion-related. At James Boogie, I have actively engaged with my peers, exchanging ideas, and experiences, thereby expanding my knowledge and perspective within this creative space. Through collaboration and learning, I strive to continually broaden my skill set and insights, contributing meaningfully to the innovative endeavors of the team.",
    image: "https://vps.jamesboogie.com/wp-content/uploads/2026/02/Mang-Aiphone-scaled.jpg", 
    alt: "Elena Rossetic - Head of Operations portrait"
  },
    {
    name: "M FATHUROCHMAN",
    role: "Sales Associate",
    bio: "",
    image: "https://vps.jamesboogie.com/wp-content/uploads/2026/02/Kentob-scaled.jpg", 
    alt: "Elena Rossetic - Head of Operations portrait"
  },
  {
    name: "RIFQI MAULANA",
    role: "Content Writer",
    bio: "Starting the journey as a journalist in one of the national media who based in Bandung. I’m a copywriter with a strong passion for fashion and other youth culture. Contributing at James Boogie since 2024. My work blends storytelling with a sharp eye for detail, especially when it comes to exploring different fashion cultures and aesthetics. I’m particularly drawn to workwear and military-inspired styles—both for their functionality and rich historical context. Through my writing, I aim to unpack the layers behind these fashion movements and share the stories that make them compelling",
    image: "https://vps.jamesboogie.com/wp-content/uploads/2026/02/Profile-Pic-QQ-scaled.jpg", 
    alt: "Elena Rossetic - Head of Operations portrait"
  },
  {
    name: "VEGGA SEPTIAN",
    role: "Marketing Communication",
    bio: "",
    image: "https://vps.jamesboogie.com/wp-content/uploads/2026/02/Profile-Pic-Kapeg-scaled.jpg", 
    alt: "Elena Rossetic - Head of Operations portrait"
  },
  {
    name: "AKHIL VIRGIAWAN",
    role: "Sales Associate",
    bio: "",
    image: "https://vps.jamesboogie.com/wp-content/uploads/2026/02/Profile-Pic-Akil-scaled.jpg", 
    alt: "Elena Rossetic - Head of Operations portrait"
  },
  {
    name: "SAMIR ASWADIE",
    role: "Sales Associate",
    bio: "",
    image: "https://vps.jamesboogie.com/wp-content/uploads/2026/02/Profile-Pic-Omkuh-scaled.jpg", 
    alt: "Elena Rossetic - Head of Operations portrait"
  }
];

export function OurPeopleClient() {
  return (
    <div className="flex-1 min-h-screen pt-24 bg-white text-black">
        {/* Page Hero */}
        <section className="px-6 md:px-12 lg:px-10 py-24 md:py-32 border-b border-neutral-100">
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
        <section className="px-6 md:px-12 lg:px-24 py-24 bg-neutral-50 border-t border-neutral-100 text-center">
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
