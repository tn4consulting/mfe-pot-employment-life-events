// See App.tsx's own comment on this same import -- required for the
// classic JSX transform this app's tsconfig uses (react/jsx-runtime can't
// resolve once this bundle treats react as a federation-shared external).
import * as React from 'react';
import { ComponentType, useEffect, useState } from 'react';
import { usePaymentHistoryWidgetLoader } from '@tn4consulting/shared-federation-runtime';

export interface GuidedJourneyProps {
  paymentsHeading: string;
  widgetUnavailableText: string;
}

/**
 * Genuinely simpler than the Angular version this replaces: that one
 * needed a child EnvironmentInjector (`createEnvironmentInjector`) to
 * apply the providers dashboard's payment-history widget came bundled
 * with. shared-federation-runtime's React Context version has no
 * providers at all -- dashboard's widget is fully self-configuring, same
 * as every other remote in this family -- so there's nothing left to do
 * but call the loader and render whatever component it resolves to.
 */
export function GuidedJourney({ paymentsHeading, widgetUnavailableText }: GuidedJourneyProps) {
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
      <h2>{paymentsHeading}</h2>
      {widgetLoadError && <p role="alert">{widgetUnavailableText}</p>}
      {Widget && <Widget />}
    </section>
  );
}
