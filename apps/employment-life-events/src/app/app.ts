import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EmploymentLifeEventsFeatureGuidedJourney } from 'employment-life-events-feature-guided-journey';
import { PageContent } from '@tn4consulting/shared-content-client';
import { TranslocoPipe, getStoredLocale, onLocaleChange } from '@tn4consulting/shared-i18n';
import { CLAIM_EMPLOYMENT_LIFE_EVENTS, getStoredSession, hasClaim, onSessionChange } from '@tn4consulting/shared-auth';
import { CONTENT_CLIENT, INTRO_CONTENT_KEY } from './content-client.token';

@Component({
  imports: [EmploymentLifeEventsFeatureGuidedJourney, RouterModule, TranslocoPipe],
  selector: 'msca-le-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  protected title = 'employment-life-events';
  // Defense in depth: this app validates its own claim independently,
  // never assuming "the shell let me navigate here, so I'm authorized" --
  // see CLAUDE.md's "Security: defense in depth" section.
  protected readonly hasAccess = signal(
    hasClaim(getStoredSession(), CLAIM_EMPLOYMENT_LIFE_EVENTS),
  );
  protected readonly intro = signal<PageContent | null>(null);
  protected readonly introLoadError = signal(false);

  private readonly contentClient = inject(CONTENT_CLIENT);

  constructor() {
    const unsubscribe = onSessionChange((session) =>
      this.hasAccess.set(hasClaim(session, CLAIM_EMPLOYMENT_LIFE_EVENTS)),
    );
    inject(DestroyRef).onDestroy(unsubscribe);
  }

  ngOnInit(): void {
    // CMS content (unlike Transloco chrome text) isn't reactive by
    // default, so this app explicitly re-fetches whenever the
    // cross-remote active locale changes -- same pattern as
    // dashboard/job-bank/employment-insurance's app.ts, EXCEPT those read
    // the current locale via `inject(TranslocoService).getActiveLang()`/
    // `.langChanges$`, which this app deliberately doesn't: this app's
    // `employment-life-events-feature-guided-journey` lib already imports
    // `TranslocoPipe` from the same `@tn4consulting/shared-i18n` package
    // (for its own chrome text), and explicitly injecting `TranslocoService`
    // as well -- a *second*, separate construction site for the same
    // bare-class-provided service -- hits a real esbuild/Vite bundling bug:
    // the app-level and lib-level imports of shared-i18n end up as two
    // independently bundled copies with mismatched `InjectionToken`
    // identities (confirmed via `NG0201: No provider found for
    // InjectionToken TRANSLOCO_TRANSPILER`, alongside an `NG0912`
    // component-ID collision warning naming a duplicated
    // `TranslocoLoaderComponent`). job-bank/employment-insurance/dashboard
    // never hit this because none of their feature libs import
    // TranslocoPipe (their templates have no bilingual chrome text yet).
    // `getStoredLocale`/`onLocaleChange` are plain functions (localStorage
    // + a window CustomEvent, not Angular DI), so they read the exact same
    // cross-remote locale state without needing a second TranslocoService
    // construction at all.
    this.loadIntro(getStoredLocale());
    onLocaleChange((locale) => this.loadIntro(locale));
  }

  private async loadIntro(lang: string): Promise<void> {
    try {
      this.intro.set(
        await this.contentClient.getPageContent(INTRO_CONTENT_KEY, lang === 'fr' ? 'fr' : 'en'),
      );
      this.introLoadError.set(false);
    } catch (err) {
      console.error('Failed to load employment-life-events intro content', err);
      this.introLoadError.set(true);
    }
  }
}
