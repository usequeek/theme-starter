'use client';

import type { JSX } from 'react';
import type { ContactBlockData } from '@usequeek/theme-kit/types/block';
import { useThemeStrings } from '@usequeek/theme-kit/provider';

/** How to reach the store: its own words and facts, and nothing when it has none. */
export function ContactBlock({ heading, description, email, phone, address, hours }: ContactBlockData): JSX.Element | null {
  const t = useThemeStrings();
  const facts: Array<[string, string]> = [
    [t('contact.email'), email],
    [t('contact.phone'), phone],
    [t('contact.address'), address],
    [t('contact.hours'), hours],
  ]
    .filter((fact): fact is [string, string] => typeof fact[1] === 'string' && fact[1].trim() !== '');
  if (!heading && !description && facts.length === 0) return null;
  return (
    <section className="bare-section bare-contact">
      {heading ? <h2 className="bare-section__title">{heading}</h2> : null}
      {description ? <p className="bare-prose">{description}</p> : null}
      {facts.length > 0 ? (
        <dl className="bare-contact__facts">
          {facts.map(([label, value]) => (
            <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
          ))}
        </dl>
      ) : null}
    </section>
  );
}
