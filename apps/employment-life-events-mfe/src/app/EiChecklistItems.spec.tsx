import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { EiReportingStatusWidgetLoaderContext } from '@tn4consulting/shared-federation-runtime';
import { EiChecklistItems } from './EiChecklistItems';

type FakeStatus = { status: 'not_yet_due' | 'due_soon' | 'overdue' } | null;

interface FakeWidgetProps {
  onStatusLoaded?: (status: FakeStatus) => void;
}

function makeFakeWidget(status: FakeStatus) {
  return function FakeWidget({ onStatusLoaded }: FakeWidgetProps) {
    React.useEffect(() => {
      onStatusLoaded?.(status);
    }, [onStatusLoaded]);
    return <p>fake reporting status widget</p>;
  };
}

const PROPS = {
  applyTitle: 'Apply for Employment Insurance',
  applyBody: 'Apply as soon as you stop working.',
  applyActionLabel: 'Apply for EI',
  reportTitle: 'Submit your EI report',
  reportBody: 'Report every two weeks.',
  reportActionLabel: 'Submit your report',
  statusLabel: 'View status',
  completedLabel: 'Completed',
  widgetUnavailableText: 'EI status unavailable',
};

describe('EiChecklistItems', () => {
  it('shows both action links, neither complete, when there is no claim on file', async () => {
    const loader = jest.fn().mockResolvedValue({ component: makeFakeWidget(null) });

    render(
      <EiReportingStatusWidgetLoaderContext.Provider value={loader}>
        <ul>
          <EiChecklistItems {...PROPS} />
        </ul>
      </EiReportingStatusWidgetLoaderContext.Provider>,
    );

    // scds-link's slotted label text stays in the light DOM regardless of
    // whether the real Stencil custom element is registered/hydrated (see
    // GuidedJourney.spec.tsx's own comment) -- but its `role="link"`
    // inference does require real hydration jsdom doesn't do here, so
    // this asserts on the text itself rather than the role.
    expect(await screen.findByText('Apply for EI')).toBeInTheDocument();
    expect(screen.getByText('Submit your report')).toBeInTheDocument();
    expect(screen.queryByText('View status')).not.toBeInTheDocument();
  });

  it('marks both apply and report complete once a claim exists and reporting is up to date', async () => {
    const loader = jest.fn().mockResolvedValue({ component: makeFakeWidget({ status: 'not_yet_due' }) });

    render(
      <EiReportingStatusWidgetLoaderContext.Provider value={loader}>
        <ul>
          <EiChecklistItems {...PROPS} />
        </ul>
      </EiReportingStatusWidgetLoaderContext.Provider>,
    );

    expect(await screen.findAllByText('View status')).toHaveLength(2);
  });

  it('marks apply complete but keeps report open when a report is due soon or overdue', async () => {
    const loader = jest.fn().mockResolvedValue({ component: makeFakeWidget({ status: 'overdue' }) });

    render(
      <EiReportingStatusWidgetLoaderContext.Provider value={loader}>
        <ul>
          <EiChecklistItems {...PROPS} />
        </ul>
      </EiReportingStatusWidgetLoaderContext.Provider>,
    );

    expect(await screen.findByText('View status')).toBeInTheDocument();
    expect(screen.getByText('Submit your report')).toBeInTheDocument();
  });

  it('shows the degraded state when the reporting-status widget fails to load', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const loader = jest.fn().mockRejectedValue(new Error('load failed'));

    render(
      <EiReportingStatusWidgetLoaderContext.Provider value={loader}>
        <ul>
          <EiChecklistItems {...PROPS} />
        </ul>
      </EiReportingStatusWidgetLoaderContext.Provider>,
    );

    expect(await screen.findByRole('alert')).toHaveTextContent('EI status unavailable');
  });
});
