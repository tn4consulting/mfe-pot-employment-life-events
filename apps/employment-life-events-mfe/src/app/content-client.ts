import {
  ContentClient,
  PageContent,
  StaticContentClient,
  StrapiContentClient,
} from '@tn4consulting/shared-content-client';

export const INTRO_CONTENT_KEY = 'employment-life-events.intro';

// Baked fallback for a no-CMS build -- kept in sync with the seed data in
// mfe-pot-platform's tools/cms/strapi/src/index.ts by hand for now; see
// mfe-pot-dashboard's own content-client.token.ts for the same pattern.
const STATIC_CONTENT: Record<string, Record<'en' | 'fr', PageContent>> = {
  [INTRO_CONTENT_KEY]: {
    en: {
      key: INTRO_CONTENT_KEY,
      title: "You lost your job — here's what to do next",
      body: 'Guidance on CVs, job search, and Employment Insurance.',
    },
    fr: {
      key: INTRO_CONTENT_KEY,
      title: 'Vous avez perdu votre emploi — voici les prochaines étapes',
      body: "Conseils sur le CV, la recherche d'emploi et l'assurance-emploi.",
    },
  },
};

export function createContentClient(strapiBaseUrl: string | undefined): ContentClient {
  return strapiBaseUrl ? new StrapiContentClient(strapiBaseUrl) : new StaticContentClient(STATIC_CONTENT);
}
