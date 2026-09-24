> **This is the contract every Queek theme is checked against when it is submitted.**
> It is maintained in Queek's storefront repository and copied here on every
> release of this starter. Commands such as `yarn theme:check`, `yarn theme:new`
> and `yarn theme:pull` run on Queek's side; in this repository you run
> `npm run dev`, `npm run check` (the same rules, as `queek-theme check`) and
> `npm run package`, and your theme is the `theme/` folder (what the contract
> calls `themes/<slug>/`).

# Theme Specification

Every theme lives in `themes/<slug>/` and must satisfy the requirements below.

## Building from outside this repo

You do not need access to this codebase. The framework is published:

```bash
npm install @usequeek/theme-kit
```

Start with **`npm create @usequeek/theme my-theme`** — it copies the public
[theme starter](https://github.com/usequeek/theme-starter) (theme files only, like
Shopify's skeleton-theme) and installs the tools, `@usequeek/theme-cli`
([github.com/usequeek/theme-tools](https://github.com/usequeek/theme-tools)):

```bash
npm create @usequeek/theme my-theme
cd my-theme
npm run dev       # queek-theme dev: every page of every demo store, real Next.js
npm run check     # queek-theme check: this document's rules, on your machine
npm run package   # queek-theme package: a zip for submission
```

Everything below still applies: the starter ships the same `_bare` skeleton
`yarn theme:new` scaffolds (as `theme/`), this document (as `docs/THEME.md`) and the
business vocabulary. `queek-theme check` runs the same rules as `yarn theme:check`
except the few that need Queek's side (divergence from our themes, the render probe,
art and screenshot upload), which it lists. The starter is assembled from this repo
by `yarn starter:publish`; `yarn verify-starter` (CI) proves the whole journey against
the published tools.

Send the finished theme as a git URL or a directory. It comes in through
`yarn theme:pull <source>`, which rehosts your demo art onto our CDN, runs the
rules in this document, and publishes — or removes every trace and tells you
exactly what failed. There is no partial submission: a theme that would render
holes in a vendor's store does not land.

The rules that get a theme rejected are not style preferences. Never fetch,
never touch the SDK, never mutate a store, never hardcode data a real store
supplies. A section with hardcoded products looks perfect against demo data and
is empty on a live storefront.

## Build a theme in seven steps

```bash
# 1. Scaffold from the bare skeleton — never from a finished theme
yarn theme:new aurora --name "Aurora" --prefix au

# 2. Preview it
yarn dev                                  # → preview.localhost:3001/aurora

# 3–5. Build. Then, whenever you want to know where you stand:
yarn theme:check aurora                   # what would block publication, and why
yarn theme:check aurora --json            # same, for an agent to iterate against
yarn theme:check aurora --fix             # the fixes that need no decision
```

**3. Write the components.** `layout`, `header`, `footer`, `blocks/`, `pages/`,
`shells/`. They are ordinary React. Data arrives as props, or through a core
hook (`useProducts`, `useCategories`, `useCart`, `useVariantSelection`). You
never fetch, never touch the SDK, never mutate a store — core owns behaviour so
that every theme gets the same fixes.

**4. Declare your variants in `manifest.ts`.** Each one needs a renderer in
`index.ts` and exactly the fields its component reads. This is where most
rejections come from, and the rules explain each one.

**5. Style from design tokens.** `var(--fs-*)`, `var(--space-*)`,
`var(--radius-*)`, `var(--image-*)`. A hardcoded size is a dial that does
nothing in the merchant's editor.

**6. Rewrite `demo.json`.** It looks like filler and is not: it is both what a
vendor previews before choosing your theme AND what the store builder composes
real stores from. Reference art on any CDN — it gets rehosted when your theme is
published.

**7. Submit.** Open a PR, or send the folder and a maintainer runs
`yarn theme:pull <path|git-url>`. Same rules either way, and a theme publishes
only when every blocking finding is clear.

The rules in `yarn theme:check` are the same ones CI runs — there is no second
definition of "valid" waiting to reject you later. When this document and the
checker disagree, the checker is the contract.

## Core Principle

**Themes own design. Core owns logic.**

Themes provide layouts, styles, and visual presentation. They NEVER implement auth, cart, checkout, or API logic. Those flows live in `@usequeek/theme-kit` (source in the `usequeek/theme-kit` repo, installed from npm) and are consumed by themes as pre-built components or headless hooks.

---

## What themes CAN do

- Render any layout (sidebar, split-screen, single-page, multi-page)
- Style all `.core-*` CSS classes (auth modal, checkout form, cart items, fees)
- Place `<AuthFlow />`, `<CheckoutController />` anywhere in the layout
- Provide `AuthRenderer` to wrap the auth flow in a custom modal/sidebar/inline design
- Provide shell components (`CartShell`, `LoginShell`, `SignupShell`, `AccountShell`) that receive pre-rendered ReactNode slots and arrange them visually
- Read vendor/config data via `useStorefront()`, `useProducts()`, `useCategories()`
- Trigger modals via store openers: `useAuthModalStore().open()`, `useCartPanelStore().open()`
- Use `<Image />` from `@usequeek/theme-kit/components/image` for all images — provides broken-image fallback + Smart Placeholder support (see below)
- Style framework-owned blocks (divider, embed, video, table, button, image, content/default) via `.theme-<slug> .core-block-*` scoped selectors

## What themes MUST NOT do

- Import `@queekai/client-sdk` or `@usequeek/theme-kit/sdk/*`
- Call API endpoints directly (no `fetch`, no `axios`, no `client.get/post`)
- Mutate core stores (`setUser`, `clearShopCart`, `setDeliveryMode`, etc.)
- Re-implement auth flow (phone/OTP/signup logic)
- Re-implement checkout flow (fees, submit, payment method selection)
- Import from other themes
- Use raw `<img>` tags — use `<Image />` from `@usequeek/theme-kit/components/image` instead
- Re-implement framework-owned blocks — these live in `@usequeek/theme-kit/shared-blocks`; themes style them via CSS only (see Framework-Owned Blocks below)
- Generate variant thumbnails — Queek's build pipeline handles this centrally (see Variant Thumbnails below)
- Reference an external image host or a local file from `demo.json` — run `yarn theme:rehost-images` and commit the rewritten file (see Demo Art Hosting below)
- Read browser-only state during render (`window`, `document`, `localStorage`, `Date.now()`, `Math.random()`) or format with the runtime's default locale (`toLocaleDateString()` with no locale) — every theme component is **server-rendered**, and the server's HTML must match the browser's first render. Read browser state in `useEffect` / `useSyncExternalStore`; pass an explicit locale and `timeZone` to date/number formatting. `tests/vendor-shell-ssr.test.tsx` server-renders every theme's chrome

---

## Submitting a theme built outside this repo

```bash
yarn theme:pull <local-path|git-url> [--as <slug>] [--keep-on-fail]
```

It copies the theme in, runs the same rules `yarn theme:check` and CI run, and
publishes only if every blocking finding is clear — registering the loader entry
and regenerating the registry. **All or nothing**: a rejected pull removes the
copy and rolls back the loader entry, so a half-registered theme can never
render holes in a vendor's store. `--keep-on-fail` leaves the files for
inspection, still unpublished.

**Assets.** Build against whatever CDN you like — `theme:pull` moves your demo
art onto Queek's CDN before it validates, and rewrites `demo.json` to match. You
never need our storage credentials, and the "no foreign hosts" rule is satisfied
by the pipeline rather than by you. (Working inside this repo instead? `yarn
theme:check <slug> --fix` does the same thing.) A dead or unreachable image
fails the pull — it is named, and nothing is published.

Validation renders the theme, so pulling runs third-party code in that process.
No scripts from the pulled repo are executed and its `node_modules`/`.git` are
never copied, but it is a deliberate act — read what you pull.

---

## Starting a new theme

```bash
yarn theme:new <slug> --name "Display Name" --prefix xx
```

It scaffolds from **`themes/_bare`** — the contract with no design in it:
semantic markup, token-wired CSS, correct data binding, one variant per scope.
It rewrites every identity reference (manifest slug, config, `.theme-<slug>`
root class, CSS prefix, demo profile), registers the theme in `vendor-shell.tsx`
— a theme missing from that map never renders — and regenerates the registry.
The result passes `yarn theme:check` on day one, so every later failure is about
your work rather than the skeleton.

**Do not start from a finished theme.** `--from <theme>` exists, but whatever
you start from you inherit, and inherited design is the thing nobody goes back
and rewrites — six themes here still share one hand-rolled product page because
of exactly that. Start bare and let the rules tell you what is missing.

It gives you a working theme, not a designed one. What you own from there: the
tokens and CSS, the layout and chrome, the blocks, and **`demo.json`** — it is
still the base theme's store, and it is both what vendors preview and what the
backend builder composes real stores from. Replace the art, then run
`yarn theme:rehost-images --theme <slug>`.

---

## Required Files

```
themes/<slug>/
  index.ts              # ThemeModule default export
  manifest.ts           # Theme metadata + variant declarations
  theme.config.ts       # Author, tags, categories, rank
  layout.tsx            # Root wrapper — applies .theme-<slug> class
  header.tsx            # Default header component
  footer.tsx            # Default footer component
  theme.css             # Design tokens + .core-* class styling
  demo.json             # Preview data — MUST showcase every component (see below)
  demos/<id>.json       # Optional alternative stores (see Alternative demo stores)
  theme.png             # Screenshot (1280x800)
  blocks/
    gallery.tsx              # Identity block — hero slideshow/image
    products.tsx             # Identity block — product grid/carousel
    categories.tsx           # Identity block — collection browser
    contact.tsx              # Identity block — store map + contact details
    content-variants.tsx     # Structured content variants (promo, brand-story, testimonials, marquee, etc.)
  pages/
    home.tsx  page.tsx  blog.tsx  post.tsx
    collection.tsx  product.tsx  gallery-page.tsx   # product.tsx MUST place <ProductMetafields /> — see Custom data below
    shop.tsx                     # Shop page — all products with category sidebar + sort/search
```

### Optional files

```
  shells/                        # Layout wrappers receiving ReactNode slots
    cart-shell.tsx               # Props: CartShellProps (items, summary, actions, empty)
    login-shell.tsx              # Props: LoginShellProps (children)
    signup-shell.tsx             # Props: SignupShellProps (children)
    account-shell.tsx            # Props: AccountShellProps (children)
  components/
    modal-layer.tsx              # Theme-level modals (product, search, orders)
  headers/                       # Header variants (if manifest declares them)
  footers/                       # Footer variants
```

---

## Shop Page (REQUIRED — `pages/shop.tsx`)

The `/shop` page is a **required** part of every theme. It is the vendor's full product catalogue — browseable, filterable, and sortable. It is **not** the same as `/collections` (which shows collection tiles). Collections appear here as **sidebar filters**.

### Props contract (`ShopPageProps`)

```ts
interface ShopCategory {
  id: string;        // UUID — pass this as categoryId to useShop()
  slug: string;
  name: string;
  image?: string | null;
  products_count?: number;
  children?: ShopCategory[];  // nested subcategories
}

interface ShopPageProps {
  categories: ShopCategory[];  // SSR-loaded; may be empty if vendor has none
}
```

### Products hook (`useShop`)

Import from `@usequeek/theme-kit/hooks/use-shop`. Products are loaded client-side so filters feel instant.

```ts
import { useShop } from '@usequeek/theme-kit/hooks/use-shop';

const { products, isLoading, meta, loadMore } = useShop({
  categoryId: activeCategoryId, // string | null  — filters to that category tree
  keyword: searchQuery,          // string | null  — keyword search
  sort: 'latest',               // 'latest' | 'popular' | 'price_low' | 'price_high'
  perPage: 24,                  // default 24, max 60
});

// meta: { currentPage, perPage, hasMore }
// Call loadMore() to append the next page
```

### Backend endpoint (for reference — do NOT call directly)

`GET /api/v1/client/store/products?per_page=24&page=1&category_id=UUID&keyword=&sort=latest`

Returns paginated product objects with the same shape as collection products. The `meta` block contains `current_page`, `per_page`, `from`, `to` (use `to - from + 1 >= per_page` as `hasMore`).

### Design requirements

- **Left sidebar** (on desktop): category tree with nested children. Selecting a category filters products by that category UUID. "All Products" clears the filter.
- **Keyword search bar**: a controlled input + submit (or debounced). Clears category filter.
- **Sort selector**: at minimum Latest, Popular, Price Low→High, Price High→Low.
- **Product grid**: responsive, at least 2 cols on mobile, 4 on desktop. Reuse your theme's product card component.
- **Pagination**: "Load more" button — call `loadMore()` and append. Show spinner while loading.
- **Mobile**: sidebar collapses to a drawer or horizontal scroll pill list at the top.
- **Empty state**: a well-designed empty message when no products match.
- **Loading skeleton**: show product card skeletons while the initial fetch runs.
- **CTAs to /shop**: Hero CTAs, "View All" buttons, and navigation links should use `/shop` — NOT `/collections`. `/collections` is for the collections index page only.

### `/shop` vs `/collections` — rule of thumb

| URL | Purpose |
|---|---|
| `/shop` | Browse ALL products; filter by category; keyword search; sort |
| `/collections` | Overview of curated collection tiles |
| `/collections/:slug` | Products in a specific collection |

---

## Homepage Requirement (MANDATORY)

**Every theme's `demo.json` homepage MUST use ALL available component types extensively.** This is not optional — it is a hard requirement for theme submission.

The homepage defined in `demo.json` must include sections using each of the following:

| Section type | Required on homepage | Purpose |
|---|---|---|
| `gallery` | YES — hero position (first section) | Hero slideshow / editorial banner |
| `products` | YES — at least 2 instances | Product grid + product carousel (show both layouts) |
| `categories` | YES — at least 1 instance | Collection browser |
| `content` (default) | YES — at least 1 instance | Rich text / markdown section |
| `content` (promo) | YES | Promo banner with CTA |
| `content` (brand-story) | YES | Brand story with image |
| `content` (testimonials) | RECOMMENDED | Customer quotes |
| `content` (marquee) | RECOMMENDED | Scrolling announcement |
| `button` | YES — at least 1 instance | CTA link (framework-owned, auto-styled) |
| `divider` | YES — at least 1 instance | Visual separator (framework-owned) |
| `table` | RECOMMENDED | Specs or pricing table (framework-owned) |
| `video` | RECOMMENDED | Video embed (framework-owned) |

**Why this matters:** The homepage is what vendors see when previewing a theme. It's also what our automated capture pipeline uses to generate Section Library thumbnails. If a component type is missing from the homepage, vendors won't see what it looks like in your theme before using it.

**Minimum section count:** 8+ sections on the homepage. A sparse homepage does not sell the theme.

### demo.json homepage content structure

```json
{
  "pages": {
    "home": {
      "slug": "home",
      "title": "Home",
      "is_home": true,
      "editor_mode": "sections",
      "content": [
        { "type": "gallery", "variant": "your-default-hero-variant", "data": { "images": [...] } },
        { "type": "content", "variant": "marquee", "data": { "items": ["Free delivery", "New arrivals"] } },
        { "type": "categories", "variant": "your-default", "data": { "title": "Shop by Collection", "limit": 6 } },
        { "type": "products", "variant": "grid", "data": { "title": "Best Sellers", "sort": "popular", "limit": 8 } },
        { "type": "content", "variant": "promo", "data": { "title": "Summer Sale", "subtitle": "Up to 50% off", "cta_label": "Shop Now", "cta_link": "/shop" } },
        { "type": "products", "variant": "carousel", "data": { "title": "New Arrivals", "sort": "latest", "limit": 6 } },
        { "type": "content", "variant": "brand-story", "data": { "heading": "Our Story", "body": "...", "image": "...", "align": "left" } },
        { "type": "divider", "data": { "style": "line" } },
        { "type": "content", "variant": "testimonials", "data": { "heading": "What customers say", "items": [...] } },
        { "type": "button", "data": { "text": "View All Products", "url": "/shop" } }
      ]
    }
  }
}
```

Every variant you declare in `manifest.ts` should appear at least once on the homepage. If your theme declares `gallery: [slider, mosaic]`, the homepage should have BOTH a slider gallery AND a mosaic gallery section.

**This is enforced.** `tests/theme-metadata.test.ts` fails if any `gallery`/`products`/`categories`/`content` variant that is auto-pickable (i.e. not `auto_pick: false` — see Selection Metadata below) is missing from `demo.json` (home composition and/or any page). `header`/`footer` are exempt (only one renders per page); `auto_pick: false` variants are exempt (legitimately never auto-shown).

### Demo Art Hosting (MANDATORY)

**Every image in `demo.json` MUST be served from `media.usequeek.com`. No external
image host. No local file.**

Your demo art is not preview-only. `/api/theme-registry` publishes it to the backend as
`variant_images`, keyed `{type}/{variant}`, and the store builder fills real vendor
stores with it — a `gallery/mosaic` that declares five images hands the builder five,
in the order you wrote them. A vendor's new store opens looking like *your* theme
instead of one shared placeholder set. That means a foreign URL is someone else's CDN
serving Queek customers, and a local path is a file that exists only in your checkout.

Pick whatever art you like while designing, then before you commit:

```bash
yarn theme:rehost-images --theme <your-theme>
```

It walks `demo.json`, uploads every image to
`theme-assets/{theme}/{content-hash}.jpg`, and rewrites the file in place. Commit the
rewritten `demo.json`. The command is idempotent — a second run uploads nothing and
changes no lines — so re-run it any time you add art. `--dry-run` reports without
uploading.

Notes:

- It walks **values**, not field names, so art in a bare array (`products[].media.gallery`)
  is picked up along with `image`, `thumbnail`, `banner`, `avatar`, and friends. Social
  and video links are classified and left alone.
- A dead source URL **fails the run** and is listed by name. Replace or remove it
  yourself — the command will not invent art.
- **This is enforced twice.** `tests/theme-metadata.test.ts` fails in CI, and
  `/api/theme-registry` refuses to serve the registry at all if any live theme still
  references art Queek does not host.

Use as many images per section as the variant is designed to show. The count you write
is the count the builder gets.

---

## Framework-Owned Blocks

The following block types are owned by the framework. Their React components live in `@usequeek/theme-kit/shared-blocks` and render identical DOM across every theme:

- **divider** — visual separator
- **embed** — Instagram/Spotify/YouTube/custom iframe URLs
- **video** — YouTube/Vimeo/direct video file
- **table** — pricing, specs, comparison tables
- **button** — standalone call-to-action link
- **image** — single image with optional caption
- **content/default** — plain markdown rendering

Themes **style** these blocks via `.theme-<slug> .core-block-*` scoped selectors in `theme.css`:

```css
.theme-my-theme .core-block-button {
  background: var(--my-brand-color);
  font-family: var(--my-font-display);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.theme-my-theme .core-block-table__th {
  font-family: var(--my-font-display);
  border-bottom: 1px solid var(--my-accent);
}

.theme-my-theme .core-block-divider__line {
  border-color: var(--my-accent);
  opacity: 0.3;
}
```

Theme authors **cannot** override the React logic. This guarantees consistency.

Class-name vocabulary:
```
.core-block                         /* shared container */
.core-block-divider                 .core-block-divider__line
.core-block-embed                   .core-block-embed__wrap   .core-block-embed__frame
.core-block-video                   .core-block-video__wrap   .core-block-video__frame
.core-block-video__placeholder      .core-block-embed__placeholder
.core-block-table                   .core-block-table__wrap   .core-block-table__table
.core-block-table__head   .core-block-table__th   .core-block-table__body
.core-block-table__row    .core-block-table__cell
.core-block-button                  .core-block-button-wrap
.core-block-image                   .core-block-image__figure  .core-block-image__img
.core-block-image__caption
.core-block-content                 .core-block-content__body
```

## Custom data: metafields & metaobjects

Vendors define custom fields (metafields) and custom content types
(metaobjects — e.g. "Designer", "Care guide") in the merchant dashboard.
Core resolves them server-side; themes only place and style.

**MUST — place `<ProductMetafields />` on every product page.**
`pages/product.tsx` receives `ProductPageProps { product; metafieldDefinitions? }`:
values arrive on `product.metafields`, labels via `metafieldDefinitions`.
Never fetch them — they are already there.

```tsx
import { ProductMetafields } from '@usequeek/theme-kit/components/product-metafields';

export function Product({ product, metafieldDefinitions }: ProductPageProps) {
  return <ProductMetafields product={product} definitions={metafieldDefinitions} />;
}
```

Renders nothing when there is nothing to show. `EntryCard` and
`renderValue` are exported for themes that compose their own layout.
Style via `.theme-<slug> .core-metafields*` selectors in `theme.css`.

**MAY — style the `metaobjects` block.** It is framework-owned like the
list above: the page renderer renders it when the storefront seeds entries,
each card linking to `/{type}/{handle}` when that type has entry pages.
Style only what it emits:

```
.core-block-metaobjects            .core-block-metaobjects--grid   --list
.core-block-metaobjects__title     .core-block-metaobjects__list   __list--grid   __list--list
.core-block-metaobjects__card-link
```

**MAY — provide `pages.Metaobject`.** An entry's own page renders core's
`DefaultMetaobjectPage` unless the theme exports
`Metaobject?: FC<MetaobjectPageProps>` (`{ entry; definition: { type; name;
fields: [{ key; name; type }] } }`).

**Never** re-implement metafield rendering, fetch `product.metafields`, or
override the `metaobjects` block's React logic. `$source` refs in block data
are resolved server-side — block data always reaches a theme as literals.

---

## Smart Placeholders

When a vendor's image field is empty, `<Image>` generates a theme-aware SVG placeholder (brand gradient + typographic label at the correct aspect ratio). To opt in, pass a `placeholder` prop:

```tsx
<Image
  src={img.url}
  alt={img.alt ?? ''}
  className="my-hero__img"
  placeholder={{
    label: img.title ?? vendor.name ?? 'Welcome',
    sublabel: img.subtitle,
    width: 1920,       // from manifest.images.gallery_slide
    height: 800,
    variant: 'banner', // 'photo' | 'banner' | 'card' | 'square'
  }}
/>
```

**Rules:**
- Use dimensions from your `manifest.images` — don't invent sizes
- NEVER gate `<Image>` behind `{image ? ... : null}` — always render it with `src={image || undefined}` so the placeholder fires
- `label` should be contextual: product title on cards, collection name on category cards, vendor name on hero slides
- Don't call `resolvePlaceholder()` directly — it's `<Image>`'s internal

---

## Variant Thumbnails (MANAGED BY QUEEK — NOT BY THEME AUTHORS)

The merchant editor shows a **Section Library drawer** where vendors browse thumbnails of every variant you declare. **You do NOT generate these thumbnails.** Queek's centralized build pipeline handles variant capture automatically.

### How it works (for your understanding — you don't run this)

1. Our pipeline reads your `manifest.ts` for declared variants
2. Each variant is rendered in isolation at `/preview/<theme>/variant?type=<type>&variant=<id>` using your theme's demo data + Smart Placeholders
3. Playwright screenshots each render and writes `.jpg` tiles to `public/variant-thumbs/<theme>/`
4. An `index.json` manifest maps every variant to its thumbnail URL
5. The merchant drawer reads this manifest and displays the thumbnails

### What this means for you

- **Do NOT run `yarn capture-variants`** — that's an internal tool for the Queek team
- **Do NOT commit files to `public/variant-thumbs/`** — the pipeline generates these
- **DO declare every variant in `manifest.ts`** with `id`, `label`, `purpose`, and optional `default`
- **DO include every variant on your homepage in `demo.json`** — the pipeline uses your demo data for realistic renders
- **DO use `<Image>` with `placeholder` props** — thumbnails look better when Smart Placeholders fire (branded gradients vs empty boxes)

### Local development preview

While building, you can preview any variant in isolation locally:

```
http://127.0.0.1:3001/preview/my-theme/variant?type=products&variant=carousel
```

This renders your block with stub data and your theme's CSS so you can iterate without running the full capture pipeline.

---

## Temporary Files Policy

All Playwright screenshots, capture artifacts, and AI QA outputs MUST be written to `.ai/<theme_name>/tmp/` — never to the project root, `public/`, or any committed directory.

```
.ai/
  lumiere/
    tmp/           ← screenshots, captures, QA reports land here
  nova/
    tmp/
  my-new-theme/
    tmp/
```

**Rules:**
- The pipeline writes all intermediate files to `.ai/<theme>/tmp/`
- After each capture or QA run completes, the `tmp/` directory is **cleaned automatically**
- Only final outputs (committed thumbnails in `public/variant-thumbs/`) persist — everything else is ephemeral
- `.ai/*/tmp/` is in `.gitignore` — never committed
- Theme authors should NOT manually create or modify files in `.ai/`

This applies to:
- `yarn capture-variants` — intermediate screenshots before final `.jpg` output
- `yarn theme:check` (upcoming) — QA screenshots + AI review artifacts
- Any Playwright-based tooling that renders theme pages

**Shared Chromium binary:** All Playwright-based tools use a single Chromium
installation at `.ai/browsers/` (set via `PLAYWRIGHT_BROWSERS_PATH`). This
prevents each tool or AI agent from downloading its own ~170 MB copy. The
capture script auto-installs Chromium on first run if missing. The directory
is gitignored but persists on the machine across runs.

---

## Visual QA During Development (RECOMMENDED)

Use the local preview system to visually verify your theme as you build. Here's a workflow:

### 1. Preview your homepage

```
http://127.0.0.1:3001/preview/my-theme
```

Verify: all required sections present, layout balanced, typography readable, spacing consistent, brand colors applied.

### 2. Preview individual variants

```
http://127.0.0.1:3001/preview/my-theme/variant?type=gallery&variant=cinematic
http://127.0.0.1:3001/preview/my-theme/variant?type=products&variant=carousel
http://127.0.0.1:3001/preview/my-theme/variant?type=categories&variant=showcase
```

Verify: each variant renders standalone without layout breaks.

### 3. Check responsive breakpoints

Use browser DevTools device toolbar to verify at:
- Desktop (1440px)
- Tablet (768px)
- Mobile (390px)

### 4. AI-Powered Visual QA (coming soon)

A `yarn theme:check my-theme` command will be available that:
1. Captures your homepage + all variants via Playwright
2. Sends screenshots to an AI vision model for automated review
3. Reports: missing sections, alignment issues, broken layouts, accessibility problems

This is being built — theme authors will get a one-command QA gate before PR submission.

---

## Manifest

`manifest.ts` declares your theme's metadata, variants, and image dimensions:

```typescript
import type { ThemeManifest } from '@usequeek/theme-kit/types/theme';

const manifest: ThemeManifest = {
  name: 'My Theme',
  slug: 'my-theme',
  description: 'One-line theme description for the theme picker',
  version: '1.0.0',
  variants: {
    content: [
      { id: 'default', label: 'Rich Text', default: true, purpose: 'Rich text with headings, lists, and formatting' },
      { id: 'marquee', label: 'Scrolling Marquee', purpose: 'Scrolling text announcements across the page' },
      { id: 'promo', label: 'Promo Banner', purpose: 'CTA banner with title, subtitle, image and button' },
      { id: 'testimonials', label: 'Testimonials', purpose: 'Customer quotes — needs 2+ testimonials' },
      { id: 'brand-story', label: 'Brand Story', purpose: 'Heading + body + image side-by-side, for your story' },
    ],
    header: [
      { id: 'classic', label: 'Classic', default: true, purpose: 'Standard left logo with horizontal nav' },
      // ... more header variants
    ],
    footer: [
      { id: 'columns', label: 'Multi-Column', default: true, purpose: 'Full footer with link columns' },
      // ... more footer variants
    ],
    products: [
      { id: 'grid', label: 'Grid', default: true, purpose: 'Standard product grid layout' },
      { id: 'carousel', label: 'Carousel', purpose: 'Horizontal scrollable row' },
    ],
    gallery: [
      { id: 'slider', label: 'Slider', default: true, purpose: 'Full-bleed hero slideshow' },
    ],
    categories: [
      { id: 'grid', label: 'Grid', default: true, purpose: 'Category tile grid' },
    ],
  },
  features: ['page_banner', 'collection_banner', 'announcement_bar', 'footer_colors', 'button_colors'],
  images: {
    gallery_slide: { width: 1920, height: 800, label: 'Hero slide' },
    page_banner: { width: 1920, height: 640, label: 'Page banner' },
    collection_cover: { width: 1600, height: 700, label: 'Collection cover' },
    product_card: { width: 800, height: 1000, label: 'Product image' },
    category_card: { width: 800, height: 1000, label: 'Category image' },
  },
};

export default manifest;
```

**Every variant you declare MUST have:**
- `id` — unique slug for this variant
- `label` — human-readable name shown in the merchant Section Library
- `purpose` — one sentence (under 80 chars) explaining WHEN to use this variant. This is searchable in the Section Library drawer.
- `default` — (optional) mark one variant per scope as the default

**Bump `version`** when you make visual changes to existing variants. This signals the pipeline to re-capture thumbnails.

---

## Selection Metadata (best_for / auto_pick / min_images)

These three optional per-variant fields drive **qee** / `BuildHomepageTool` (queek_backend) — the AI store builder that auto-picks a variant for each scope when it composes a vendor's homepage. Setting them well is how your theme gets picked *well* instead of by generic defaults. They are id-agnostic: the builder never special-cases a variant by name, only by these fields.

```typescript
{ id: 'featured', label: 'Featured Grid', purpose: '…', best_for: ['food', 'supermarket', 'pharmacy'] },
{ id: 'testimonials', label: 'Testimonials', purpose: '…', auto_pick: false },
{ id: 'mosaic', label: 'Mosaic Grid', purpose: '…', min_images: 3 },
```

- **`best_for?: string[]`** — the business buckets this variant is a strong fit for. Boosts this variant's score when the builder composes a homepage for a vendor in that bucket. Omitted = universal (no bucket boost, still eligible). Values MUST be one of the `config/category_packs.php` (queek_backend) bucket keys — no other strings are valid:

  `food` · `supermarket` · `product` · `pharmacy` · `laundry` · `delivery` · `service` · `gas-refill` · `local_market`

  (`_`/`-` are treated as equivalent by the backend matcher, but write the hyphenated form above.)

- **`auto_pick?: boolean`** — default `true`. Set `false` on special-purpose variants the AI builder must NEVER auto-select for a vendor: review/testimonial screenshot walls, decorative-only galleries, or focused/checkout chrome (e.g. a `minimal` header). Manual selection (vendor or qee editing directly) is still allowed — this only blocks the *automatic* first-build pick.

- **`min_images?: number`** — **gallery scope only.** The minimum hero slides this variant needs to look right (e.g. a mosaic collage needs 3). The builder gates on the vendor's actual resolved hero slide count (banner → 1 slide; else up to 5 real product photos; else 1 placeholder) and only offers the variant when there's enough material. Omitted = `1`.

**You SHOULD set `best_for`/`auto_pick` on every gallery/header/footer/products/categories variant** so qee selects well for every vendor bucket, not just the manifest default. **You SHOULD set `min_images` on every multi-slide gallery variant** (mosaics, filmstrips, collages). **You SHOULD set `auto_pick: false`** on any variant that is special-purpose rather than a general-audience default (review walls, decorative-only galleries, focused/checkout headers).

A compliance test (`tests/theme-metadata.test.ts`) enforces the shape of these fields for every variant in every theme — `best_for` values must be valid bucket keys, `auto_pick` must be a boolean, `min_images` must be a positive integer and gallery-only. It will NOT tell you if a value is a poor creative fit — that's a design judgment call.

---

## demo.json

Must mirror the vendor bootstrap shape. Required minimums:

| Field | Minimum | Notes |
|-------|---------|-------|
| `profile.slug` | — | Must match the theme slug |
| `config.theme` | — | Must match the theme slug |
| `products` | 6 | Include galleries, reviews, pricing. Spread `flags.featured` and `flags.is_new` |
| `categories` | 3 | Each with an image |
| `posts` | 1 | With cover image |
| `pages.home` | — | MUST include ALL component types (see Homepage Requirement above) |
| `menus` | 1 | Header menu with Collections, About, Blog, Contact |

### Alternative demo stores

A theme can ship more than one store. `demo.json` is the primary — the one the
thumbnail, the section-library capture and the registry's top-level compositions
come from. Each extra store is a file under `demos/` in the same shape, declared
in `theme.config.ts`:

```
themes/roast/
  demo.json              # the primary — a coffee roastery
  demos/
    foods.json           # the same theme as a restaurant & takeaway
    foods.jpg            # optional 1280×800 thumbnail for this store
```

```ts
// theme.config.ts
demos: [
  { id: 'foods', label: 'Restaurant & takeaway', for: ['foods', 'local-meals', 'suya'] },
],
```

- **`id`** — lowercase slug; it becomes the URL and the filename. `default` is
  reserved for `demo.json`.
- **`label`** — what a merchant sees in the picker.
- **`for`** — the business slugs this store is the right preview for, in the same
  vocabulary as `categories` (the vendor's `service_slug` / `service_type`). The
  backend offers a matching vendor this store instead of the primary.

Every store previews at `preview.<domain>/<slug>~<id>` — `/roast~foods`,
`/roast~foods/shop`, and so on — and every link inside it stays on that store.
The registry publishes each as `demos[]` with its own `preview_url`,
`home_composition`, `page_compositions` and `variant_images`.

What the checker asks of a store, primary or not: the minimums above, Queek-hosted
art (`--fix` rehosts every file), block types core renders, `profile.slug` and
`config.theme` naming this theme, `products[].shop_id` equal to `profile.id`, and a
`profile.id` no other store in the theme uses — the cart is keyed by it, so two
stores on one id would share a cart in the preview. Only the primary is required to
demonstrate every auto-pickable variant; an alternative that skips one gets a
warning, because a store built from it falls back to the primary's art for that
variant.

## Templates

Every demo store is a **template**: a merchant (or Qee, the AI, on their behalf)
picks ONE, and the backend builds the vendor's store from that template's layout —
its sections and variants, its header and footer, its dials and each section's
`style` — then fills every content slot with the vendor's own material. The
preview at `/<slug>~<id>` is what the vendor gets, content aside. A theme ships
one template per business it serves, and up to three versions of each (`food`,
`food-2`, `food-3`). The backend publishes exactly what this section describes; it is agreed
with the backend team and changes only together with it.

What each template must carry (theme-check rejects a gap):

- **`description`** (`theme/template-description`) — ≤ 300 characters, written
  for a model choosing on a merchant's behalf: who it fits · the look · the
  signature sections · what material it needs to look right. The primary's goes
  in `theme.config.ts` → `default_demo: { description }`; each other template's
  on its `demos[]` entry.

  > "Premium food. Dark, photo-led: full-bleed dish hero, tabbed menu, chef story,
  > reviews strip. Best for restaurants with 6+ strong dish photos."

- **A screenshot** (`theme/template-screenshot`) — `theme.jpg` (or `.png`) for the
  primary, `demos/<id>.jpg` for the rest, 1280×800, the template's first screen,
  captured by `yarn theme:capture <slug>` (see [theme.png](#themepng)).
  The AI looks at it before committing. `yarn theme:rehost-images --theme <slug>`
  (also run by `yarn theme:check <slug> --fix`) uploads it to
  `media.usequeek.com/theme-assets/<slug>/<sha256[..16]>.jpg` and records it in
  the theme's `screenshots.json`; the registry publishes that absolute URL as
  `preview_image`, and the `public/` copy as `screenshot` for this storefront's own
  pages. Re-capture a screenshot and it must be uploaded again — the URL is its
  content hash.
- **`for`** (`theme/template-business`) — the business the template is for, in the
  platform's vocabulary only (`lib/storefront/business-vocabulary.json`): service
  slugs a vendor registers as (`foods`, `beauty-cosmetics`…) and the marketplace
  catalogue's roots and branches (`beauty-personal-care` → `makeup`,
  `wigs-extensions-hair-accessories`…), most specific first. The catalogue keys are
  what tell a wig seller from a makeup seller; the backend reads a vendor's business
  from what they sell and ranks a specific match above a broad one. The primary's
  goes in `default_demo: { for }` and names **its own** business — it used to inherit
  the theme's `categories`, so a food vendor was offered medley's beauty store.
- **A `label`** naming the business the template is dressed as — `Restaurant &
  kitchen`, not `Food`. The primary's goes in `default_demo: { label }` (it falls
  back to the theme's name, which tells a merchant nothing next to the others);
  each other template's on its `demos[]` entry.
- **Chrome the theme implements** (`theme/template-chrome`) — `config.header.variant`
  and `config.footer.variant` name variants the theme declares. The registry
  publishes them as `header_variant` / `footer_variant`.
- **Style keys the variant declares** (`theme/template-style`) — a section's
  presentational fields (enum, boolean and colour fields: a tone, an alignment,
  a tilt, an overlay) are published per slot as `style`. Setting one the
  section's own variant does not declare is rejected: it would be copied onto
  every store built from the template and do nothing.

What the registry publishes per template (`demos[]` in `/api/theme-registry`):
`id, label, for, description, preview_url, preview_image, screenshot,
header_variant, footer_variant, tokens`, plus `home_composition` /
`page_compositions` whose slots are `{type, variant, style?, copy?}`, and
`variant_images`. `copy` is the section's words — its declared text fields and the
text keys of its list entries (steps, slides, FAQ), never links, images, alt text,
ids, prices or the demo store's own facts (email, phone, address, hours, coupon
code); the backend builds a section with no vendor facts behind it from them and
qee rewrites them. The setup wizard publishes a template's homepage onto a new
store **unchanged**, so write demo copy as a template would say it ("Wash, deep
condition and braid"), not as one shop would ("filled by hand in our Lekki
studio"): **no store name** (say "our kitchen", "the studio"), **no place**
("across the city", or drop it), **no naira amount and no promise only the vendor
can make** (delivery windows, return periods, free delivery, guarantees), and **no
founding date** ("since 2014").
Testimonials and reviews are exempt: their copy never reaches a real store.
`theme/template-copy` rejects the rest (contract R2.6).
`tokens` is the store's `config.tokens` — always the dials (sizes, weights,
spacing, radius, motion); the colours and faces only when the theme's CSS reads
the kit's colour/face vars (`--brand-*`, `--font-heading`/`--font-body`). A theme
that hard-codes its palette (roast, glow, carat) varies templates by layout,
chrome, dials and section `style`.

Rules for template authors:

- **A template is a business; the theme is the look.** One
  template per business the theme serves (`food`, `hair`, `clothes`…), each with
  that business's own sections (a priced menu, table booking, a size guide, install
  steps). The vendor's business picks the template through `for`; the merchant or
  qee picks the theme. **Never rename a shipped id**: vendors store the id they
  picked (`foods` stays `foods`).
- **Versions** (`theme/template-versions`): up to three designs for one business —
  `food`, `food-2`, `food-3` — with exactly the same `for`; the backend spreads
  matching vendors across them. Each has its own `label` saying what differs, its own
  description and screenshot, and is a different design, not a recolour: its own
  home order and section variants, plus its own header, footer and palette where the
  theme allows. No two templates in a theme may list the same home sections in the
  same order.
- **Designed pages** (`theme/template-pages`): every template ships `about`, `sales`
  and `landing` pages (versions `about-2`…`-5`, `sales-2`/`-3`, `landing-2`/`-3`
  optional), each previewable at `/<slug>~<id>/<page>`. Qee clones the page for a
  vendor and fills it. On `sales` and `landing` every products section receives the
  products the merchant names — a single-product section (`featured`/`spotlight`) one
  each, in order, a list all of them — and the first hero is dressed with their
  photos. So design them for 1–3 products: a products section in the first three,
  closing on a contact card (both warned). `about` versions differ in story shape
  (founder story, team or kitchen, values and process, timeline, press); every
  section must be fillable from a vendor's real facts or photos, or it is dropped.
  The single-page default theme is exempt: every URL draws its one page.
- **Design for a thin vendor.** Slots the vendor has no data for are dropped
  (products, collections, reviews, blog); image slots fall back to the template's
  own art. Check the template still looks complete with 8 products, 3
  collections, 0 reviews and 2 photos.
- **Contact and FAQ** go where the design wants them; a template without them gets
  them appended at the end.

**The preview links them.** On every store of a theme with more than one template,
the preview adds a **Templates** dropdown to the end of the header menu, one link per
template (`app/preview/_lib/templates-menu.ts`). It is added at render time, never
written into the demo JSON — the backend copies that into real stores. It is a
`group` item with `url` children, so every header variant a template uses must draw
a menu item's children (a dropdown on desktop, indented under it in the mobile
menu). `tests/theme-templates-menu.test.tsx` renders each template's own header
and fails if any template link is missing. The extra item makes the menu longer: a
header that sets the menu beside a centred logo must give it its own row when it does
not fit on one line (medley split, roast centered and carat inline measure it with
`useCrowdedNav`), never wrap it under itself or run it into the logo.

## theme.png

1280x800 screenshot of the homepage (`theme.jpg` or `theme.png`) — the primary
template's screenshot; see [Templates](#templates). With `yarn dev` running,
`yarn theme:capture <slug> [template ids…]` captures every template's first screen
from `preview.localhost:3001` into `theme.jpg` / `demos/<id>.jpg`, with the
`qk-capture` cookie set — it leaves the preview's Templates dropdown out, so the
screenshot shows the store as a merchant gets it. Then
`yarn theme:rehost-images --theme <slug>` uploads them.

## Registration

1. Create `themes/<slug>/` with all required files (`yarn theme:new` scaffolds them and does step 2)
2. Register it in `themes/loaders.ts` — one line in **each** map: `themeLoaders` (the module) and `themeStyles` (its CSS in the server-rendered HTML; without it the store paints unstyled until JS runs)
3. Run `yarn theme:generate-registry`
4. Sync to Laravel: `php artisan storefront:sync-themes`
5. Verify: `preview.localhost:3001/<slug>` renders correctly

## Validation

```bash
yarn theme:check <slug>            # what would block this theme from publishing
yarn theme:check <slug> --json     # same findings, machine-readable
yarn theme:check <slug> --fix      # apply the fixes that need no decision
yarn theme:check <slug> --static   # skip the render rules (fast)
yarn theme:check                   # every theme
```

Each finding names the rule, where it is, what is wrong, and what to do:

```
✗ theme/price-range-signal  themes/aurora/blocks/products.tsx → products.grid
    renders a price without honouring pricing.is_price_from
    → Prefix the price with {product.pricing.is_price_from ? 'From ' : ''} …
    themes/THEME.md#component-rules
```

**These are the same rules CI runs** (`tests/theme-check.test.ts` asserts over the
identical library in `scripts/theme-check/`). There is no second definition of
"valid" to pass locally and fail on submission.

**A theme publishes only when every blocking finding is clear** — no partial
publish. A variant that does not render is not quietly dropped, because the
backend composes real stores from your manifest and demo, and a hole there
becomes a hole in a vendor's storefront.

`--json` exists for agents: stable `rule` ids, `where`, `found`, `fix`, and a
`fixable` flag, with a non-zero exit while anything blocks. Point your tooling at
it and iterate until `ok: true`.

Run `yarn test` too — it covers the framework beyond your theme.

Maintainers: `yarn theme:verify-scaffold` proves `themes/_bare` still scaffolds
into a publishable theme. It is a command rather than a test because it creates
and deletes a directory inside `themes/`, which races the suite.

Theme compliance checks include:
- All required files present (`gallery.tsx`, `products.tsx`, `categories.tsx`, `content-variants.tsx`)
- `manifest.ts` declares valid variants with `id`, `label`, `purpose`
- `demo.json` homepage includes all required component types
- `ThemeModule` exports match the contract (getBlock, getHeader, getFooter, pages, blocks)
- No imports from `@queekai/client-sdk` or other themes
