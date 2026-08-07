// See App.tsx's own comment on this same import -- required for the
// classic JSX transform this app's tsconfig uses.
import * as React from 'react';
import { ComponentType, useCallback, useEffect, useState } from 'react';
import { useEiReportingStatusWidgetLoader } from '@tn4consulting/shared-federation-runtime';

/**
 * employment-insurance's EiReportingStatus shape, duck-typed here rather
 * than imported -- `employment-insurance-data-access` is an Nx lib
 * internal to mfe-pot-employment-insurance-mfe's own repo/build, not a
 * published package this separately-deployed repo can depend on. Only the
 * field this component actually reads is typed.
 */
interface LoadedReportingStatus {
  status: 'not_yet_due' | 'due_soon' | 'overdue';
}

export interface EiChecklistItemsProps {
  applyTitle: string;
  applyBody: string;
  applyActionLabel: string;
  reportTitle: string;
  reportBody: string;
  reportActionLabel: string;
  statusLabel: string;
  completedLabel: string;
  widgetUnavailableText: string;
}

/**
 * The two EI checklist items -- "apply" and "keep up with reporting" --
 * both derive real completion from the one employment-insurance
 * ReportingStatus widget, loaded the same host-mediated way GuidedJourney
 * already loads dashboard's payment-history widget (see
 * mfe-pot-msca-shell's routes.tsx). Only one widget instance is mounted
 * (its own fetch is per-citizen, not per-item) and its `onStatusLoaded`
 * callback drives both items: `status === null` means no claim yet (apply
 * not complete); once a claim exists, reporting itself only counts as
 * "complete" while `status === 'not_yet_due'` -- `due_soon`/`overdue`
 * mean a report is actually owed right now, which the checklist should
 * keep surfacing as an open task, not a done one. The widget mounts as
 * soon as it resolves (needed for its fetch effect to run and the
 * callback to fire); it's only made visible once there's a claim to show,
 * under the "report" item since that's the ongoing task once applied.
 *
 * Returns a Fragment of two bare `<scds-checklist-item>` elements -- both
 * are always rendered inside GuidedJourney's own `scds-checklist` wrapper,
 * so neither needs a wrapper of its own.
 */
export function EiChecklistItems({
  applyTitle,
  applyBody,
  applyActionLabel,
  reportTitle,
  reportBody,
  reportActionLabel,
  statusLabel,
  completedLabel,
  widgetUnavailableText,
}: EiChecklistItemsProps) {
  const loadWidget = useEiReportingStatusWidgetLoader();
  const [Widget, setWidget] = useState<ComponentType<Record<string, unknown>> | null>(null);
  const [widgetLoadError, setWidgetLoadError] = useState(false);
  const [reportingStatus, setReportingStatus] = useState<LoadedReportingStatus | null | undefined>(undefined);

  useEffect(() => {
    if (!loadWidget) {
      setWidgetLoadError(true);
      return;
    }
    let cancelled = false;
    loadWidget()
      .then(({ component }) => {
        if (!cancelled) {
          setWidget(() => component);
        }
      })
      .catch((err) => {
        console.error('Failed to load EI reporting-status widget', err);
        if (!cancelled) {
          setWidgetLoadError(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [loadWidget]);

  const handleStatusLoaded = useCallback((status: LoadedReportingStatus | null) => {
    setReportingStatus(status);
  }, []);

  const applied = reportingStatus !== undefined && reportingStatus !== null;
  const reportingUpToDate = applied && reportingStatus?.status === 'not_yet_due';

  return (
    <>
      <scds-checklist-item item-title={applyTitle} description={applyBody} complete={applied} complete-label={completedLabel}>
        <scds-link href="/employment-insurance" icon-name="arrow-right">
          {applied ? statusLabel : applyActionLabel}
        </scds-link>
        {widgetLoadError && <p role="alert">{widgetUnavailableText}</p>}
      </scds-checklist-item>
      <scds-checklist-item
        item-title={reportTitle}
        description={reportBody}
        complete={reportingUpToDate}
        complete-label={completedLabel}
      >
        <scds-link href="/employment-insurance" icon-name="arrow-right">
          {reportingUpToDate ? statusLabel : reportActionLabel}
        </scds-link>
        {Widget && (
          <div style={{ display: applied ? 'block' : 'none', marginTop: '0.5rem' }}>
            <Widget onStatusLoaded={handleStatusLoaded} />
          </div>
        )}
      </scds-checklist-item>
    </>
  );
}
