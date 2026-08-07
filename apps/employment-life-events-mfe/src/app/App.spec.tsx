import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { clearSession, createMockSession, storeSession } from '@tn4consulting/shared-auth/core';
import { App } from './App';

jest.mock('./asset-base-url', () => ({ assetBaseUrl: 'http://localhost:4202/' }));

jest.mock('../runtime-config', () => ({
  loadRuntimeConfig: jest.fn().mockResolvedValue({ strapiBaseUrl: undefined }),
}));

const getPageContentMock = jest.fn();
jest.mock('./content-client', () => ({
  INTRO_CONTENT_KEY: 'employment-life-events.intro',
  createContentClient: () => ({ getPageContent: getPageContentMock }),
}));

describe('App', () => {
  beforeEach(() => {
    getPageContentMock.mockReset().mockResolvedValue(null);
    global.fetch = jest.fn().mockResolvedValue({
      json: () =>
        Promise.resolve({
          journey: { paymentsHeading: 'Your payments at a glance', widgetUnavailable: 'Widget unavailable' },
          auth: { signInRequired: 'You need to sign in to view your guided journey.' },
        }),
    }) as jest.Mock;
  });

  afterEach(() => {
    clearSession();
    jest.restoreAllMocks();
  });

  it('renders the guided journey when the claim is present', async () => {
    storeSession(createMockSession());
    render(<App />);

    expect(await screen.findByRole('heading', { name: 'Your payments at a glance' })).toBeInTheDocument();
  });

  it('renders intro content fetched via ContentClient', async () => {
    storeSession(createMockSession());
    getPageContentMock.mockResolvedValue({
      key: 'employment-life-events.intro',
      title: "You lost your job — here's what to do next",
      body: 'Guidance on CVs, job search, and Employment Insurance.',
    });

    render(<App />);

    expect(
      await screen.findByRole('heading', { name: "You lost your job — here's what to do next" }),
    ).toBeInTheDocument();
  });

  it('blocks its own content when there is no active session, independent of the shell', async () => {
    clearSession();
    render(<App />);

    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toContain('sign in');
    expect(screen.queryByRole('heading', { name: 'Your payments at a glance' })).not.toBeInTheDocument();
  });
});
