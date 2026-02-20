import { Metadata } from 'next';
import { Navbar } from '@/components/layout/Navbar';
import { StoryHero } from '@/components/story/StoryHero';
import { StoryTimeline } from '@/components/story/StoryTimeline';
import { STORY_DATA } from '@/constants/story-data';

export const metadata: Metadata = {
  title: 'Our Story',
  description: 'Explore the history of James Boogie from 2017 to today. Discover our journey of craftsmanship, passion, and the evolution of our Pop Military aesthetic.',
  openGraph: {
    title: 'Our Story',
    description: 'The journey of James Boogie, a Pop Military brand defined by craftsmanship and time.',
    images: ['/images/story-og.jpg'],
  },
};

export const dynamic = "force-dynamic";

export default function OurStoryPage() {
  // Structured Data for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "mainEntity": {
      "@type": "Organization",
      "name": "James Boogie",
      "foundingDate": "2017",
      "description": "A premium Pop Military brand blending military heritage with contemporary street culture.",
      "history": STORY_DATA.map(item => ({
        "@type": "Event",
        "name": item.title,
        "startDate": item.year,
        "description": item.description
      }))
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <div className="flex flex-col min-h-screen">
        <StoryHero />
        <StoryTimeline />
      </div>
    </>
  );
}
