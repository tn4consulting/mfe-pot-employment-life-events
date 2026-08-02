import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ContentClient } from '@tn4consulting/shared-content-client';
import { TranslocoTestingModule } from '@tn4consulting/shared-i18n';
import { clearSession, createMockSession, storeSession } from '@tn4consulting/shared-auth';
import { CONTENT_CLIENT } from './content-client.token';
import { App } from './app';

describe('App', () => {
  const contentClient: jest.Mocked<ContentClient> = {
    getPageContent: jest.fn().mockResolvedValue(null),
  };

  afterEach(() => {
    clearSession();
    contentClient.getPageContent.mockReset().mockResolvedValue(null);
  });

  async function setup() {
    await TestBed.configureTestingModule({
      imports: [
        App,
        TranslocoTestingModule.forRoot({
          langs: {
            en: { auth: { signInRequired: 'You need to sign in to view your guided journey.' } },
            fr: { auth: { signInRequired: 'Vous devez ouvrir une session.' } },
          },
          translocoConfig: { availableLangs: ['en', 'fr'], defaultLang: 'en' },
        }),
      ],
      providers: [provideRouter([]), { provide: CONTENT_CLIENT, useValue: contentClient }],
    }).compileComponents();
  }

  it('should create the app', async () => {
    storeSession(createMockSession());
    await setup();
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the guided journey when the claim is present', async () => {
    storeSession(createMockSession());
    await setup();
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(
      compiled.querySelector('lib-employment-life-events-feature-guided-journey'),
    ).not.toBeNull();
  });

  it('renders intro content fetched via ContentClient', async () => {
    storeSession(createMockSession());
    contentClient.getPageContent.mockResolvedValue({
      key: 'employment-life-events.intro',
      title: "You lost your job — here's what to do next",
      body: 'Guidance on CVs, job search, and Employment Insurance.',
    });
    await setup();
    const fixture = TestBed.createComponent(App);
    await fixture.componentInstance.ngOnInit();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('You lost your job');
  });

  it('blocks its own content when there is no active session, independent of the shell', async () => {
    clearSession();
    await setup();
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(
      compiled.querySelector('lib-employment-life-events-feature-guided-journey'),
    ).toBeNull();
    expect(compiled.querySelector('[role="alert"]')?.textContent).toContain('sign in');
  });
});
