'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { blogApi } from '@/app/lib/api';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { Header } from '@/app/components/layout/Header';
import { BlogPost } from '@/app/lib/types';
import { getImageSrc } from '@/app/lib/utils';
import { SeoHead } from '@/app/components/ui/SeoHead';
import { truncate } from '@/app/lib/seo';
import { useThemeColors, useThemeFonts } from '@/app/hooks/useTheme';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

export default function BlogPageContent() {
    const { site, loading: siteLoading } = useWebBuilder();
    const themeColors = useThemeColors();
    const themeFonts = useThemeFonts();
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const sectionsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        async function loadPosts() {
            if (!site) return;
            try {
                setLoading(true);
                const data = await blogApi.getPostsBySite(site.slug);
                const publishedPosts = data.filter(post => post.status === 'published');
                setPosts(publishedPosts);
            } catch (err) {
                console.error('Failed to load blog posts:', err);
            } finally {
                setLoading(false);
            }
        }
        if (!siteLoading) loadPosts();
    }, [site, siteLoading]);

    useGSAP(() => {
        if (loading || posts.length === 0 || !sectionsRef.current || !scrollContainerRef.current) return;

        gsap.registerPlugin(ScrollTrigger);

        const target = sectionsRef.current;
        
        // The distance we need to move is the total width minus the visible window width
        const getScrollAmount = () => {
            return -(target.scrollWidth - window.innerWidth);
        };

        const tween = gsap.to(target, {
            x: getScrollAmount,
            ease: "none",
            scrollTrigger: {
                trigger: scrollContainerRef.current,
                start: "top top",
                end: () => `+=${target.scrollWidth}`,
                pin: true,
                scrub: 1, // Smoothly catches up to scroll position
                invalidateOnRefresh: true, // Recalculates on resize
            }
        });

        return () => {
            tween.kill();
            ScrollTrigger.getAll().forEach(t => t.kill());
        };
    }, { dependencies: [loading, posts.length], scope: scrollContainerRef });

    if (siteLoading || loading) {
        return (
            <div className="h-screen flex items-center justify-center" style={{ backgroundColor: themeColors.pageBackground }}>
                <div className="animate-pulse opacity-50 uppercase tracking-widest text-xs">Loading Blogs...</div>
            </div>
        );
    }

    const siteName = site?.business?.name || site?.name || 'Caledonian';
    const seoTitle = `Projects | ${siteName}`;

    return (
        <div className="relative" style={{ backgroundColor: themeColors.pageBackground }}>
            <SeoHead title={seoTitle} canonicalPath="/blog" ogType="website" />
            
            <Header />

            {/* GSAP Trigger Container */}
            <main ref={scrollContainerRef} className="h-screen overflow-hidden flex flex-col">
                
                {/* Content wrapper that actually slides */}
                <div 
                    ref={sectionsRef} 
                    className="flex h-full w-max will-change-transform"
                >
                    {/* Intro Panel */}
                    <section 
                        className="w-[40vw] md:w-[30vw] h-full flex flex-col justify-center px-12 lg:px-20 border-r flex-shrink-0" 
                        style={{ borderColor: `${themeColors.secondaryText}15` }}
                    >
                        <h1 
                            className="text-3xl lg:text-5xl font-light tracking-tighter mb-4"
                            style={{ color: themeColors.lightPrimaryText, fontFamily: themeFonts.heading }}
                        >
                            {siteName}
                        </h1>
                        <p 
                            className="text-xs uppercase tracking-[0.4em] font-medium"
                            style={{ color: themeColors.primaryButton, fontFamily: themeFonts.body }}
                        >
                            Selected Blogs
                        </p>
                    </section>

                    {/* Blog Post Panels */}
                    {posts.map((post) => (
                        <Link 
                            key={post._id}
                            href={`/blog/${post.slug}`}
                            className="relative w-[85vw] md:w-[45vw] h-full group border-r overflow-hidden flex-shrink-0"
                            style={{ borderColor: `${themeColors.secondaryText}15` }}
                        >
                            <div className="absolute inset-0 bg-zinc-100 overflow-hidden">
                                {post.featuredImage ? (
                                    <img
                                        src={getImageSrc(post.featuredImage.url)}
                                        alt={post.title}
                                        className="w-full h-full object-cover transition-transform duration-[2000ms] ease-out group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center opacity-20">No Image</div>
                                )}
                                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors duration-500" />
                            </div>

                            {/* Status Ribbon */}
                            {post.categories?.[0] && (
                                <div className="absolute top-12 right-[-40px] rotate-45 w-40 py-1 text-center shadow-lg"
                                     style={{ 
                                        backgroundColor: themeColors.primaryButton, 
                                        color: '#fff',
                                        fontSize: '10px',
                                        fontWeight: 'bold',
                                        letterSpacing: '0.2em',
                                        zIndex: 10
                                     }}>
                                    {post.categories[0].toUpperCase()}
                                </div>
                            )}

                            {/* Content Info */}
                            <div className="absolute bottom-0 left-0 w-full p-12 lg:p-16 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-700">
                                <h2 
                                    className="text-3xl lg:text-4xl uppercase tracking-[0.1em] mb-2"
                                    style={{ color: themeColors.pageBackground, fontFamily: themeFonts.heading }}
                                >
                                    {post.title}
                                </h2>
                                <div className="flex flex-col gap-1">
                                    <span 
                                        className="text-xs uppercase tracking-[0.3em] opacity-80"
                                        style={{ color: themeColors.pageBackground, fontFamily: themeFonts.body }}
                                    >
                                        {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-US', { 
                                            month: 'short', 
                                            day: 'numeric', 
                                            year: 'numeric' 
                                        }) : 'No Date'}
                                    </span>
                                    <div 
                                        className="w-0 group-hover:w-full h-[1px] transition-all duration-1000 ease-in-out"
                                        style={{ backgroundColor: themeColors.pageBackground }}
                                    />
                                </div>
                            </div>
                        </Link>
                    ))}

                    {/* Final Spacer */}
                    <div className="w-[10vw] h-full flex-shrink-0" />
                </div>
            </main>
        </div>
    );
}