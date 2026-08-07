// Registers the SCDS custom elements this app renders (scds-checklist,
// scds-checklist-item, scds-link) once, as a side effect -- same pattern
// as job-bank's/dashboard's own register-scds.ts. Belongs here rather
// than in bootstrap.tsx: when federated, the shell mounts App.tsx
// directly (see federation.config.mjs's `exposes`) and this app's own
// bootstrap.tsx never runs -- so the exposed entry point imports this
// module itself. Stencil's own loader guards against double-registering
// (customElements.get(tag) || customElements.define(...)), so importing
// this from multiple modules is harmless even if both happen to load in
// the same page.
import { defineCustomElements } from '@tn4consulting/shared-ui-scds-core/loader';

defineCustomElements();
