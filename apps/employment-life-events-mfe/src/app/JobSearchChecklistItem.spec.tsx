import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { JobApplicationsWidgetLoaderContext } from '@tn4consulting/shared-federation-runtime';
import { JobSearchChecklistItem } from './JobSearchChecklistItem';

interface FakeWidgetProps {
  onApplicationsLoaded?: (applications: unknown[]) => void;
}

function makeFakeWidget(applications: unknown[]) {
  return function FakeWidget({ onApplicationsLoaded }: FakeWidgetProps) {
    React.useEffect(() => {
      onApplicationsLoaded?.(applications);
    }, [onApplicationsLoaded]);
    return <p>fake job applications widget</p>;
  };
}

const PROPS = {
  title: 'Search and apply for jobs on Job Bank',
  body: 'Browse job postings that match your skills.',
  actionLabel: 'Search Job Bank',
  statusLabel: 'View status',
  completedLabel: 'Completed',
  widgetUnavailableText: 'Job Bank status unavailable',
};

describe('JobSearchChecklistItem', () => {
  it('shows the action link, not the status link, while there are no real applications on file', async () => {
    const loader = jest.fn().mockResolvedValue({ component: makeFakeWidget([]) });

    render(
      <JobApplicationsWidgetLoaderContext.Provider value={loader}>
        <ul>
          <JobSearchChecklistItem {...PROPS} />
        </ul>
      </JobApplicationsWidgetLoaderContext.Provider>,
    );

    // scds-link's slotted label text stays in the light DOM regardless of
    // whether the real Stencil custom element is registered/hydrated (see
    // GuidedJourney.spec.tsx's own comment) -- but its `role="link"`
    // inference does require real hydration jsdom doesn't do here, so
    // this asserts on the text itself rather than the role.
    expect(await screen.findByText('Search Job Bank')).toBeInTheDocument();
    expect(screen.queryByText('View status')).not.toBeInTheDocument();
  });

  it('marks the item complete and swaps to job-bank’s own status once a real application is on file', async () => {
    const loader = jest.fn().mockResolvedValue({ component: makeFakeWidget([{ id: 'app-1' }]) });

    render(
      <JobApplicationsWidgetLoaderContext.Provider value={loader}>
        <ul>
          <JobSearchChecklistItem {...PROPS} />
        </ul>
      </JobApplicationsWidgetLoaderContext.Provider>,
    );

    expect(await screen.findByText('View status')).toBeInTheDocument();
    expect(await screen.findByText('fake job applications widget')).toBeInTheDocument();
  });

  it('shows the degraded state when job-bank’s widget fails to load', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const loader = jest.fn().mockRejectedValue(new Error('load failed'));

    render(
      <JobApplicationsWidgetLoaderContext.Provider value={loader}>
        <ul>
          <JobSearchChecklistItem {...PROPS} />
        </ul>
      </JobApplicationsWidgetLoaderContext.Provider>,
    );

    expect(await screen.findByRole('alert')).toHaveTextContent('Job Bank status unavailable');
  });
});
