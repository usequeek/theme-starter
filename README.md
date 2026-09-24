# Queek theme starter

Build a theme for [Queek](https://usequeek.com) storefronts. This repository is
a complete, design-free theme plus a preview app that renders it as a whole
store, every page, from demo data. You need no backend, no Queek account and no
access to Queek's code.

```bash
git clone https://github.com/usequeek/theme-starter.git my-theme
cd my-theme
npm install
npm run dev          # http://localhost:3000
```

Open http://localhost:3000. It lists your theme's stores and their pages. Edit
anything under `theme/` and the page reloads.

## What is in here

| Path | What it is |
|---|---|
| `theme/` | **Your theme.** A skeleton that already meets the contract: layout, header, footer, blocks, pages, shells, `manifest.ts`, `theme.css`, and `demo.json`, its demo store. Replace the design; keep the contract. |
| `app/` | The preview. It mounts your theme the way a live Queek storefront does. You do not need to change it. |
| `docs/THEME.md` | **The contract.** It is what Queek checks every submitted theme against. |
| `docs/business-vocabulary.json` | The business keys a template's `for` may use. |

The theme is built on [`@usequeek/theme-kit`](https://www.npmjs.com/package/@usequeek/theme-kit).
It provides the data hooks (`useProducts`, `useShop`, `useCart`…), the flows
Queek owns (auth, cart, checkout), and the framework blocks. Your theme owns
the design and nothing else.

## Previewing

Every demo store is a **template**, one business your theme can dress. `/default`
is `theme/demo.json`. Each `theme/demos/<id>.json` is another store at `/<id>`.
Under each store:

| URL | Page | Your component |
|---|---|---|
| `/<store>` | home | `pages.Home` |
| `/<store>/<slug>` | about, sales, landing, contact… | `pages.Page` |
| `/<store>/shop` | the whole catalogue | `pages.Shop` |
| `/<store>/products/<slug>` | a product | `pages.Product` |
| `/<store>/collections`, `/<store>/collections/<slug>` | collections | `pages.Collections`, `pages.Collection` |
| `/<store>/blog`, `/<store>/blog/<slug>` | the blog | `pages.Blog`, `pages.Post` |

The kit's hooks return the store's demo data here instead of calling an API.
Your components use the same hooks they will use in production; only the
source of the data changes.

## Building your theme

1. **Name it.** In `theme/theme.config.ts` set `name` and `slug`, and rename the
   skeleton's identity everywhere it appears: `.theme-bare` in `layout.tsx`, the
   `bare-` CSS prefix, `profile.slug`/`config.theme`/`profile.id` in
   `demo.json`, and every `products[].shop_id` (it must equal `profile.id`).
2. **Design it.** Write the layout, header, footer, blocks and pages. Style from
   the design tokens (`var(--fs-*)`, `var(--space-*)`, `var(--radius-*)`…): a
   hard-coded size is a setting that does nothing in the merchant's editor.
3. **Declare your variants** in `theme/manifest.ts`. Each variant needs a
   component in `theme/index.ts`, and exactly the fields that component reads.
4. **Make templates** (below), each with its own demo store.
5. **Check it:** `npm run typecheck` and `npm run build`. CI runs both on every
   push. Then read the checklist in `docs/THEME.md` → Validation.
6. **Submit it** (below).

### Rules that get a theme rejected

- Never call an API or the SDK. Use the kit's hooks.
- Never import from outside `@usequeek/theme-kit`, except React and Next. If
  the kit lacks something you need, ask for it.
- Never render data the store should supply. A section with hard-coded
  products looks right here and is empty on a real store.
- Never print copy a merchant cannot change. Take it from the section's data,
  and render nothing when it is empty.
- Use `<Image />` from the kit, never a raw `<img>`.

## Templates

A Queek merchant picks a **template**, which is one of your demo stores, and
Queek builds their store from it. It copies the template's page layouts,
header, footer, design settings and each section's style, then fills them with
the merchant's own products, photos and copy. What `/<store>` shows is what the
merchant gets.

- **One template per business** your theme serves, for example `food`, `hair`
  and `clothes`, each with that business's own sections: a priced menu, table
  booking, a size guide. You can add up to three versions of one business
  (`food`, `food-2`) with the same `for` and a different design.
- **Declare each one** in `theme/theme.config.ts`. The primary goes in
  `default_demo`, the others in `demos`:
  ```ts
  default_demo: { label: 'Skincare & make-up', for: ['makeup', 'skincare', 'beauty-cosmetics'], description: '…' },
  demos: [
    { id: 'food', label: 'Restaurant & kitchen', for: ['foods', 'local-meals'], description: '…' },
  ],
  ```
  `for` uses only keys from `docs/business-vocabulary.json`, most specific
  first. `description` is at most 300 characters and says who the template
  fits, the look, its signature sections and the photos it needs. Queek's AI
  picks templates for merchants from it.
- **Each template ships an `about`, a `sales` and a `landing` page.** A sales
  page sells one to three products: a hero of the product's photos, a
  `spotlight`/`featured` product section in the first three sections, and a
  contact section at the end. A landing page is a campaign.
- **No two templates may share a home page.** Use a different section order
  and different variants.
- **Write copy as a template, not as one shop.** "Wash, deep condition and
  braid" works for any hair store. Queek rewrites the copy for each merchant.
- **Photos:** reference any public URL. Queek moves them to its CDN when your
  theme is published. Never use a real brand's photography.

Every rule is in `docs/THEME.md` → Templates.

## Submitting

Push your theme to a git repository and send the URL to the Queek team. Queek
runs `theme:pull` on it. That uploads your demo images and your screenshots to
Queek's CDN, then runs every check in `docs/THEME.md`. It either publishes the
theme or rejects it with a list of what failed. Nothing is half-published.

Include a 1280×800 screenshot of each template's first screen:
`theme/theme.jpg` for the primary, `theme/demos/<id>.jpg` for the others.

A checker you can run yourself before submitting, like Shopify's
`theme check`, is coming. Until then, the checks and their explanations are in
`docs/THEME.md`.

## Requirements

Node 20 or later. `transpilePackages: ['@usequeek/theme-kit']` in
`next.config.ts` is already set. The kit ships TypeScript source so its
`'use client'` directives reach the bundler; without that line nothing
resolves.

## License

See [LICENSE.md](LICENSE.md). You may use this code to build and submit themes
for Queek storefronts. All other uses are prohibited.
