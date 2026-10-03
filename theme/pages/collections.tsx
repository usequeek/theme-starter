'use client';

import type { JSX } from 'react';
import { Link } from '@usequeek/theme-kit/navigation';
import type { CollectionsPageProps } from '@usequeek/theme-kit/types/theme';
import { Image } from '@usequeek/theme-kit/components/image';
import { useHref } from '@usequeek/theme-kit/hooks/use-href';
import { useThemeStrings } from '@usequeek/theme-kit/provider';

export function Collections({ collections }: CollectionsPageProps): JSX.Element {
  const t = useThemeStrings();
  const href = useHref();

  return (
    <main className="bare-main">
      <h1 className="bare-page__title">{t('collections.title')}</h1>
      <ul className="bare-grid">
        {collections.map((collection) => (
          <li key={collection.id} className="bare-card">
            <Link href={href(`/collections/${collection.slug}`)}>
              <Image src={collection.image ?? undefined} alt={collection.name} className="bare-card__image" />
              <h2 className="bare-card__title">{collection.name}</h2>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
