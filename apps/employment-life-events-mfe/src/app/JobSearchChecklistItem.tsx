// See App.tsx's own comment on this same import -- required for the
// classic JSX transform this app's tsconfig uses.
import * as React from 'react';
import { ComponentType, useCallback, useEffect, useState } from 'react';
import { useJobApplicationsWidgetLoader } from '@tn4consulting/shared-federation-runtime';

/**
 * job-bank's JobApplication shape, duck-typed here rather than imported --
 * `job-bank-data-access` is an Nx lib internal to mfe-pot-job-bank-mfe's
 * own repo/build, not a published package this separately-deployed repo
 * can depend on. Only the field this component actually reads is typed.
 */
interface LoadedJobApplication {
  id?: unknown;
}

export interface JobSearchChecklistItemProps {
  title: string;
  body: string;
  actionLabel: string;
  statusLabel: string;
  completedLabel: string;
  widgetUnavailableText: string;
}

/**
 * The one employability-checklist item with a real completion signal:
 * job-bank's own JobApplicationsList, loaded the same host-mediated way
 * GuidedJourney already loads dashboard's payment-history widget (see
 * mfe-pot-msca-shell's routes.tsx, EmploymentLifeEventsRoute). Complete
 * once the citizen has at least one real application on file --
 * job-bank's component determines that itself and reports it back via
 * `onApplicationsLoaded`, not by this component re-implementing the
 * fetch. The widget mounts as soon as it resolves (needed so its own
 * fetch effect actually runs and the callback fires); it's only made
 * visible once there's something to show, so an empty first mount
 * doesn't render job-bank's own "no applications" copy underneath a
 * checklist item that already says the same thing via `actionLabel`.
 *
 * Returns a bare `<scds-checklist-item>` -- this component is always
 * rendered as `StaticChecklistSection`'s `leadingItem`, slotted directly
 * into a `scds-checklist`'s default slot alongside its mapped static
 * items, so it needs no wrapper of its own.
 */
export function JobSearchChecklistItem({
  title,
  body,
  actionLabel,
  statusLabel,
  completedLabel,
  widgetUnavailableText,
}: JobSearchChecklistItemProps) {
  const loadWidget = useJobApplicationsWidgetLoader();
  const [Widget, setWidget] = useState<ComponentType<Record<string, unknown>> | null>(null);
  const [widgetLoadError, setWidgetLoadError] = useState(false);
  const [applications, setApplications] = useState<LoadedJobApplication[] | null>(null);

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
        console.error('Failed to load job-bank applications widget', err);
        if (!cancelled) {
          setWidgetLoadError(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [loadWidget]);

  const handleApplicationsLoaded = useCallback((loaded: LoadedJobApplication[]) => {
    setApplications(loaded);
  }, []);

  const completed = applications !== null && applications.length > 0;

  return (
    <scds-checklist-item item-title={title} description={body} complete={completed} complete-label={completedLabel}>
      <scds-link href="/job-bank" icon-name="arrow-right">
        {completed ? statusLabel : actionLabel}
      </scds-link>
      {widgetLoadError && <p role="alert">{widgetUnavailableText}</p>}
      {Widget && (
        <div style={{ display: completed ? 'block' : 'none', marginTop: '0.5rem' }}>
          <Widget onApplicationsLoaded={handleApplicationsLoaded} />
        </div>
      )}
    </scds-checklist-item>
  );
}
