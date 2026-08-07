import type { DetailedHTMLProps, HTMLAttributes } from 'react';

/**
 * Minimal JSX typing for the SCDS custom elements this app renders
 * directly -- see mfe-pot-dashboard-mfe's own scds-elements.d.ts for the
 * pattern this follows (every prop below has a real kebab-case
 * `attribute` mapping confirmed against `@tn4consulting/shared-ui-scds-core`'s
 * compiled Stencil metadata, so a plain HTML attribute in JSX is enough).
 */
type ScdsElementProps = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'scds-checklist': ScdsElementProps & {
        'checklist-heading'?: string;
        'heading-tag'?: 'h2' | 'h3' | 'h4';
        'list-label'?: string;
      };
      'scds-checklist-item': ScdsElementProps & {
        'item-title'?: string;
        description?: string;
        complete?: boolean | string;
        'complete-label'?: string;
      };
      'scds-link': ScdsElementProps & { href?: string; 'icon-name'?: string; 'icon-position'?: 'start' | 'end' };
    }
  }
}

export {};
