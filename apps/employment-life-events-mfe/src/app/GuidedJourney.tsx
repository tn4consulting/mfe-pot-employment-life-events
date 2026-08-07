// See App.tsx's own comment on this same import -- required for the
// classic JSX transform this app's tsconfig uses (react/jsx-runtime can't
// resolve once this bundle treats react as a federation-shared external).
import * as React from 'react';
import { ComponentType, useEffect, useState } from 'react';
import { usePaymentHistoryWidgetLoader } from '@tn4consulting/shared-federation-runtime';
import type { Locale } from '@tn4consulting/shared-i18n';
import { BENEFITS_CHECKLIST, DEPARTURE_CHECKLIST, EMPLOYABILITY_CHECKLIST } from './checklist-data';
import { StaticChecklistSection } from './StaticChecklistSection';
import { JobSearchChecklistItem } from './JobSearchChecklistItem';
import { EiChecklistItems } from './EiChecklistItems';

export interface GuidedJourneyLabels {
  checklistsHeading: string;
  markDone: string;
  completed: string;
  status: string;
  paymentsHeading: string;
  widgetUnavailableText: string;
  jobSearchTitle: string;
  jobSearchBody: string;
  jobSearchAction: string;
  jobSearchWidgetUnavailable: string;
  eiHeading: string;
  eiApplyTitle: string;
  eiApplyBody: string;
  eiApplyAction: string;
  eiReportTitle: string;
  eiReportBody: string;
  eiReportAction: string;
  eiWidgetUnavailable: string;
}

export interface GuidedJourneyProps {
  locale: Locale;
  labels: GuidedJourneyLabels;
}

/**
 * The guided journey itself: a series of checklists (departure steps,
 * employability, benefits you might now be eligible for, EI apply/report)
 * followed by the payment-history widget. Two checklist items -- job
 * search and EI apply/report -- derive real completion from job-bank's
 * and employment-insurance's own widgets (see JobSearchChecklistItem/
 * EiChecklistItems); everything else is self-reported, since nothing else
 * in the family owns that data (see this app's own CLAUDE.md and
 * checklist-data.ts's own doc comment). Same host-mediated cross-remote
 * widget-composition pattern the payment-history widget below already
 * used, just extended to two more widgets -- see mfe-pot-msca-shell's
 * routes.tsx, EmploymentLifeEventsRoute.
 */
export function GuidedJourney({ locale, labels }: GuidedJourneyProps) {
  const loadPaymentHistoryWidget = usePaymentHistoryWidgetLoader();
  const [Widget, setWidget] = useState<ComponentType<Record<string, unknown>> | null>(null);
  const [widgetLoadError, setWidgetLoadError] = useState(false);

  useEffect(() => {
    if (!loadPaymentHistoryWidget) {
      setWidgetLoadError(true);
      return;
    }
    let cancelled = false;
    loadPaymentHistoryWidget()
      .then(({ component }) => {
        if (!cancelled) {
          setWidget(() => component);
        }
      })
      .catch((err) => {
        console.error('Failed to load dashboard payment-history widget', err);
        if (!cancelled) {
          setWidgetLoadError(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [loadPaymentHistoryWidget]);

  return (
    <section className="guided-journey">
      <h2>{labels.checklistsHeading}</h2>

      <StaticChecklistSection
        section={DEPARTURE_CHECKLIST}
        locale={locale}
        completedLabel={labels.completed}
        markDoneLabel={labels.markDone}
      />

      <StaticChecklistSection
        section={EMPLOYABILITY_CHECKLIST}
        locale={locale}
        completedLabel={labels.completed}
        markDoneLabel={labels.markDone}
        leadingItem={
          <JobSearchChecklistItem
            title={labels.jobSearchTitle}
            body={labels.jobSearchBody}
            actionLabel={labels.jobSearchAction}
            statusLabel={labels.status}
            completedLabel={labels.completed}
            widgetUnavailableText={labels.jobSearchWidgetUnavailable}
          />
        }
      />

      <StaticChecklistSection
        section={BENEFITS_CHECKLIST}
        locale={locale}
        completedLabel={labels.completed}
        markDoneLabel={labels.markDone}
      />

      <scds-checklist checklist-heading={labels.eiHeading}>
        <EiChecklistItems
          applyTitle={labels.eiApplyTitle}
          applyBody={labels.eiApplyBody}
          applyActionLabel={labels.eiApplyAction}
          reportTitle={labels.eiReportTitle}
          reportBody={labels.eiReportBody}
          reportActionLabel={labels.eiReportAction}
          statusLabel={labels.status}
          completedLabel={labels.completed}
          widgetUnavailableText={labels.eiWidgetUnavailable}
        />
      </scds-checklist>

      <h2>{labels.paymentsHeading}</h2>
      {widgetLoadError && <p role="alert">{labels.widgetUnavailableText}</p>}
      {Widget && <Widget />}
    </section>
  );
}
