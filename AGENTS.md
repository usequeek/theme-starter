# Building a Queek theme

This repository is one theme for Queek storefronts. The theme is the `theme/` folder:
React components and CSS on top of `@usequeek/theme-kit`. The contract it is checked
against is `docs/THEME.md`; read it before changing anything.

## Commands

- `npm run dev` — preview every page of every demo store at http://localhost:3000
- `npm run check` — the rules Queek runs on submission. It is the judge: work until it
  reports no errors. It also lists the checks only Queek can run.
- `npm run typecheck`
- `npm run package` — the zip to submit

## What fails a submission

- Calling an API or the SDK, or writing to the kit's stores. Use the kit's hooks
  (`useProducts`, `useShop`, `useCart`…).
- Hard-coding anything a merchant or Queek must be able to replace: store names, copy,
  prices, contact details. Take it from the section's data or the vendor; render nothing
  when it is empty (`theme/vendor-facts`).
- Template copy that names the demo store, a place, a naira amount, an offer or coupon
  code, opening hours, a promise only the vendor can make (delivery or reply times,
  returns, guarantees), a founding date, or an email or phone number
  (`theme/template-copy`). Queek publishes a template's copy onto new stores unchanged.
- The starter's placeholder products and photos (`theme/placeholder-content`). Every
  template needs its own products and licensed photos — never another store's or a brand's.
- A raw `<img>` (use `<Image />` from the kit), or `next/font/google` (ship font files).

## Templates

Each demo store is a template for one business: `theme/demo.json` (the primary) and
`theme/demos/<id>.json`, declared in `theme/theme.config.ts` with `for` keys from
`docs/business-vocabulary.json`. A whole business leads with its category (`fashion`);
a niche names only its product keys. No two templates may share a home page. Each needs
about, sales and landing pages and a description of at most 300 characters.

## Style

Style from the design tokens (`var(--fs-*)`, `var(--space-*)`, `var(--radius-*)`…), never
fixed sizes. Any structure is allowed if `npm run check` passes.
