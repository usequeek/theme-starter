'use client';

import type { JSX } from 'react';
import type { ShopPageProps } from '@usequeek/theme-kit/types/theme';
import { useShop } from '@usequeek/theme-kit/hooks/use-shop';
import { useShopParams } from '@usequeek/theme-kit/hooks/use-shop-params';
import { useThemeStrings } from '@usequeek/theme-kit/provider';
import { ProductsBlock } from '../blocks/products';

/**
 * /shop browses EVERY product, filtered by category. Distinct from
 * /collections, which lists curated collection tiles. Keep them distinct —
 * they answer different questions.
 */
export function Shop({ categories }: ShopPageProps): JSX.Element {
  const t = useThemeStrings();
  const { categorySlug, keyword, sort, page, setCategory } = useShopParams();
  const { products, isLoading } = useShop({ categorySlug, keyword, sort, page });

  return (
    <main className="bare-main">
      <h1 className="bare-page__title">{t('shop.title')}</h1>

      <nav className="bare-shop__filters" aria-label={t('shop.filters')}>
        <button type="button" onClick={() => setCategory(null)}>{t('shop.all')}</button>
        {categories.map((category) => (
          <button type="button" key={category.id} onClick={() => setCategory(category.slug)}>
            {category.name}
          </button>
        ))}
      </nav>

      {isLoading ? <p className="bare-shop__state">{t('shop.loading')}</p> : <ProductsBlock products={products} />}
    </main>
  );
}
