'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { projectApi } from '@/app/lib/api';
import { Page, Project } from '@/app/lib/types';
import {
  getLatestPublishedProjectsForSite,
  isProjectIntroEnabled,
  isProjectsPortfolioEnabled,
} from '@/app/lib/projects';
import { TiptapRenderer } from '@/app/components/ui/TiptapRenderer';
import { cn, getImageSrc } from '@/app/lib/utils';
import { OptimizedImage } from '@/app/components/ui/OptimizedImage';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { useThemeColors, useThemeFonts } from '@/app/hooks/useTheme';

interface ProjectsSectionProps {
  projectsSection?: Page['projectsSection'];
  projectSection?: Page['projectSection'];
  /** When set (e.g. 3 on home), only the newest published projects are shown. */
  maxProjectCards?: number;
  className?: string;
}

function ProjectCard({
  item,
  themeColors,
  themeFonts,
}: {
  item: Project;
  themeColors: ReturnType<typeof useThemeColors>;
  themeFonts: ReturnType<typeof useThemeFonts>;
}) {
  const imageUrl = getImageSrc(item.featuredImage?.url);

  return (
    <Link
      href={`/project-detail/${item.slug}`}
      className="group flex w-[min(82vw,360px)] shrink-0 flex-col"
    >
      {imageUrl ? (
        <div className="relative mb-6 aspect-[4/5] min-h-[280px] w-full overflow-hidden bg-gray-100">
          <OptimizedImage
            src={imageUrl}
            alt={item.featuredImage?.altText || item.title}
            fill
            sizes="(max-width: 768px) 85vw, 360px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      ) : null}

      {item.title ? (
        <h3
          className="text-lg font-light uppercase leading-tight tracking-tight md:text-xl"
          style={{ color: themeColors.mainText, fontFamily: themeFonts.heading }}
        >
          {item.title}
        </h3>
      ) : null}
      {item.location ? (
        <p
          className="mt-2 text-[9px] font-bold uppercase tracking-[0.4em]"
          style={{ color: themeColors.secondaryText }}
        >
          {item.location}
        </p>
      ) : null}
    </Link>
  );
}

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({
  projectsSection,
  projectSection,
  maxProjectCards,
  className,
}) => {
  const { projects, site, loading } = useWebBuilder();
  const themeColors = useThemeColors();
  const themeFonts = useThemeFonts();
  const [fetchedProjects, setFetchedProjects] = useState<typeof projects>([]);

  const projectPool = projects.length > 0 ? projects : fetchedProjects;

  const projectCards = useMemo(
    () => getLatestPublishedProjectsForSite(projectPool ?? [], site, maxProjectCards),
    [projectPool, site, maxProjectCards]
  );

  const introEnabled = isProjectIntroEnabled(projectSection);
  const portfolioEnabled = isProjectsPortfolioEnabled(projectsSection);
  const showProjectCards =
    (introEnabled || portfolioEnabled) && projectCards.length > 0;
  const isVisible = introEnabled || showProjectCards;

  const shouldLoadProjects = introEnabled || portfolioEnabled;

  useEffect(() => {
    if (!shouldLoadProjects || !site?.slug || loading) return;
    if (projects.length > 0) {
      setFetchedProjects([]);
      return;
    }

    let cancelled = false;
    projectApi.getProjectsBySite(site.slug, maxProjectCards).then((data) => {
      if (!cancelled) setFetchedProjects(data);
    });

    return () => {
      cancelled = true;
    };
  }, [shouldLoadProjects, site?.slug, loading, projects.length, maxProjectCards]);

  useEffect(() => {
    if (projectCards.length === 0 || typeof window === 'undefined') return;
    import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => {
      requestAnimationFrame(() => ScrollTrigger.refresh());
    });
  }, [projectCards.length]);

  if (!isVisible) return null;

  const portfolioHasHeader =
    portfolioEnabled &&
    !introEnabled &&
    Boolean(projectsSection?.title || projectsSection?.description);

  return (
    <div className={cn('relative w-full', className)}>
      {introEnabled && projectSection && (
        <section
          id="project-section"
          data-project-section-intro
          className="relative border-t border-black/5 py-16 md:py-24 lg:py-32"
          style={{ backgroundColor: themeColors.pageBackground }}
        >
          <div className="container mx-auto max-w-4xl px-6 md:px-12 lg:px-20">
            {projectSection.title && (
              <h2
                className="mb-8 text-balance text-3xl font-extralight uppercase leading-[1.05] tracking-[0.12em] md:text-4xl lg:text-5xl"
                style={{ color: themeColors.mainText, fontFamily: themeFonts.heading }}
              >
                <TiptapRenderer content={projectSection.title} as="inline" />
              </h2>
            )}
            {projectSection.description && (
              <div
                className="text-sm leading-relaxed tracking-wide opacity-80 md:text-base"
                style={{ color: themeColors.secondaryText, fontFamily: themeFonts.body }}
              >
                <TiptapRenderer content={projectSection.description} />
              </div>
            )}
          </div>
        </section>
      )}

      {showProjectCards && (
        <section
          id="projects-section"
          data-projects-section
          className="relative w-full border-t border-black/5 py-16 md:py-24"
          style={{ backgroundColor: themeColors.pageBackground }}
        >
          {portfolioHasHeader && projectsSection && (
            <div className="mb-10 px-8 md:mb-14 md:px-16 lg:px-24">
              {projectsSection.title && (
                <h2
                  className="max-w-2xl text-3xl font-light uppercase leading-none tracking-tight md:text-4xl lg:text-5xl"
                  style={{ color: themeColors.mainText, fontFamily: themeFonts.heading }}
                >
                  <TiptapRenderer content={projectsSection.title} as="inline" />
                </h2>
              )}
              {projectsSection.description && (
                <div
                  className="mt-6 max-w-xl text-sm tracking-wide md:text-base"
                  style={{ color: themeColors.secondaryText, fontFamily: themeFonts.body }}
                >
                  <TiptapRenderer content={projectsSection.description} />
                </div>
              )}
            </div>
          )}

          <div
            className={cn(
              'projectCards w-full px-6 md:px-16 lg:px-24',
              '[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden',
              projectCards.length > 1 ? 'overflow-x-auto' : 'overflow-visible'
            )}
            data-project-cards
          >
            <div
              className={cn(
                'flex gap-6 pb-4 md:gap-10 lg:gap-14',
                projectCards.length === 1 ? 'justify-start' : 'w-max'
              )}
            >
              {projectCards.map((item) => (
                <ProjectCard
                  key={item._id}
                  item={item}
                  themeColors={themeColors}
                  themeFonts={themeFonts}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default ProjectsSection;
