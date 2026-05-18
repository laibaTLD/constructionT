'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { projectApi } from '@/app/lib/api';
import { Page } from '@/app/lib/types';
import {
  isSectionEnabled,
  projectLog,
  resolveProjectsForSection,
} from '@/app/lib/projects';
import { TiptapRenderer } from '@/app/components/ui/TiptapRenderer';
import { cn, getImageSrc } from '@/app/lib/utils';
import { OptimizedImage } from '@/app/components/ui/OptimizedImage';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';

interface ProjectsSectionProps {
  projectsSection?: Page['projectsSection'];
  projectSection?: Page['projectSection'];
  className?: string;
}

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({
  projectsSection,
  projectSection,
  className,
}) => {
  const { projects, site, loading } = useWebBuilder();
  const [fetchedProjects, setFetchedProjects] = useState<typeof projects>([]);

  const projectPool = projects.length > 0 ? projects : fetchedProjects;

  const displayItems = useMemo(
    () => resolveProjectsForSection(projectPool ?? [], projectsSection, site),
    [projectPool, projectsSection, site]
  );

  const introEnabled = projectSection != null && isSectionEnabled(projectSection.enabled);
  const portfolioEnabled =
    projectsSection === undefined || projectsSection === null
      ? true
      : isSectionEnabled(projectsSection.enabled);

  const showPortfolio = portfolioEnabled && (displayItems.length > 0 || loading || Boolean(projectsSection));
  const isVisible = introEnabled || showPortfolio;

  useEffect(() => {
    if (!portfolioEnabled || !site?.slug || loading) return;
    if (projects.length > 0) {
      setFetchedProjects([]);
      return;
    }

    let cancelled = false;
    projectApi.getProjectsBySite(site.slug).then((data) => {
      if (!cancelled) setFetchedProjects(data);
    });

    return () => {
      cancelled = true;
    };
  }, [portfolioEnabled, site?.slug, loading, projects.length]);

  useEffect(() => {
    if (displayItems.length === 0 || typeof window === 'undefined') return;
    import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => {
      requestAnimationFrame(() => ScrollTrigger.refresh());
    });
  }, [displayItems.length]);

  useEffect(() => {
    if (!isVisible) return;
    projectLog('ProjectsSection', {
      siteSlug: site?.slug,
      introEnabled,
      portfolioEnabled,
      displayCount: displayItems.length,
    });
  }, [site?.slug, introEnabled, portfolioEnabled, displayItems.length, isVisible]);

  if (!isVisible) return null;

  return (
    <div className={cn('relative z-40 isolate w-full', className)}>
      {introEnabled && (
        <section className="border-t border-black/5 py-16 md:py-24 lg:py-32">
          <div className="container mx-auto max-w-4xl px-6 md:px-12 lg:px-20">
            {projectSection?.title && (
              <h2 className="mb-8 text-balance text-3xl font-extralight uppercase leading-[1.05] tracking-[0.12em] text-gray-900 md:text-4xl lg:text-5xl">
                <TiptapRenderer content={projectSection.title} as="inline" />
              </h2>
            )}
            {projectSection?.description && (
              <div className="text-sm leading-relaxed tracking-wide text-gray-600 opacity-80 md:text-base">
                <TiptapRenderer content={projectSection.description} />
              </div>
            )}
          </div>
        </section>
      )}

      {showPortfolio && (
        <section
          id="projects-section"
          data-projects-section
          className="relative w-full border-t border-black/5 py-16 md:py-24"
        >
          <div className="mb-10 px-8 md:mb-14 md:px-16 lg:px-24">
            <div className="mb-6 flex items-center gap-4">
              <div className="h-px w-10 bg-black/20" />
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-500">
                Featured Projects
              </span>
            </div>
            {!introEnabled && projectsSection?.title && (
              <h2 className="max-w-2xl font-sans text-3xl font-light uppercase leading-none tracking-tight text-gray-900 md:text-4xl lg:text-5xl">
                <TiptapRenderer content={projectsSection.title} as="inline" />
              </h2>
            )}
            {!introEnabled && projectsSection?.description && (
              <div className="mt-6 max-w-xl text-sm tracking-wide text-gray-600 md:text-base">
                <TiptapRenderer content={projectsSection.description} />
              </div>
            )}
          </div>

          {displayItems.length === 0 ? (
            <p className="px-8 pb-8 text-sm uppercase tracking-[0.3em] text-gray-500 md:px-16 lg:px-24">
              {loading ? 'Loading projects…' : 'No published projects for this site yet.'}
            </p>
          ) : (
            <div
              className={cn(
                'w-full px-6 md:px-16 lg:px-24',
                '[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden',
                displayItems.length > 1 ? 'overflow-x-auto' : 'overflow-visible'
              )}
            >
              <div
                className={cn(
                  'flex gap-6 pb-4 md:gap-10 lg:gap-14',
                  displayItems.length === 1 ? 'justify-start' : 'w-max'
                )}
              >
                {displayItems.map((item) => {
                  const imageUrl = getImageSrc(item.featuredImage?.url);
                  const titleText = item.title || 'Project';
                  const locationText = item.location || '';

                  return (
                    <Link
                      key={item._id}
                      href={`/project-detail/${item.slug}`}
                      className="group flex w-[min(82vw,360px)] shrink-0 flex-col"
                    >
                      <div className="relative mb-6 aspect-[4/5] min-h-[280px] w-full overflow-hidden bg-gray-100">
                        {imageUrl ? (
                          <OptimizedImage
                            src={imageUrl}
                            alt={titleText}
                            fill
                            sizes="(max-width: 768px) 85vw, 360px"
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-xs uppercase tracking-widest text-gray-400">
                            No image
                          </div>
                        )}
                      </div>

                      <h3 className="text-lg font-light uppercase leading-tight tracking-tight text-gray-900 md:text-xl">
                        {titleText}
                      </h3>
                      {locationText ? (
                        <p className="mt-2 text-[9px] font-bold uppercase tracking-[0.4em] text-gray-500">
                          {locationText}
                        </p>
                      ) : null}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default ProjectsSection;


