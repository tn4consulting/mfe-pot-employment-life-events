import * as React from 'react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import type { Locale } from '@tn4consulting/shared-i18n';
import type { ChecklistSectionData } from './checklist-data';
import { text } from './checklist-data';

export interface StaticChecklistSectionProps {
  section: ChecklistSectionData;
  locale: Locale;
  completedLabel: string;
  markDoneLabel: string;
  /**
   * Extra `<scds-checklist-item>` element(s) rendered before this
   * section's own static items, inside the same `<scds-checklist>` --
   * lets a widget-backed item (e.g. job search) appear inline with a
   * section's otherwise-static items instead of living in its own
   * separate list.
   */
  leadingItem?: ReactNode;
}

/**
 * Renders the checklist items that have no owning remote to derive real
 * completion from (departure/administrative steps, "update your CV",
 * benefit-eligibility awareness) as a `scds-checklist` -- these are
 * exactly the "anything specific to the loss-of-job life event" items
 * that stay local to this app, self-reported via a plain checkbox slotted
 * into each `scds-checklist-item` rather than backed by another app's
 * live data. Completion state is session-only (not persisted) -- there's
 * no BFF of this app's own to persist it to (see this repo's own
 * CLAUDE.md), and re-confirming on a fresh visit is an acceptable
 * trade-off for a proof-of-technology guided journey.
 */
export function StaticChecklistSection({ section, locale, completedLabel, markDoneLabel, leadingItem }: StaticChecklistSectionProps) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  function toggle(itemId: string) {
    setChecked((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  }

  return (
    <scds-checklist checklist-heading={text(section.heading, locale)}>
      {leadingItem}
      {section.items.map((item) => {
        const itemChecked = checked[item.id] ?? false;
        const checkboxId = `${section.id}-${item.id}`;
        return (
          <scds-checklist-item
            key={item.id}
            item-title={text(item.title, locale)}
            description={text(item.body, locale)}
            complete={itemChecked}
            complete-label={completedLabel}
          >
            <label htmlFor={checkboxId}>
              <input id={checkboxId} type="checkbox" checked={itemChecked} onChange={() => toggle(item.id)} />{' '}
              {itemChecked ? completedLabel : markDoneLabel}
            </label>
            {item.linkHref && item.linkLabel && (
              <scds-link href={item.linkHref} icon-name="arrow-right">
                {text(item.linkLabel, locale)}
              </scds-link>
            )}
          </scds-checklist-item>
        );
      })}
    </scds-checklist>
  );
}
