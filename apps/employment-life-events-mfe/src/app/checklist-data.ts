import type { Locale } from '@tn4consulting/shared-i18n';

/**
 * Static, bilingual, presentation-only checklist copy -- same pattern as
 * mfe-pot-dashboard-mfe's ConsiderThisList `SUGGESTIONS` array: there's no
 * upstream owner (CMS or BFF) for this content, it's guided-journey
 * narrative specific to this app, not test data or a reusable label set.
 * See mfe-pot's own CLAUDE.md ("CMS content scope") for why this stays
 * out of Strapi.
 */
export interface BilingualText {
  en: string;
  fr: string;
}

export interface StaticChecklistItem {
  id: string;
  title: BilingualText;
  body: BilingualText;
  /** Present only for items that route out to another app's own page. */
  linkHref?: string;
  linkLabel?: BilingualText;
}

export interface ChecklistSectionData {
  id: string;
  heading: BilingualText;
  items: StaticChecklistItem[];
}

export function text(value: BilingualText, locale: Locale): string {
  return locale === 'fr' ? value.fr : value.en;
}

export const DEPARTURE_CHECKLIST: ChecklistSectionData = {
  id: 'departure',
  heading: {
    en: 'Steps to take when you leave your job',
    fr: 'Étapes à suivre en quittant votre emploi',
  },
  items: [
    {
      id: 'roe',
      title: { en: 'Get your Record of Employment (ROE)', fr: 'Obtenez votre relevé d’emploi (RE)' },
      body: {
        en: "Ask your employer for your ROE — you'll need it to apply for Employment Insurance. Employers must issue it within 5 days of your last day worked.",
        fr: 'Demandez votre RE à votre employeur — vous en aurez besoin pour présenter une demande d’assurance-emploi. Les employeurs doivent le délivrer dans les 5 jours suivant votre dernier jour travaillé.',
      },
    },
    {
      id: 'final-pay',
      title: { en: 'Confirm your final pay and vacation pay', fr: 'Confirmez votre dernière paie et votre indemnité de vacances' },
      body: {
        en: 'Check that your final pay includes all wages owed and any unused vacation pay, per your province or territory’s employment standards.',
        fr: 'Vérifiez que votre dernière paie comprend tous les salaires dus et toute indemnité de vacances non utilisée, selon les normes d’emploi de votre province ou territoire.',
      },
    },
    {
      id: 'benefits-continuation',
      title: { en: 'Ask about continuing your workplace benefits', fr: 'Renseignez-vous sur le maintien de vos avantages sociaux' },
      body: {
        en: 'Find out whether you can convert your health, dental, or life insurance to an individual policy, and for how long your current coverage lasts.',
        fr: 'Renseignez-vous pour savoir si vous pouvez convertir votre assurance maladie, dentaire ou vie en police individuelle, et combien de temps dure votre couverture actuelle.',
      },
    },
    {
      id: 'return-property',
      title: { en: 'Return company property', fr: 'Retournez les biens de l’entreprise' },
      body: {
        en: 'Return any laptop, ID badge, keys, or uniforms, and get written confirmation that they were received.',
        fr: 'Retournez tout ordinateur portable, carte d’identité, clé ou uniforme, et obtenez une confirmation écrite de leur réception.',
      },
    },
    {
      id: 'reference',
      title: { en: 'Ask for a letter of reference', fr: 'Demandez une lettre de référence' },
      body: {
        en: "Request a reference letter or confirmation of employment while your manager's memory is fresh — you'll likely need it for job applications.",
        fr: 'Demandez une lettre de référence ou une confirmation d’emploi pendant que votre superviseur se souvient bien de votre travail — vous en aurez probablement besoin pour vos demandes d’emploi.',
      },
    },
    {
      id: 'keep-records',
      title: { en: 'Keep records for your EI application', fr: 'Conservez vos documents pour votre demande d’assurance-emploi' },
      body: {
        en: "Keep your ROE, pay stubs, and dates of employment on hand — you'll need this information to apply for EI.",
        fr: 'Conservez votre RE, vos talons de paie et vos dates d’emploi à portée de main — vous en aurez besoin pour présenter une demande d’assurance-emploi.',
      },
    },
  ],
};

/**
 * Excludes the "search Job Bank" item deliberately -- that one has a real
 * completion signal (job-bank's own applications data) and is rendered by
 * its own JobSearchChecklistItem component, not this static list.
 */
export const EMPLOYABILITY_CHECKLIST: ChecklistSectionData = {
  id: 'employability',
  heading: {
    en: 'Make yourself more employable',
    fr: 'Améliorez votre employabilité',
  },
  items: [
    {
      id: 'update-cv',
      title: { en: 'Update your résumé and LinkedIn profile', fr: 'Mettez à jour votre CV et votre profil LinkedIn' },
      body: {
        en: 'Add your most recent role, accomplishments, and skills.',
        fr: 'Ajoutez votre poste le plus récent, vos réalisations et vos compétences.',
      },
    },
    {
      id: 'training',
      title: { en: 'Look into training and upskilling', fr: 'Renseignez-vous sur la formation et le perfectionnement' },
      body: {
        en: 'Look for government-funded training programs or certifications that could improve your job prospects.',
        fr: 'Cherchez des programmes de formation ou des certifications financés par le gouvernement qui pourraient améliorer vos perspectives d’emploi.',
      },
    },
  ],
};

export const BENEFITS_CHECKLIST: ChecklistSectionData = {
  id: 'benefits',
  heading: {
    en: 'Benefits you might now be eligible for',
    fr: 'Prestations auxquelles vous pourriez maintenant être admissible',
  },
  items: [
    {
      id: 'cdcp',
      title: { en: 'Canadian Dental Care Plan (CDCP)', fr: 'Régime canadien de soins dentaires (RCSD)' },
      body: {
        en: 'Losing job-related dental coverage may make you newly eligible for the CDCP — check your dashboard for a personalized look at your benefits.',
        fr: 'La perte de votre couverture dentaire liée à l’emploi pourrait vous rendre nouvellement admissible au RCSD — consultez votre tableau de bord pour un aperçu personnalisé de vos prestations.',
      },
      linkHref: '/dashboard',
      linkLabel: { en: 'Check your dashboard', fr: 'Consulter votre tableau de bord' },
    },
    {
      id: 'tax-credits',
      title: { en: 'GST/HST credit and other income-tested benefits', fr: 'Crédit pour la TPS/TVH et autres prestations fondées sur le revenu' },
      body: {
        en: 'A lower income this year could change what you receive from the GST/HST credit or other income-tested benefits when you file your next tax return.',
        fr: 'Un revenu plus faible cette année pourrait modifier ce que vous recevez du crédit pour la TPS/TVH ou d’autres prestations fondées sur le revenu lors de votre prochaine déclaration de revenus.',
      },
    },
    {
      id: 'provincial',
      title: { en: 'Provincial or territorial supports', fr: 'Soutiens provinciaux ou territoriaux' },
      body: {
        en: 'Check whether your province or territory offers additional income or health-coverage support during unemployment.',
        fr: 'Vérifiez si votre province ou territoire offre un soutien supplémentaire au revenu ou à la couverture santé pendant une période de chômage.',
      },
    },
  ],
};
