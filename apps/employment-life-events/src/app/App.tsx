// See below -- required for the classic JSX transform this app's tsconfig
// uses (react/jsx-runtime can't resolve once this bundle treats react as a
// federation-shared external, same documented issue as the shell repo's
// own App.tsx).
import * as React from 'react';
import { useEffect, useState } from 'react';
import { CLAIM_EMPLOYMENT_LIFE_EVENTS, getStoredSession, hasClaim, onSessionChange } from '@tn4consulting/shared-auth/core';
import type { ContentClient, PageContent } from '@tn4consulting/shared-content-client';
import { useLocale, useTranslations } from '@tn4consulting/shared-i18n';
import { createContentClient, INTRO_CONTENT_KEY } from './content-client';
import { loadRuntimeConfig } from '../runtime-config';
import { assetBaseUrl } from './asset-base-url';
import { GuidedJourney } from './GuidedJourney';

/**
 * Does its own setup entirely -- no host-provided REMOTE_PROVIDERS
 * equivalent (see RemoteRouteHost in shared-federation-runtime for why).
 * Auth/claim check lives here, not in GuidedJourney -- defense in depth,
 * this app validates its own claim independently rather than assuming
 * "the shell let me navigate here, so I'm authorized" (see CLAUDE.md's
 * "Security: defense in depth" section).
 *
 * `journey.paymentsHeading`/`journey.widgetUnavailable` are resolved here
 * and passed down to GuidedJourney as plain string props, mirroring the
 * Angular version's shape -- but for a different reason now. The Angular
 * version *had* to do this: importing shared-i18n's TranslocoPipe
 * directly in the feature lib as well as here crashed the whole page
 * (NG0201/NG0912, two separately-bundled copies of shared-i18n with
 * mismatched InjectionToken identities -- see this repo's own CLAUDE.md).
 * React has no per-bundle DI-singleton-identity concept, so that bug
 * class can't recur here; GuidedJourney could safely call
 * useTranslations itself. Kept as props anyway, simply because it avoids
 * a second redundant fetch of the same translation file.
 */
export function App() {
  const [hasAccess, setHasAccess] = useState(() => hasClaim(getStoredSession(), CLAIM_EMPLOYMENT_LIFE_EVENTS));
  const [contentClient, setContentClient] = useState<ContentClient | null>(null);
  const [intro, setIntro] = useState<PageContent | null>(null);
  const [introLoadError, setIntroLoadError] = useState(false);
  const locale = useLocale();
  const { t } = useTranslations(assetBaseUrl, locale);

  useEffect(() => onSessionChange((session) => setHasAccess(hasClaim(session, CLAIM_EMPLOYMENT_LIFE_EVENTS))), []);

  useEffect(() => {
    let cancelled = false;
    loadRuntimeConfig(assetBaseUrl).then((runtimeConfig) => {
      if (!cancelled) {
        setContentClient(createContentClient(runtimeConfig.strapiBaseUrl));
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // CMS content (unlike the i18n chrome text above) isn't reactive by
  // default, so this app explicitly re-fetches whenever the cross-remote
  // active locale changes -- same pattern as job-bank's/dashboard's App.
  useEffect(() => {
    if (!contentClient) {
      return;
    }
    let cancelled = false;
    contentClient
      .getPageContent(INTRO_CONTENT_KEY, locale === 'fr' ? 'fr' : 'en')
      .then((content) => {
        if (!cancelled) {
          setIntro(content);
          setIntroLoadError(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load employment-life-events intro content', err);
        if (!cancelled) {
          setIntroLoadError(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [contentClient, locale]);

  if (!hasAccess) {
    return <p role="alert">{t('auth.signInRequired')}</p>;
  }

  return (
    <>
      {intro ? (
        <section>
          <h1>{intro.title}</h1>
          <p>{intro.body}</p>
        </section>
      ) : introLoadError ? (
        <p role="alert">Page content is temporarily unavailable.</p>
      ) : null}
      <GuidedJourney
        paymentsHeading={t('journey.paymentsHeading')}
        widgetUnavailableText={t('journey.widgetUnavailable')}
      />
    </>
  );
}
