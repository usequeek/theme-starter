---
name: queek-theme
description: Use when building or changing this Queek storefront theme — components, CSS, demo stores, templates and designs, theme.config.ts or manifest.ts. Covers the theme contract, the kit's hooks and the rules npm run check enforces.
---

# Queek theme

Read `AGENTS.md` first, then `docs/THEME.md` (the contract). Work loop:

1. Change `theme/`.
2. `npm run check` — fix every error it prints; its message says how.
3. `npm run dev` — look at every design (`/<store>`) and its sales and landing pages.

Data comes only from the kit: `useStorefront()` (vendor, config, menus), `useProducts`,
`useShop`, `useCategories`, `useCart`. Links: `menuItemToHref()`; images: `<Image />`.
Never import `next/*`; `Link`, `useRouter` and `usePathname` come from `@usequeek/theme-kit/navigation`.

Manifest: every variant needs a renderer in `index.ts` and declares exactly the fields it
reads; the manifest also needs a `tokens` block and a `subscribe` scope with one default.
Style from the tokens (`var(--fs-*)`, `var(--space-*)`, `var(--radius-*)`), never fixed sizes.
Fonts ship as files in `theme/fonts/`, never from a remote stylesheet or `next/font/*`.

Photos: licensed and unique to this theme (your own, or a free licence that allows commercial use).
Never another store's or a brand's photography, and never the starter's placeholders.

Copy in demo stores is a template: true of any store in that business. No store name,
place, price, offer, hours, delivery or reply times, returns, guarantees, founding date,
email or phone number outside testimonials and reviews.
