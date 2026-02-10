import React from 'react';

export const StoryHero: React.FC = () => {
  return (
    <section className="pt-32 pb-16 md:pt-40 md:pb-24 px-4 sm:px-6 lg:px-12 w-full text-center">
      <div className="space-y-6">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground uppercase">
          Our Story
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed">
          &ldquo;A journey shaped by passion, craftsmanship, and time.&rdquo;
        </p>
      </div>
      
      {/* Visual Divider / Accent */}
      <div className="mt-16 flex justify-center">
        <div className="h-px w-24 bg-foreground/20" />
      </div>
    </section>
  );
};
