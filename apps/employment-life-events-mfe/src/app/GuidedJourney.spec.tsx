import * as React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { PaymentHistoryWidgetLoaderContext } from '@tn4consulting/shared-federation-runtime';
import { GuidedJourney, GuidedJourneyLabels } from './GuidedJourney';

function FakeWidget() {
  return <p>widget content</p>;
}

const LABELS: GuidedJourneyLabels = {
  checklistsHeading: 'Your checklist',
  markDone: 'Mark as done',
  completed: 'Completed',
  status: 'View status',
  paymentsHeading: 'Your payments',
  widgetUnavailableText: 'Widget unavailable',
  jobSearchTitle: 'Search and apply for jobs on Job Bank',
  jobSearchBody: 'Browse job postings that match your skills.',
  jobSearchAction: 'Search Job Bank',
  jobSearchWidgetUnavailable: 'Job Bank status unavailable',
  eiHeading: 'Apply for EI and keep up with reporting',
  eiApplyTitle: 'Apply for Employment Insurance',
  eiApplyBody: 'Apply as soon as you stop working.',
  eiApplyAction: 'Apply for EI',
  eiReportTitle: 'Submit your EI report',
  eiReportBody: 'Report every two weeks.',
  eiReportAction: 'Submit your report',
  eiWidgetUnavailable: 'EI status unavailable',
};

describe('GuidedJourney', () => {
  it('renders the checklist sections with the right headings and item titles', async () => {
    // `checklist-heading`/`item-title` are attributes passed to
    // scds-checklist/scds-checklist-item, not light-DOM text -- with
    // register-scds unmocked but no real Stencil hydration triggered in
    // this test (no waitFor delay), they never render as visible text, so
    // this asserts on the attributes directly rather than rendered
    // output. Same convention as mfe-pot-dashboard-mfe's own
    // ConsiderThisList.spec.tsx for scds-card's `card-title`.
    const { container } = render(<GuidedJourney locale="en" labels={LABELS} />);

    expect(screen.getByRole('heading', { name: 'Your checklist' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Your payments' })).toBeInTheDocument();

    const checklistHeadings = Array.from(container.querySelectorAll('scds-checklist')).map((el) =>
      el.getAttribute('checklist-heading'),
    );
    expect(checklistHeadings).toEqual(
      expect.arrayContaining([
        'Steps to take when you leave your job',
        'Make yourself more employable',
        'Benefits you might now be eligible for',
        'Apply for EI and keep up with reporting',
      ]),
    );

    const itemTitles = Array.from(container.querySelectorAll('scds-checklist-item')).map((el) =>
      el.getAttribute('item-title'),
    );
    expect(itemTitles).toEqual(expect.arrayContaining(['Search and apply for jobs on Job Bank']));
  });

  it('shows the degraded state for the payment widget when no loader is provided (e.g. standalone mode)', async () => {
    render(<GuidedJourney locale="en" labels={LABELS} />);

    expect(await screen.findByText(LABELS.widgetUnavailableText)).toBeInTheDocument();
  });

  it('mounts the resolved payment-history widget component', async () => {
    const loader = jest.fn().mockResolvedValue({ component: FakeWidget });

    render(
      <PaymentHistoryWidgetLoaderContext.Provider value={loader}>
        <GuidedJourney locale="en" labels={LABELS} />
      </PaymentHistoryWidgetLoaderContext.Provider>,
    );

    expect(await screen.findByText('widget content')).toBeInTheDocument();
  });

  it('shows the degraded state for the payment widget when the loader rejects', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const loader = jest.fn().mockRejectedValue(new Error('load failed'));

    render(
      <PaymentHistoryWidgetLoaderContext.Provider value={loader}>
        <GuidedJourney locale="en" labels={LABELS} />
      </PaymentHistoryWidgetLoaderContext.Provider>,
    );

    expect(await screen.findByText(LABELS.widgetUnavailableText)).toBeInTheDocument();
  });

  it('lets a citizen self-report a departure checklist item as done', async () => {
    render(<GuidedJourney locale="en" labels={LABELS} />);

    const [firstCheckbox] = screen.getAllByRole('checkbox', { name: /Mark as done/i });
    fireEvent.click(firstCheckbox);

    expect(firstCheckbox).toBeChecked();
    expect(screen.getAllByRole('checkbox', { name: /Completed/i }).length).toBeGreaterThan(0);
  });
});
