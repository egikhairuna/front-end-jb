import { Metadata } from 'next';
import { OurPeopleClient } from "./OurPeopleClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: 'Our People',
  description: 'Meet the visionaries, designers, and craftsmen behind James Boogie. Discover our commitment to quality, heritage, and the Pop Military aesthetic.',
  openGraph: {
    title: 'Our People',
    description: 'The visionaries and artisans defining the future of Pop Military style.',
    type: 'profile',
  },
};

export default function OurPeoplePage() {
  const peopleSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "item": {
          "@type": "Person",
          "name": "M AKBAR RAFSANJANI",
          "jobTitle": "Founder & Chief Executive Officer",
          "description": "Founder and CEO of James Boogie, redefining vintage military and British subculture fashion since 2017.",
          "image": "https://jamesboogie.com/images/our-people-akbar.jpg"
        }
      },
      {
        "@type": "ListItem",
        "position": 2,
        "item": {
          "@type": "Person",
          "name": "ERRY FERDIANTO",
          "jobTitle": "Chief Operating Officer",
          "description": "COO of James Boogie, managing operational flow and financial sustainability.",
          "image": "https://jamesboogie.com/images/our-people-erry.jpg"
        }
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(peopleSchema) }}
      />
      <OurPeopleClient />
    </>
  );
}
