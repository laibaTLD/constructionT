'use client';

import { ContactSection } from '@/app/components/sections/ContactSection';
import { Header } from '@/app/components/layout/Header';
import { Footer } from '@/app/components/layout/Footer';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';

export default function ContactPage() {
  const { site } = useWebBuilder();

  // Use site contactSection if available, otherwise create default contact section config
  const contactSection = site?.contactSection ? {
    ...site.contactSection,
    showMap: true // Ensure map is shown on dedicated contact page
  } : {
    enabled: true,
    title: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'CONTACT US' }] }] },
    description: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: "Have a question or want to work together? We'd love to hear from you." }] }] },
    showForm: true,
    showMap: true,
    showContactInfo: true,
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <Header />

      {/* Main Content - Contact Section */}
      <main className="flex-1">
        <ContactSection contactSection={contactSection} />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
