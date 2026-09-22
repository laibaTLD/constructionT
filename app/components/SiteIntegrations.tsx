import { Fragment } from 'react';
import type { Site } from '@/app/lib/types';
import {
  extractGtmId,
  isGa4Id,
  isGoogleAdsId,
  isGtmId,
  looksLikeHtml,
  officialGtagConfigScript,
  officialGtmHeadScript,
  parseIntegrationHtml,
  resolveGa4,
  resolveGtmHead,
  type IntegrationHtmlNode,
} from '@/app/lib/integrations';

function passthroughAttrs(attrs: Record<string, string>): Record<string, string> {
  const mapped: Record<string, string> = {};
  for (const [key, value] of Object.entries(attrs)) {
    if (key === 'http-equiv') mapped.httpEquiv = value;
    else if (key === 'charset') mapped.charSet = value;
    else if (key === 'crossorigin') mapped.crossOrigin = value;
    else mapped[key] = value;
  }
  return mapped;
}

function HtmlNodes({ nodes, idPrefix }: { nodes: IntegrationHtmlNode[]; idPrefix: string }) {
  return (
    <>
      {nodes.map((node, index) => {
        const id = `${idPrefix}-${index}`;
        if (node.kind === 'script') {
          const scriptId = node.id || id;
          if (!node.src && !node.innerHTML) return null;
          return (
            <Fragment key={id}>
              {node.src ? (
                <script
                  id={node.innerHTML ? `${scriptId}-src` : scriptId}
                  src={node.src}
                  async={node.async || undefined}
                  defer={node.defer || undefined}
                  type={node.type}
                />
              ) : null}
              {node.innerHTML ? (
                <script
                  id={node.src ? `${scriptId}-inline` : scriptId}
                  type={node.type}
                  dangerouslySetInnerHTML={{ __html: node.innerHTML }}
                />
              ) : null}
            </Fragment>
          );
        }
        if (node.kind === 'meta') {
          return <meta key={id} {...passthroughAttrs(node.attrs)} />;
        }
        if (node.kind === 'link') {
          return <link key={id} {...passthroughAttrs(node.attrs)} />;
        }
        return null;
      })}
    </>
  );
}

function HeadSnippet({ value, idPrefix }: { value: string; idPrefix: string }) {
  if (looksLikeHtml(value)) {
    return <HtmlNodes nodes={parseIntegrationHtml(value)} idPrefix={idPrefix} />;
  }
  if (/^https?:\/\//i.test(value)) {
    return <script id={idPrefix} async src={value} />;
  }
  return null;
}

function GtagLoader({ id, measurementId }: { id: string; measurementId: string }) {
  return (
    <>
      <script id={`${id}-src`} async src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} />
      <script id={`${id}-config`} dangerouslySetInnerHTML={{ __html: officialGtagConfigScript(measurementId) }} />
    </>
  );
}

/**
 * Head-level Sitify Studio integrations.
 * Search Console is emitted via generateMetadata (`verification.google`), not here.
 * Native script tags stay in the initial HTML so Tag Assistant can see them in view-source.
 */
export function SiteHeadIntegrations({ site }: { site?: Site | null }) {
  if (!site) return null;

  const gtmHead = resolveGtmHead(site.integrations, site.seo);
  const ga4 = resolveGa4(site.integrations, site.seo);
  const googleAds = (site.integrations?.googleAds || '').trim();
  const googleMaps = (site.integrations?.googleMaps || '').trim();

  const gtmId = gtmHead && !looksLikeHtml(gtmHead) && isGtmId(gtmHead) ? gtmHead : extractGtmId(gtmHead);

  return (
    <>
      {gtmHead ? (
        looksLikeHtml(gtmHead) ? (
          <HeadSnippet value={gtmHead} idPrefix="sitify-gtm-head" />
        ) : gtmId ? (
          <script id="sitify-gtm-head" dangerouslySetInnerHTML={{ __html: officialGtmHeadScript(gtmId) }} />
        ) : null
      ) : null}

      {ga4 ? (
        looksLikeHtml(ga4) ? (
          <HeadSnippet value={ga4} idPrefix="sitify-ga4" />
        ) : isGa4Id(ga4) ? (
          <GtagLoader id="sitify-ga4" measurementId={ga4} />
        ) : null
      ) : null}

      {googleAds ? (
        looksLikeHtml(googleAds) ? (
          <HeadSnippet value={googleAds} idPrefix="sitify-google-ads" />
        ) : isGoogleAdsId(googleAds) || isGa4Id(googleAds) ? (
          <GtagLoader id="sitify-google-ads" measurementId={googleAds} />
        ) : null
      ) : null}

      {googleMaps ? <HeadSnippet value={googleMaps} idPrefix="sitify-google-maps" /> : null}
    </>
  );
}

export function GtmNoscript({ html }: { html: string }) {
  if (!html.trim()) return null;
  return <noscript dangerouslySetInnerHTML={{ __html: html }} />;
}
