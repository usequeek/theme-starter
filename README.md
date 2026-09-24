# Queek theme starter

Build a theme for [Queek](https://usequeek.com) storefronts. This is a complete,
design-free theme and the contract it is checked against. The tools that
preview, check and package it come from npm as
[`@usequeek/theme-cli`](https://github.com/usequeek/theme-tools), so this
repository holds only your theme and updating the tools never touches it.

```bash
npm create @usequeek/theme my-theme
cd my-theme
npm run dev          # http://localhost:3000
```

Or clone it yourself: `git clone https://github.com/usequeek/theme-starter.git my-theme && cd my-theme && npm install`.

A theme is React and CSS. You never configure Next.js; the preview runs it for you.

## Commands

| | |
|---|---|
| `npm run dev` | Preview the theme as a whole store: every page of every demo store. Edits reload the page. |
| `npm run check` | Check it against the Queek theme contract, the rules Queek runs when you submit. |
| `npm run typecheck` | TypeScript. |
| `npm run package` | Zip the theme for submission. |

Each is a `queek-theme` command; run `npx queek-theme <command> --help` for its options.
CI (`.github/workflows/ci.yml`) runs the type check and the theme check on every push, and
annotates pull requests with any findings.

## What is in here

| Path | What it is |
|---|---|
| `theme/` | **Your theme.** A skeleton that already meets the contract: layout, header, footer, blocks, pages, shells, `manifest.ts`, `theme.css`, and `demo.json`, its demo store. Replace the design; keep the contract. |
| `docs/THEME.md` | **The contract.** It is what Queek checks every submitted theme against. |
| `docs/business-vocabulary.json` | The business keys a template's `for` may use. |

The theme is built on [`@usequeek/theme-kit`](https://www.npmjs.com/package/@usequeek/theme-kit).
It provides the data hooks (`useProducts`, `useShop`, `useCart`…), the flows Queek owns
(auth, cart, checkout), and the framework blocks. Your theme owns the design and nothing else.

## Previewing

Every demo store is a **template**, one business your theme can dress. `/default` is
`theme/demo.json`. Each `theme/demos/<id>.json` is another store at `/<id>`. Under each store:

| URL | Page | Your component |
|---|---|---|
| `/<store>` | home | `pages.Home` |
| `/<store>/<slug>` | about, sales, landing, contact… | `pages.Page` |
| `/<store>/shop` | the whole catalogue | `pages.Shop` |
| `/<store>/products/<slug>` | a product | `pages.Product` |
| `/<store>/collections`, `/<store>/collections/<slug>` | collections | `pages.Collections`, `pages.Collection` |
| `/<store>/blog`, `/<store>/blog/<slug>` | the blog | `pages.Blog`, `pages.Post` |

The kit's hooks return the store's demo data there instead of calling an API. Your components
use the same hooks they will use in production; only the source of the data changes.

## Building your theme

1. **Name it.** In `theme/theme.config.ts` set `name` and `slug`, and rename the skeleton's
   identity everywhere it appears: `.theme-bare` in `layout.tsx`, the `bare-` CSS prefix,
   `profile.slug`/`config.theme`/`profile.id` in `demo.json`, and every `products[].shop_id`
   (it must equal `profile.id`). `npm run check` names any you miss.
2. **Design it.** Write the layout, header, footer, blocks and pages. Style from the design
   tokens (`var(--fs-*)`, `var(--space-*)`, `var(--radius-*)`…): a hard-coded size is a setting
   that does nothing in the merchant's editor. Import your own files with relative paths.
3. **Declare your variants** in `theme/manifest.ts`. Each variant needs a component in
   `theme/index.ts`, and exactly the fields that component reads.
4. **Make templates** (below), each with its own demo store.
5. **Check it:** `npm run check` until there are no errors.
6. **Submit it** (below).

### Rules that get a theme rejected

- Never call an API or the SDK. Use the kit's hooks.
- Never import from outside `@usequeek/theme-kit`, except React and Next. If the kit lacks
  something you need, ask for it.
- Never render data the store should supply. A section with hard-coded products looks right
  here and is empty on a real store.
- Never print copy a merchant cannot change. Take it from the section's data, and render
  nothing when it is empty.
- Use `<Image />` from the kit, never a raw `<img>`.

## Templates

A Queek merchant picks a **template**, which is one of your demo stores, and Queek builds their
store from it. It copies the template's page layouts, header, footer, design settings and each
section's style, then fills them with the merchant's own products, photos and copy. What
`/<store>` shows is what the merchant gets.

- **One template per business** your theme serves, for example `food`, `hair` and `clothes`,
  each with that business's own sections: a priced menu, table booking, a size guide. You can
  add up to three versions of one business (`food`, `food-2`) with the same `for` and a
  different design.
- **Declare each one** in `theme/theme.config.ts`. The primary goes in `default_demo`, the
  others in `demos`:
  ```ts
  default_demo: { label: 'Skincare & make-up', for: ['beauty-cosmetics', 'makeup', 'skincare'], description: '…' },
  demos: [
    { id: 'food', label: 'Restaurant & kitchen', for: ['foods', 'local-meals'], description: '…' },
  ],
  ```
  `for` uses only keys from `docs/business-vocabulary.json`. A template
  for a whole business (clothes, food) leads with its business category (`fashion`, `foods`); a
  template for one kind of product (hair, shoes, jewellery) names only its product keys
  (`wigs-extensions-hair-accessories`), never the business.
  `description` is at most 300 characters and says who the template fits, the look, its
  signature sections and the photos it needs. Queek's AI picks templates for merchants from
  it. The starter ships a placeholder description the check rejects, so write yours.
- **Each template ships an `about`, a `sales` and a `landing` page.** A sales page sells one to
  three products: a hero of the product's photos, a `spotlight`/`featured` product section in
  the first three sections, and a contact section at the end. A landing page is a campaign.
- **No two templates may share a home page.** Use a different section order and different
  variants.
- **Write copy as a template, not as one shop.** "Wash, deep condition and braid" works for
  any hair store. Queek publishes a template's copy onto new stores as it is, so never name
  your demo store, a place, the year it opened or its email and phone, and never state a price or promise
  (delivery times, return periods, free delivery, guarantees). Testimonials and reviews are exempt. The check
  enforces this.
- **Photos:** reference any public URL. Queek moves them to its CDN when your theme is
  published. Never use a real brand's photography.
- **Screenshots:** a 1280×800 capture of each template's first screen, `theme/theme.jpg` for
  the primary and `theme/demos/<id>.jpg` for the others.

Every rule is in `docs/THEME.md` → Templates.

## Submitting

Push your theme to a git repository and send the URL (or the zip from `npm run package`) to
the Queek team. Queek uploads your demo images and screenshots to its CDN, runs every check —
the ones `npm run check` runs plus a few only Queek can (it lists them) — and either publishes
the theme or tells you exactly what failed. Nothing is half-published.

## Requirements

Node.js 22.12 or later.

## License

See [LICENSE.md](LICENSE.md). You may use this code to build and submit themes for Queek
storefronts. All other uses are prohibited.
