import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { PaymentHistoryWidgetLoaderContext } from '@tn4consulting/shared-federation-runtime';
import { GuidedJourney } from './GuidedJourney';

function FakeWidget() {
  return <p>widget content</p>;
}

describe('GuidedJourney', () => {
  it('shows the degraded state when no loader is provided (e.g. standalone mode)', async () => {
    render(<GuidedJourney paymentsHeading="Your payments" widgetUnavailableText="Widget unavailable" />);

    expect(screen.getByRole('heading', { name: 'Your payments' })).toBeInTheDocument();
    expect(await screen.findByRole('alert')).toHaveTextContent('Widget unavailable');
  });

  it('mounts the resolved widget component', async () => {
    const loader = jest.fn().mockResolvedValue({ component: FakeWidget });

    render(
      <PaymentHistoryWidgetLoaderContext.Provider value={loader}>
        <GuidedJourney paymentsHeading="Your payments" widgetUnavailableText="Widget unavailable" />
      </PaymentHistoryWidgetLoaderContext.Provider>,
    );

    expect(await screen.findByText('widget content')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows the degraded state when the loader rejects', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const loader = jest.fn().mockRejectedValue(new Error('load failed'));

    render(
      <PaymentHistoryWidgetLoaderContext.Provider value={loader}>
        <GuidedJourney paymentsHeading="Your payments" widgetUnavailableText="Widget unavailable" />
      </PaymentHistoryWidgetLoaderContext.Provider>,
    );

    expect(await screen.findByRole('alert')).toHaveTextContent('Widget unavailable');
  });
});
