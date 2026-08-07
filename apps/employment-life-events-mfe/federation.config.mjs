import { withNativeFederation } from '@softarc/native-federation/config';
import {
  sharedFederationRuntimeDependency,
  sharedReactFederationDependencies,
} from '@tn4consulting/shared-federation-config/react';

// React remote -- imports the framework-agnostic core's config API
// (@softarc/native-federation/config), not the Angular wrapper's
// re-export, since this app no longer has Angular installed. Shares
// react/react-dom (this app's exposed `./Component` mounts directly
// inside the shell's own React tree via RemoteRouteHost, so it must
// resolve the same React instance the shell's bundle uses) plus
// shared-federation-runtime (usePaymentHistoryWidgetLoader's Context
// identity has to cross the federation boundary -- see
// shared-federation-config/react.js's own doc on why this is a separate
// export from sharedReactFederationDependencies).
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
  },
});
