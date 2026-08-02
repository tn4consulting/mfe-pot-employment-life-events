import { provideMfeTransloco } from '@tn4consulting/shared-i18n';
import { CONTENT_CLIENT, createContentClient } from './content-client.token';
import { loadRuntimeConfig } from '../runtime-config';

// Split across two statements deliberately: Vite/esbuild specially
// recognize the inline pattern `new URL('...', import.meta.url)` and
// rewrite it for static asset bundling, which hijacks this computation in
// dev mode (it resolves to a dev-server /@fs/ disk path instead of this
// remote's actual serving origin). Storing import.meta.url first avoids
// that -- see apps/shell/src/app/app.config.ts for the fuller story.
const moduleUrl = import.meta.url;
const assetBaseUrl = new URL('.', moduleUrl).href;

// A Promise, not a plain array, now that ContentClient needs this app's own
// fetched strapiBaseUrl (see runtime-config.ts) -- RemoteRouteHost already
// awaits REMOTE_PROVIDERS either way (see shared-federation-runtime).
export const REMOTE_PROVIDERS = loadRuntimeConfig(assetBaseUrl).then((runtimeConfig) => [
  ...provideMfeTransloco(assetBaseUrl),
  {
    provide: CONTENT_CLIENT,
    useValue: createContentClient(runtimeConfig.strapiBaseUrl),
  },
]);
