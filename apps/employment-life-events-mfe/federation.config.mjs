import { share, withNativeFederation } from '@softarc/native-federation/config';
import {
  sharedFederationRuntimeDependency,
  sharedReactFederationDependencies,
  sharedUiScdsCoreFederationDependency,
} from '@tn4consulting/shared-federation-config/react';

// TEMP LOCAL ADDITION (not yet in the published shared-federation-config):
// register-scds.ts imports `defineCustomElements` from the Stencil-generated
// '@tn4consulting/shared-ui-scds-core/loader' subpath, not just the bare
// package -- but sharedUiScdsCoreFederationDependency's
// `includeSecondaries: false` (deliberately set to dodge the same
// jsx-runtime-style auto-discovery bug documented in
// shared-federation-config/react.js) means only the bare specifier is in
// the shared import map, so this subpath was never resolvable ("Unable to
// resolve specifier '@tn4consulting/shared-ui-scds-core/loader'"). Same fix
// as job-bank's/employment-insurance's federation.config.mjs, until this
// can be folded into the published package properly.
const sharedUiScdsCoreLoader = share({
  '@tn4consulting/shared-ui-scds-core/loader': {
    singleton: true,
    strictVersion: true,
    requiredVersion: 'auto',
    includeSecondaries: false,
  },
});

// React remote -- imports the framework-agnostic core's config API
// (@softarc/native-federation/config), not the Angular wrapper's
// re-export, since this app no longer has Angular installed. Shares
// react/react-dom (this app's exposed `./Component` mounts directly
// inside the shell's own React tree via RemoteRouteHost, so it must
// resolve the same React instance the shell's bundle uses) plus
// shared-federation-runtime (usePaymentHistoryWidgetLoader's/
// useJobApplicationsWidgetLoader's/useEiReportingStatusWidgetLoader's
// Context identity has to cross the federation boundary -- see
// shared-federation-config/react.js's own doc on why this is a separate
// export from sharedReactFederationDependencies) plus shared-ui-scds-core
// (added for the guided-journey checklist's `scds-checklist`/
// `scds-checklist-item` elements -- this app previously had no SCDS
// dependency at all; see this repo's own CLAUDE.md for why that changed).
//
// Only `./Component` is exposed now -- no `./RemoteProviders`. That
// export existed only to carry Angular DI providers (this app's own
// Transloco scope, its CONTENT_CLIENT) across the federation boundary
// for RemoteRouteHost to apply via a child EnvironmentInjector. A React
// remote has no DI tree for a host to populate -- this app does all of
// that setup itself, on mount (see App.tsx).
export default withNativeFederation({
  name: 'employment-life-events-mfe',

  exposes: {
    './Component': './apps/employment-life-events-mfe/src/app/App.tsx',
  },

  shared: {
    ...sharedReactFederationDependencies,
    ...sharedFederationRuntimeDependency,
    ...sharedUiScdsCoreFederationDependency,
    ...sharedUiScdsCoreLoader,
  },
});
