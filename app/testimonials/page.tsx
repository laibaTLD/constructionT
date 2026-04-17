'use client';

import { useState, useEffect } from 'react';
import { TestimonialsSection } from '@/app/components/sections/TestimonialsSection';
import { Header } from '@/app/components/layout/Header';
import { Footer } from '@/app/components/layout/Footer';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';

interface Testimonial {
  _id: string;
  name: string;
  role?: string;
  company?: string;
  content: any;
  rating?: number;
  avatar?: string;
  featured?: boolean;
  enabled?: boolean;
}

interface TestimonialsData {
  testimonials: Testimonial[];
  title: string;
  description: string;
}

export default function TestimonialsPage() {
  const { site } = useWebBuilder();
  const [testimonialsData, setTestimonialsData] = useState<TestimonialsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        if (!site?._id) {
          setLoading(false);
          return;
        }

        // Get auth token from localStorage
        const token = localStorage.getItem('accessToken') || 
                      localStorage.getItem('token') || 
                      localStorage.getItem('auth_token');
        
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`/api/testimonials?siteId=${site._id}`, {
          headers,
        });

        if (!response.ok) {
          throw new Error('Failed to fetch testimonials');
        }

        const data = await response.json();
        
        if (data.success && data.data) {
          // Map testimonials to match the expected structure (text instead of content)
          const mappedTestimonials = (data.data.testimonials || []).map((t: any) => ({
            ...t,
            text: t.content || t.text || '', // Use content if available, fallback to text
          }));
          
          setTestimonialsData({
            testimonials: mappedTestimonials,
            title: data.data.title || 'Client Testimonials',
            description: data.data.description || 'Hear what our clients have to say about our services',
          });
        }
      } catch (err) {
        console.error('Error fetching testimonials:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, [site?._id]);

  // Default testimonials section configuration
  const defaultTestimonialsSection = {
    enabled: true,
    title: { 
      type: 'doc', 
      content: [{ type: 'paragraph', content: [{ type: 'text', text: testimonialsData?.title || 'Client Testimonials' }] }] 
    },
    description: { 
      type: 'doc', 
      content: [{ type: 'paragraph', content: [{ type: 'text', text: testimonialsData?.description || 'Hear what our clients have to say about our services' }] }] 
    },
    testimonials: testimonialsData?.testimonials || [],
  };

  // Use fetched data or defaults
  const testimonialsSection = defaultTestimonialsSection;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-1">
        {loading ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <TestimonialsSection testimonialsSection={testimonialsSection} />
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
