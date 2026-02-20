import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Learn how James Boogie collects, uses, and protects your personal data.",
};

const lastUpdated = "February 2026";

export default function PrivacyPolicyPage() {
  return (
    <div className="flex-1 pt-32 pb-24 w-full">
        <div className="px-6 md:px-8 lg:px-12 space-y-24">
          {/* Header */}
          <header className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            <div className="md:col-span-4 lg:col-span-3">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight uppercase leading-none">
                Privacy<br />Policy
              </h1>
            </div>
            <div className="md:col-span-8 lg:col-span-9 pt-2 md:pt-4">
              <p className="text-sm text-muted-foreground uppercase tracking-widest">
                Last updated: {lastUpdated}
              </p>
            </div>
          </header>

          {/* Intro */}
          <section className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start border-t border-border pt-12">
            <div className="md:col-span-4 lg:col-span-3">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Introduction</span>
            </div>
            <div className="md:col-span-8 lg:col-span-6 prose prose-lg dark:prose-invert">
              <p className="text-foreground leading-relaxed italic">
                Transparency and trust are at the heart of the James Boogie movement. This page describes how we handle user data when you visit our website.
              </p>
            </div>
          </section>

          {/* 1. Information Collection */}
          <section className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start border-t border-border pt-12">
            <div className="md:col-span-4 lg:col-span-3">
              <h2 className="text-xl font-bold uppercase tracking-wide">
                1. Information We Collect
              </h2>
            </div>
            <div className="md:col-span-8 lg:col-span-8 space-y-6">
              <div className="prose dark:prose-invert text-foreground/70 max-w-none">
                <p>
                  We only collect information that you voluntarily provide to us. This may include:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>Newsletter Signup:</strong> Your email address if you choose to join our community.</li>
                  <li><strong>Contact:</strong> Any details provided when reaching out to us via email or contact forms.</li>
                  <li><strong>Technical Data:</strong> For security and performance, we may collect anonymous data such as IP addresses, browser types, and device information.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 2. Usage */}
          <section className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start border-t border-border pt-12">
            <div className="md:col-span-4 lg:col-span-3">
              <h2 className="text-xl font-bold uppercase tracking-wide">
                2. How We Use Your Information
              </h2>
            </div>
            <div className="md:col-span-8 lg:col-span-8 space-y-6">
              <div className="prose dark:prose-invert text-foreground/70 max-w-none">
                <p>Your information is used solely to enhance your connection with the brand:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>To respond to your inquiries and provide support.</li>
                  <li>To send newsletters, updates, and exclusive previews (only if you opt-in).</li>
                  <li>To improve our website functionality and user experience.</li>
                  <li>To monitor security and prevent fraudulent activity.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 3. Cookies */}
          <section className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start border-t border-border pt-12">
            <div className="md:col-span-4 lg:col-span-3">
              <h2 className="text-xl font-bold uppercase tracking-wide">
                3. Cookies
              </h2>
            </div>
            <div className="md:col-span-8 lg:col-span-8">
              <p className="text-foreground/70 leading-relaxed max-w-2xl">
                We use cookies to improve your browsing experience and analyze website traffic. Cookies help us remember your preferences and understand how you interact with our content. Third-party services, such as Google Analytics, may also set cookies to provide us with performance data.
              </p>
              <p className="text-sm text-muted-foreground mt-4">
                You can choose to disable cookies through your browser settings at any time.
              </p>
            </div>
          </section>

          {/* 4. Third-Party */}
          <section className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start border-t border-border pt-12">
            <div className="md:col-span-4 lg:col-span-3">
              <h2 className="text-xl font-bold uppercase tracking-wide">
                4. Third-Party Services
              </h2>
            </div>
            <div className="md:col-span-8 lg:col-span-8">
              <p className="text-foreground/70 leading-relaxed max-w-2xl">
                To provide a seamless experience, we occasionally use trusted third-party providers for analytics, hosting, and email communications. These providers process data according to their own privacy policies and are required to maintain the highest levels of security.
              </p>
            </div>
          </section>

          {/* 5. Security */}
          <section className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start border-t border-border pt-12">
            <div className="md:col-span-4 lg:col-span-3">
              <h2 className="text-xl font-bold uppercase tracking-wide">
                5. Data Security
              </h2>
            </div>
            <div className="md:col-span-8 lg:col-span-8">
              <p className="text-foreground/70 leading-relaxed max-w-2xl">
                We take reasonable technical and organizational measures to protect your personal data. However, please be aware that no digital system is 100% secure. We limit access to your personal information to those who have a business need to know.
              </p>
            </div>
          </section>

          {/* 6. Rights */}
          <section className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start border-t border-border pt-12">
            <div className="md:col-span-4 lg:col-span-3">
              <h2 className="text-xl font-bold uppercase tracking-wide">
                6. Your Rights
              </h2>
            </div>
            <div className="md:col-span-8 lg:col-span-8">
              <p className="text-foreground/70 leading-relaxed max-w-2xl">
                You have the right to access the personal data we hold about you, request corrections, or ask for its deletion. You may withdraw your consent for communications at any time by clicking the &ldquo;unsubscribe&rdquo; link in our emails or contacting us directly.
              </p>
            </div>
          </section>

          {/* 7. Changes */}
          <section className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start border-t border-border pt-12">
            <div className="md:col-span-4 lg:col-span-3">
              <h2 className="text-xl font-bold uppercase tracking-wide">
                7. Changes to This Policy
              </h2>
            </div>
            <div className="md:col-span-8 lg:col-span-8">
              <p className="text-foreground/70 leading-relaxed max-w-2xl">
                James Boogie reserves the right to update this Privacy Policy from time to time. Any changes will be posted on this page with an updated &ldquo;Last updated&rdquo; date.
              </p>
            </div>
          </section>

          {/* 8. Contact */}
          <section className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start border-t border-border pt-12 pb-12">
            <div className="md:col-span-4 lg:col-span-3">
              <h2 className="text-xl font-bold uppercase tracking-wide">
                8. Contact Us
              </h2>
            </div>
            <div className="md:col-span-8 lg:col-span-8 space-y-6">
              <p className="text-foreground/70 max-w-2xl">
                If you have any questions regarding this Privacy Policy or how we handle your data, please reach out to us:
              </p>
              <div className="space-y-1">
                <p className="font-bold">JAMES BOOGIE</p>
                <a 
                  href="mailto:contact@jamesboogie.com" 
                  className="text-foreground underline underline-offset-4 hover:text-muted-foreground transition-colors"
                >
                  contact@jamesboogie.com
                </a>
              </div>
            </div>
          </section>
        </div>
    </div>
  );
}
