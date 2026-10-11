> **This is the contract every Queek theme is checked against when it is submitted.**
> You work with `npm run dev`, `npm run check` (the same rules, as `queek theme check`),
> `npm run screenshot` and `npm run package`, and your theme is the `theme/` folder.

# Theme Specification

Every theme lives in `theme/` and must satisfy the requirements below.

## Building from outside this repo

The guides are at https://docs.usequeek.com/docs/themes. This document is the contract they
link to.

The framework is published, so you need nothing but npm:

```bash
npm install @usequeek/theme-kit
```

Start with **`npm create @usequeek/theme my-theme`** — it copies the public
[theme starter](https://github.com/usequeek/theme-starter) (theme files only) and installs the
tools, `@usequeek/cli` ([github.com/usequeek/theme-tools](https://github.com/usequeek/theme-tools)):

```bash
npm create @usequeek/theme@latest my-theme -- --templates laundry --tags minimal
cd my-theme
npm run dev       # queek theme dev: every page of every demo store, server-rendered
npm run check     # queek theme check: this document's rules, on your machine
npm run screenshot # queek theme screenshot: every design's first screen, 1280×800
npm run package   # queek theme package: a zip for submission
```

It walks you through name, templates, primary, categories, tags, pages and AI
assistants — every answer is also a flag, so the whole thing can be scripted
(`npm` needs `--` before them; a terminal just asks):

```
--name <text>          theme name (default: the folder name)
--templates <keys>     businesses to make templates for, comma-separated (required with --yes)
--primary <key>        the primary template (default: the first)
--categories <keys>    business categories (default: the templates')
--tags <tags>          1–6 tags for the look (required with --yes)
--pages <list|none>    extra pages: contact, faq (default: both)
--ai <list>, --no-ai   AI assistants: claude, gemini (default: both; AGENTS.md unless --no-ai)
--pm <npm|pnpm|yarn|bun>, --no-install, --no-git
--yes, -y              never prompt; take the default for everything else
--dry-run              print what would be written; write nothing
--force                allow a folder that is not empty
--template <source>    another starter: a giget source or a local folder
```

`--help` prints the current list from the installed `@usequeek/create-theme`;
trust that over this copy if the two ever drift.

Everything below applies as it is: the starter ships the bare skeleton (as `theme/`),
this document (as `docs/THEME.md`) and the business vocabulary
(`docs/business-vocabulary.json`). Send the finished theme as a git URL or the zip from
`npm run package` (see [Submit your theme](https://docs.usequeek.com/docs/themes/submit)).

The rules that get a theme rejected are not style preferences. Never fetch,
never touch the SDK, never mutate a store, never hardcode data a real store
supplies. A section with hardcoded products looks perfect against demo data and
is empty on a live storefront.

## Build a theme in seven steps

```bash
# 1. Scaffold from the bare skeleton — never from a finished theme
npm create @usequeek/theme my-theme

# 2. Preview it
npm run dev                               # → http://localhost:7833

# 3–5. Build. Then, whenever you want to know where you stand:
npm run check                             # what would block publication, and why
npx queek theme check --json              # same, for an agent to iterate against
```

**3. Write the components.** `layout`, `header`, `footer`, `blocks/`, `pages/`,
`shells/`. They are ordinary React. Data arrives as props, or through a core
hook (`useProducts`, `useCategories`, `useCart`, `useVariantSelection`). You
never fetch, never touch the SDK, never mutate a store — core owns behaviour so
that every theme gets the same fixes.

**4. Declare your variants in `manifest.ts`.** Each one needs a renderer in
`index.ts` (the `variantImplementations` map) and declares exactly the fields
its component reads. The check holds the two to each other, so a variant with
no renderer, or a field nothing reads, is an error (`theme/variant-parity`,
`theme/field-parity`).

**5. Style from design tokens.** `var(--fs-*)`, `var(--space-*)`,
`var(--radius-*)`, `var(--image-*)`. A hardcoded size is a dial that does
nothing in the merchant's editor, and `theme.css` must reference the tokens
more than 50 times (`theme/design-tokens`).

**6. Rewrite `demo.json`.** It is not filler. A vendor previews it before
choosing your theme, and Queek composes real stores from it. Reference art on
any public URL; Queek rehosts it when your theme is published.

**7. Submit.** See [Submitting a theme built outside this repo](#submitting-a-theme-built-outside-this-repo).

When this document and the checker disagree, the checker is the contract.

## Core Principle

**Themes own design. Core owns logic.**

Themes provide layouts, styles, and visual presentation. They NEVER implement auth, cart, checkout, or API logic. Those flows live in `@usequeek/theme-kit` (source in the `usequeek/theme-kit` repo, installed from npm) and are consumed by themes as pre-built components or headless hooks.

---

## What themes CAN do

- Render any layout (sidebar, split-screen, single-page, multi-page)
- Style the `.core-*` CSS classes core's components emit (auth, cart, checkout, metafields, blocks)
- Place `<AuthFlow />` (from `@usequeek/theme-kit/components/auth/auth-flow`) anywhere in the layout, and mount the cart panel through `<CartPanelController>` (`@usequeek/theme-kit/components/cart/cart-panel-controller`), as the starter's `modal-layer.tsx` does
- Provide `AuthRenderer` to wrap the auth flow in a custom modal/sidebar/inline design
- Provide shell components (`CartShell`, `CheckoutShell`, `LoginShell`, `SignupShell`, `AccountShell`) that receive pre-rendered ReactNode slots and arrange them visually
- Read vendor/config data via `useStorefront()`, `useProducts()`, `useCategories()`
- Trigger modals via store openers: `useAuthModalStore().open()`, `useCartPanelStore().open()`
- Use `<Image />` from `@usequeek/theme-kit/components/image` for all images — provides broken-image fallback + Smart Placeholder support (see below)
  - Give product/collection card images `intent="card"`: they are **lazy by default** (a server-rendered grid would otherwise preload and fetch every card image at once, racing the page's CSS). A card that is the page's main image passes `fetchPriority="high"`.
- Read product photos ONLY from the ONE ordered list: `getHoverImage()` for the card hover swap (the second photo, `null` unless two exist), `getSlideshowImages()` for slideshows/photo counts/tiles, `buildMediaFrames()` for full-page galleries — all from `@usequeek/theme-kit/utils/product-media`. The helpers read the normalized `media.images` list (primary first, as the Queek API returns it on list and detail payloads), so the same card lights up on listing payloads (capped list) and detail payloads (full list) with no per-theme branching.
- Style framework-owned blocks via `.theme-<slug> .core-block-*` scoped selectors (see [Framework-Owned Blocks](#framework-owned-blocks))

## What themes MUST NOT do

- Import `@queekai/client-sdk` or `@usequeek/theme-kit/sdk/*`
- Call API endpoints directly (no `fetch`, no `axios`, no `client.get/post`)
- Mutate core stores (`setUser`, `clearShopCart`, `setDeliveryMode`, etc.)
- Re-implement auth flow (phone/OTP/signup logic)
- Re-implement checkout flow (fees, submit, payment method selection)
- Import from other themes, from app code (`@/…`), or from a relative path that leaves `theme/` (`theme/core-boundary`)
- Use raw `<img>` tags — use `<Image />` from `@usequeek/theme-kit/components/image` instead
- Re-implement framework-owned blocks — these live in `@usequeek/theme-kit/shared-blocks`; themes style them via CSS only (see Framework-Owned Blocks below)
- Generate variant thumbnails — Queek's build pipeline handles this centrally (see Variant Thumbnails below)
- Reference a local file from `demo.json` — use a public image URL; Queek rehosts it when your theme is published (see Demo Art Hosting below)
- Load fonts from a remote stylesheet or through `next/font/*`: ship the files in `theme/fonts/` (see [Fonts](#fonts))
- Import Next.js (`next`, `next/link`, `next/navigation`, `next/image`, `next/font/*` …). Link and navigate with `import { Link, useRouter, usePathname } from '@usequeek/theme-kit/navigation';`, and use the kit's `<Image />` for images. Queek decides which framework runs the storefront, so only the kit may know it. `theme/core-boundary` rejects any `next` import
- Read browser-only state during render (`window`, `document`, `localStorage`, `Date.now()`, `Math.random()`), or format with the runtime's default locale (`toLocaleDateString()` with no locale). Every theme component is **server-rendered**, and the server's HTML must match the browser's first render. Read browser state in `useEffect` or `useSyncExternalStore`, and pass an explicit locale and `timeZone` to date and number formatting.
  - A throw while server rendering your `Layout`, header or any page is a **failed request (500)**, not a quiet fallback to the browser. The page is deliberately not wrapped in a Suspense boundary, so a missing product or page can answer a real 404.
  - Every page of every demo store is server-rendered when your theme is checked, so demo data must use the real API shapes. A variant is `option_values` / `pricing` / `inventory`, not a `{ Colour: 'Red' }` map.
- Pass `renderMarkdown(…)` to `dangerouslySetInnerHTML`. It returns React elements, not an HTML string, so the page shows "[object Object]". Render the elements as children (`<div className="…">{renderMarkdown(text, basePath)}</div>`) or use `<Markdown>` from `@usequeek/theme-kit/components/markdown`. `theme/markdown-html` rejects it
- Link a demo store to a page it does not have: missing pages are real 404s. Every menu item, block link and markdown link in `demo.json` and `demos/*.json` must open a page of that store

---

## Submitting a theme built outside this repo

Send the git URL, or the zip from `npm run package` (it holds the theme folder and never
`node_modules`, `.queek` or `.git`), to the Queek team. Queek runs the same rules as
`npm run check` plus the few only it can run, and publishes only if every blocking
finding is clear. **All or nothing**: a rejected submission leaves nothing behind, so a
half-registered theme can never render holes in a vendor's store. The rules only Queek can
run — divergence from Queek's own themes, the render probe, the art and screenshot
upload — are listed at the end of `npm run check`'s report.

**Assets.** Build against whatever public image host you like. Queek moves your demo
art onto its CDN before it validates, and rewrites `demo.json` to match. You never need
Queek's storage credentials, and Queek satisfies the "no foreign hosts" rule for you. A
dead or unreachable image fails the submission: it is named, and nothing is published.
Queek records each uploaded screenshot in `theme/screenshots.json`; leave that file as it
is.

---

## Starting a new theme

```bash
npm create @usequeek/theme my-theme
```

It scaffolds from **the bare skeleton** — the contract with no design in it:
semantic markup, token-wired CSS, correct data binding, one variant per scope.
It rewrites every identity reference (manifest slug, config, `.theme-<slug>`
root class, CSS prefix, demo profile), one name everywhere. What `npm run check`
prints for a fresh theme is your to-do list — the stand-ins you replace (see
[Placeholder content](#placeholder-content)) — so every later failure is about
your work rather than the skeleton.

**Do not start from a finished theme.** Whatever you start from you inherit, and
inherited design is the thing nobody goes back and rewrites. Start bare and let
the rules tell you what is missing.

It gives you a working theme, not a designed one. What you own from there: the
tokens and CSS, the layout and chrome, the blocks, and **`demo.json`** — it is
still the skeleton's store, and it is both what vendors preview and what Queek
composes real stores from. Replace the art.

---

## Required Files

```
theme/
  index.ts              # ThemeModule default export (index.tsx also works)
  manifest.ts           # Theme metadata, variants, tokens, English strings
  theme.config.ts       # Author, tags, categories, rank, templates and designs
  layout.tsx            # Root wrapper — applies .theme-<slug> class
  header.tsx            # Default header component
  footer.tsx            # Default footer component
  theme.css             # Design tokens + .core-* class styling
  demo.json             # Preview data: the main design (see Homepage Requirement)
  demos/<id>.json       # Optional alternative designs (see Designs)
  theme.jpg             # Main design's screenshot, 1280x800; theme.png also works
  locales/
    en.default.json     # Every string the theme prints (see Locales)
  blocks/
    gallery.tsx         # Identity block: hero slideshow/image
    products.tsx        # Identity block: product grid/carousel
    categories.tsx      # Identity block: collection browser
  pages/
    home.tsx  page.tsx  blog.tsx  post.tsx
    collection.tsx  product.tsx  gallery-page.tsx   # product.tsx MUST place <ProductMetafields /> — see Custom data below
  shells/
    cart-shell.tsx  login-shell.tsx  signup-shell.tsx  account-shell.tsx
```

`theme/structure` rejects a missing file from this list, except the locale file, which the `theme/locale-*` rules enforce. `index.ts` must also supply a
renderer for every theme-owned block type (`content`, `gallery`, `products`,
`categories`, `contact`, `blog`): the `ThemeBlocks` type makes the compiler enforce it.
The starter shows the minimum.

### Optional files

```
  pages/shop.tsx                 # The /shop page (see Shop Page); core renders its own when absent
  pages/collections.tsx          # The collections index; core renders its own when absent
  blocks/contact.tsx             # Contact block: store details and a map
  blocks/content-variants.tsx    # Structured content variants (promo, brand-story, testimonials, marquee…)
  shells/checkout-shell.tsx      # Props: CheckoutShellProps; core supplies a default
  modal-layer.tsx                # Theme-level modals (cart panel, search, product, orders)
  headers/                       # Header variants (if manifest declares them)
  footers/                       # Footer variants
  fonts/                         # Font files and fonts.css (see Fonts)
```

---

## Theme contract

`index.ts` default-exports one `ThemeModule` (`@usequeek/theme-kit/types/theme`). Core loads a
theme with `import(…).then((m) => m.default)`, so a theme without a default export renders nothing.
Annotate it — `const theme: ThemeModule = { … }; export default theme;` — so the compiler checks
every required slot; without the annotation, a missing page surfaces in a live store instead of
at build time (`theme/module-contract`).

| Slot | Required | What it is |
|---|---|---|
| `Layout`, `Header`, `Footer` | yes | The page frame; `Layout` puts the `.theme-<slug>` class on its root. `Header` and `Footer` are the default chrome; variants come through `getHeader` and `getFooter` |
| `getHeader(variant?)`, `getFooter(variant?)` | yes | Return the component for a manifest variant |
| `blocks`, `getBlock(type, variant?)` | yes | The page-builder blocks and their variants. `blocks` is the older slot; the type still requires it, so fill it as the starter does |
| `pages.Home`, `Page`, `Blog`, `Post`, `Collection`, `Product`, `Gallery` | yes | Every page a store can open; `Product` places core's `<ProductMetafields />` |
| `pages.Shop`, `Collections`, `Policies`, `Metaobject` | no | Core renders its own when absent |
| `shells` (`CartShell`, `CheckoutShell`, `LoginShell`, `SignupShell`, `AccountShell`) | no in the type | Your frame around core's flows. `theme/structure` still requires the four files `cart-shell`, `login-shell`, `signup-shell` and `account-shell`; core supplies the checkout default |
| `productCard`, `ModalLayer`, `AuthRenderer` | no | Optional overrides |
| `manifest` | yes | Variants and metadata (see [Manifest](#manifest)) |

## Component rules

- **The logo is a link home:** `<Link href={`/${vendor.slug}`}>` from `@usequeek/theme-kit/navigation`, never a `<button>`. A button can't be crawled, opened in a new tab or middle-clicked (`theme/code-quality`).
- **Menu links come from `menuItemToHref()`** (`@usequeek/theme-kit/utils/menu-link`). It resolves the vendor's own domain, subdomain or path; a hand-built URL breaks on at least one of them (`theme/code-quality`).
- **A component that uses hooks starts with `'use client'`.** The check enforces it on `header.tsx` and the `gallery`, `products` and `categories` blocks (`theme/code-quality`).
- **A vendor's facts never fall back to your words.** Tagline, address, phone, email and description render nothing when they are empty (`vendor.phone ?? ''`, or leave the element out). A store with no phone number must not show the demo's (`theme/vendor-facts`).

## Attribution

Every footer variant renders core's `<PoweredByQueek />` from
`@usequeek/theme-kit/components/powered-by-queek`, in the theme's own placement and spacing.
Style it through its `core-powered-by` classes; never re-implement its markup
(`theme/footer-shows-powered-by`).

## Shop Page (`pages/shop.tsx`)

`/shop` is the vendor's full product catalogue: browseable, filterable and sortable. It is
**not** `/collections`, which shows collection tiles. Collections appear on `/shop` as
**sidebar filters**. `pages.Shop` is optional in the contract and core renders a default
when it is absent, but a theme that wants its own design for the catalogue provides it, and
every hero CTA, "View all" button and menu link to the catalogue should point at `/shop`.

### Props contract (`ShopPageProps`)

```ts
interface ShopCategory {
  id: string;        // UUID
  slug: string;      // pass this as categorySlug to useShop()
  name: string;
  image?: string | null;
  products_count?: number;
  children?: ShopCategory[];  // nested subcategories
}

interface ShopPageProps {
  categories: ShopCategory[];  // SSR-loaded; may be empty if the vendor has none
}
```

### Products hook (`useShop`)

Import from `@usequeek/theme-kit/hooks/use-shop`, and read the filters from the URL with
`useShopParams` so they survive a refresh and can be shared.

```ts
import { useShop } from '@usequeek/theme-kit/hooks/use-shop';
import { useShopParams } from '@usequeek/theme-kit/hooks/use-shop-params';

const { categorySlug, keyword, sort, page, setCategory, setKeyword, setSort, setPage } = useShopParams();
const { products, isLoading, pagination } = useShop({
  categorySlug,   // string | null — ?category=
  keyword,        // string — ?q=
  sort,           // 'latest' | 'popular' | 'price_low' | 'price_high' — ?sort=
  page,           // ?page=
  perPage: 24,    // the default; keep it (see below)
});
// pagination: { currentPage, perPage, hasMore }
```

`useShop` returns the one page you ask for, not an accumulated list. The products API sends
no totals, so `pagination` has no page count or total: use `hasMore` to enable a "Next"
control, and do not print "page 2 of 9".

`setCategory` and `setKeyword` reset the page to 1, and each clears the other filter.
`setSort` resets the page to 1.

**The first page is server-rendered.** On a live store, `/shop` fetches the page your
`useShop` call will ask for (this URL's filters, read exactly as `useShopParams` reads them,
at `perPage: 24`) and hands it to `useShop`, so the product grid is in the HTML instead of
appearing after the JavaScript has run. Only an exact match is used: a call with other
filters or another page size fetches in the browser. Filtering and paging after load fetch
in the browser too. Preview (demo stores) filters the demo catalogue in memory.

You never call the products API yourself. The hook hands you `products` and `pagination`.

### Design guidance

None of this is machine-checked, and all of it is what a vendor expects of a catalogue page.

- **Category filter:** a tree with nested children, as a left sidebar on desktop. "All products" calls `setCategory(null)`.
- **Keyword search:** a controlled input with submit, or a debounced one. It clears the category filter.
- **Sort selector:** at least Latest, Popular, Price low to high and Price high to low.
- **Product grid:** responsive, with at least 2 columns on mobile and 4 on desktop. Reuse your theme's product card.
- **Pagination:** Previous and Next controls that call `setPage(page - 1)` and `setPage(page + 1)`; `hasMore` enables Next. Show a loading state while `isLoading` is true.
- **Mobile:** the sidebar collapses to a drawer or a horizontally scrolling row of pills at the top.
- **Empty state:** a clear message when no products match.
- **Loading skeleton:** product card skeletons while the first fetch runs.

### `/shop` vs `/collections`

| URL | Purpose |
|---|---|
| `/shop` | Browse ALL products; filter by category; keyword search; sort |
| `/collections` | Overview of curated collection tiles |
| `/collections/:slug` | Products in a specific collection |

---

<a id="homepage-requirement-mandatory"></a>

## Homepage Requirement

The demo homepage is what a vendor sees when previewing your theme, and what Queek's
automated capture uses for the Section Library thumbnails. A variant the homepage never
shows is one a vendor is offered but has never seen.

**What the check enforces:**

- Every variant you declare is shown at least once in `demo.json`, on the homepage or any
  other page (`theme/demo-completeness`). This covers every scope except `header`, `footer`
  and `subscribe` (only one renders per page), and any variant marked `auto_pick: false`.
  An alternative design that skips one gets a warning, not an error.
- Every section is a block type core renders (`theme/demo-block-types`).
- Every section names a variant your theme declares (`theme/composition-variants`).

**What makes a strong demo** (advice, not checked): a homepage of 8 or more sections that
opens on a `gallery` hero and uses each section type your theme offers.

| Section type | Purpose |
|---|---|
| `gallery` | Hero slideshow or editorial banner, first section |
| `products` | A grid and a carousel, to show both layouts |
| `categories` | Collection browser |
| `content` (default) | Rich text / markdown section |
| `content` (promo) | Promo banner with a call to action |
| `content` (brand-story) | Story with an image |
| `content` (testimonials) | Customer quotes |
| `content` (marquee) | Scrolling announcement |
| `button` | Call-to-action link (framework-owned, auto-styled) |
| `divider` | Visual separator (framework-owned) |
| `table` | Specs or comparison table (framework-owned) |
| `video` | Video embed (framework-owned) |

A sparse homepage does not sell the theme, and a variant missing from it has no art in the
Section Library.

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
        { "type": "content", "variant": "marquee", "data": { "items": ["New arrivals", "Customer favourites"] } },
        { "type": "categories", "variant": "your-default", "data": { "title": "Shop by Collection", "limit": 6 } },
        { "type": "products", "variant": "grid", "data": { "title": "Best Sellers", "sort": "popular", "limit": 8 } },
        { "type": "content", "variant": "promo", "data": { "title": "The seasonal edit", "subtitle": "Our latest picks, together", "cta_label": "Shop now", "cta_link": "/shop" } },
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

Demo copy is template copy: write it so it is true of any store in the business and passes
`theme/template-copy` (see [Templates](#templates)). The example above names no store,
place, price, offer or promise for that reason.

Every variant you declare in `manifest.ts` should appear at least once. If your theme
declares `gallery: [slider, mosaic]`, show both a slider and a mosaic gallery section.

### Demo Art Hosting (MANDATORY)

**Every image in `demo.json` is served from `media.usequeek.com` once your theme is
published. No external image host. No local file.**

Your demo art is not preview-only. Queek publishes it with your theme, keyed
`{type}/{variant}`, and fills real vendor stores with it — a `gallery/mosaic` that
declares five images hands the store builder five, in the order you wrote them. A
vendor's new store opens looking like *your* theme instead of one shared placeholder set.
That means a foreign URL is someone else's CDN serving Queek customers, and a local path
is a file that exists only on your machine.

You do not upload anything yourself. Pick whatever art you like while designing, and
reference it by public URL. When you submit, Queek uploads every image to its CDN and
rewrites `demo.json` to point at the copies. `npm run check` does not flag a foreign
host; the submission run does (`theme/demo-art-hosting`).

Use photography you have the right to publish: your own, or from a source whose licence
allows commercial use. Never another store's or a brand's.

Notes:

- Art is found by **value**, not field name, so art in a bare array (`products[].media.images`)
  is picked up along with `image`, `thumbnail`, `banner`, `avatar`, and friends. Social
  and video links are classified and left alone.
- A dead source URL **fails the submission** and is listed by name. Replace or remove it
  yourself — Queek will not invent art.
- A theme whose demo art is not on Queek's CDN is not published.

Use as many images per section as the variant is designed to show. The count you write
is the count the store builder gets.

---

## Framework-Owned Blocks

The following block types are owned by the framework. Their React components live in `@usequeek/theme-kit/shared-blocks` and render identical DOM across every theme:

- **divider** — visual separator
- **embed**: an iframe for any embeddable URL
- **video**: a YouTube or Vimeo link, or a direct video file
- **table** — pricing, specs, comparison tables
- **button** — standalone call-to-action link
- **image** — single image with optional caption
- **content/default** — plain markdown rendering
- **reviews**, **faq**, **callout**, **quote**, **product_qa**: customer reviews, questions and answers, and highlighted text
- **metaobjects**: entries of the vendor's custom content types (see Custom data below)

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

You cannot override their React logic. That is what keeps them consistent across themes.

Class-name vocabulary for the blocks you will style most (the others follow the same
`.core-block-<type>__<part>` pattern; read the kit's `shared-blocks/core-blocks.css` for
the full list):
```
.core-block                         /* shared container */
.core-block-divider                 .core-block-divider--line   .core-block-divider--space
.core-block-divider__line
.core-block-embed                   .core-block-embed__wrap   .core-block-embed__frame
.core-block-video                   .core-block-video__wrap   .core-block-video__frame
.core-block-video__el
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

## Fonts

A theme's fonts ship **as files inside the theme** (`theme/fonts/`), never fetched from a
font service at build time or on page load. `npm run check` enforces it
(`theme/fonts-self-hosted`).

- **`next/font/google` is rejected.** It downloads the fonts during `next build`. When the
  font service answers with a URL form the bundler cannot parse, the build fails with
  *"next/font/google queries have exactly one entry"*. A build that depends on a remote
  service at build time is not reproducible, so the font files live in the theme instead.
  Any other `next/font/*` import is rejected too, because a theme never imports Next.js.
- **A Google Fonts `@import` in your CSS is rejected.** The bundler drops it unless it ends
  up as the very first rule of the compiled stylesheet, so a store without a matching brand
  font never gets the theme's fonts at all. When it survives, every page waits on a
  render-blocking request to another origin (DNS and TLS) before any text can paint. If you
  have one, vendor what the service served: request the CSS2 URL with a desktop browser
  user agent, download each `woff2` file it names, and keep its `@font-face` rules as they are.

How to add one:

1. Put the `.woff2` files in `theme/fonts/`, one file per subset (latin; latin-ext for
   currency signs such as ₦ and for accented letters; vietnamese for dotted letters such as
   Yoruba ẹ and ọ; …).
2. Declare them in `theme/fonts/fonts.css` with `@font-face` — `font-display:
   swap` and the subset's `unicode-range`, so a browser downloads only the files the
   page's text needs.
3. Add a size-adjusted fallback face (`src: local("Arial")` with `size-adjust` /
   `ascent-override` / `descent-override`) so swapping in the real font doesn't shift
   the layout, and expose the pair as a CSS variable on your theme root:
   `.theme-<slug> { --my-font: "Jost", "Jost Fallback"; }`.
4. `import './fonts/fonts.css';` at the top of `layout.tsx`, before `theme.css`.

Never `preload` a theme font. Every theme's layout is in every store's bundle, so a preload would download the font on every store, whatever its theme.

## Locales

Every word your theme prints comes from `t()`, never a hard-coded string. The theme's English
lives in `theme/locales/en.default.json` and is referenced from `manifest.ts` as `strings`;
each other language is a `theme/locales/{lang}.json` file with the same keys.
`npm run check` enforces it (`theme/no-hardcoded-strings` and the `theme/locale-*` rules).
The rules in full are in the README under
[Translatable text](../README.md#translatable-text) and in
[Translating your theme](https://docs.usequeek.com/docs/themes/translations).

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

The merchant editor shows a **Section Library drawer** where vendors browse thumbnails of every variant you declare. **You do NOT generate these thumbnails.** Queek captures them for you.

### How it works (for your understanding — you don't run this)

1. Queek reads your `manifest.ts` for declared variants
2. Each variant is rendered in isolation, using your theme's demo data and Smart Placeholders
3. Queek screenshots each render
4. The merchant drawer displays the thumbnails

### What this means for you

- **Do NOT commit variant thumbnails** — Queek generates them
- **DO declare every variant in `manifest.ts`** with `id`, `label`, `purpose`, and optional `default`
- **DO include every variant on your homepage in `demo.json`** — the capture uses your demo data for realistic renders
- **DO use `<Image>` with `placeholder` props** — thumbnails look better when Smart Placeholders fire (branded gradients vs empty boxes)

---

## Temporary Files Policy

`npm run dev` writes the preview app to `.queek/preview` in your project and regenerates it on every run. `.queek/` is git-ignored: never commit it. Likewise keep screenshots, captures and other working files out of `theme/` and out of version control; the only screenshots your theme ships are the design screenshots `npm run screenshot` writes (see [theme.png](#themepng)).

`npm run screenshot` needs a Chromium-based browser: Google Chrome, Microsoft Edge, or Playwright's own Chromium (`npx playwright install chromium`).

---

## Visual QA During Development (RECOMMENDED)

Use the local preview to visually verify your theme as you build. Here's a workflow:

### 1. Preview your stores

```
npm run dev
```

Open the store at `http://localhost:7833/default` (the port is the next free one if 7833 is taken; the command prints the URL), and each `/<id>` for the other designs. Verify: all required sections present, layout balanced, typography readable, spacing consistent, brand colors applied.

### 2. Check responsive breakpoints

Use browser DevTools device toolbar to verify at:
- Desktop (1440px)
- Tablet (768px)
- Mobile (390px)

---

## Manifest

`manifest.ts` declares your theme's metadata, variants, design tokens, English strings and
image dimensions. The starter's `theme/manifest.ts` is the working minimum; this is its
shape:

```typescript
import type { ThemeManifest } from '@usequeek/theme-kit/types/theme';
import strings from './locales/en.default.json';

const manifest: ThemeManifest = {
  name: 'My Theme',
  slug: 'my-theme',
  description: 'One-line theme description for the theme picker',
  version: '1.0.0',
  strings,                       // the theme's English, see Locales
  tokens: {                      // the theme's default look; every dial a merchant can turn
    color: { primary: '#111111', bg: '#ffffff', text: '#111111' },
    type: { heading_font: 'Inter', body_font: 'Inter', scale_ratio: 1.25, heading_weight: 600, heading_case: 'none', heading_tracking: 0 },
    space: { density: 'comfortable' },
    shape: { radius: 'soft', border_weight: 'hairline' },
    elevation: 'flat',
    motion: 'subtle',
    image: { fit: 'cover', filter: 'none', radius: 'soft' },
  },
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
    subscribe: [
      { id: 'inline', label: 'Inline', default: true, purpose: 'Newsletter form rendered above the footer' },
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
- `id`: unique slug within its scope
- `label`: human-readable name shown in the merchant Section Library
- `purpose`: one sentence, under 80 characters, saying WHEN to use this variant. It is searchable in the Section Library drawer, and Queek's AI reads it when it composes a store, so it is checked as template copy (see [Templates](#templates)).
- `default`: (optional) marks one variant per scope as the default

**Every variant should also declare:**
- `fields`: the data fields its component reads, as `{ title: { type: 'string' } }` or the short form `title: 'string'`. `theme/field-parity` fails a field nothing reads, and a field read but not declared.
- `editable`: the design-token paths a merchant's edits visibly change in this variant (`['space.density', 'image.radius']`). Declare only the tokens the variant's CSS really consumes through `var(--…)`.

**The manifest must also have:**
- a `tokens` block with every dimension set (`theme/design-tokens`);
- a `subscribe` scope with exactly one `default: true` variant. A theme without one silently loses the newsletter app (`theme/subscribe-scope`);
- an implementation in `index.ts`'s `variantImplementations` for every declared variant, and a declaration for every implementation (`theme/variant-parity`).

**Bump `version`** when you make visual changes to existing variants. This signals Queek to re-capture thumbnails.

---

## Selection Metadata (best_for / auto_pick / min_images)

These three optional per-variant fields tell Queek's AI store builder which variant to pick for each scope when it composes a vendor's homepage. Setting them well is how your theme gets picked *well* instead of by generic defaults. They are id-agnostic: the builder never special-cases a variant by name, only by these fields.

```typescript
{ id: 'featured', label: 'Featured Grid', purpose: '…', best_for: ['food', 'supermarket', 'pharmacy'] },
{ id: 'testimonials', label: 'Testimonials', purpose: '…', auto_pick: false },
{ id: 'mosaic', label: 'Mosaic Grid', purpose: '…', min_images: 3 },
```

- **`best_for?: string[]`** — the business buckets this variant is a strong fit for. Boosts this variant's score when the builder composes a homepage for a vendor in that bucket. Omitted = universal (no bucket boost, still eligible). Values MUST be one of these bucket keys, written exactly as shown — no other strings are valid:

  `food` · `supermarket` · `product` · `pharmacy` · `laundry` · `delivery` · `service` · `gas-refill` · `local_market`

- **`auto_pick?: boolean`** — default `true`. Set `false` on special-purpose variants the AI builder must NEVER auto-select for a vendor: review/testimonial screenshot walls, decorative-only galleries, or focused/checkout chrome (e.g. a `minimal` header). Manual selection (by the vendor, or by Queek's AI editing directly) is still allowed — this only blocks the *automatic* first-build pick.

- **`min_images?: number`** — **gallery scope only.** The minimum hero slides this variant needs to look right (e.g. a mosaic collage needs 3). The builder gates on the vendor's actual resolved hero slide count (banner → 1 slide; else up to 5 real product photos; else 1 placeholder) and only offers the variant when there's enough material. Omitted = `1`.

**You SHOULD set `best_for`/`auto_pick` on every gallery/header/footer/products/categories variant** so Queek's AI selects well for every vendor bucket, not just the manifest default. **You SHOULD set `min_images` on every multi-slide gallery variant** (mosaics, filmstrips, collages). **You SHOULD set `auto_pick: false`** on any variant that is special-purpose rather than a general-audience default (review walls, decorative-only galleries, focused/checkout headers).

`npm run check` enforces the shape of these fields for every variant (`theme/selection-metadata`) — `best_for` values must be valid bucket keys, `auto_pick` must be a boolean, `min_images` must be a positive integer. It will NOT tell you if a value is a poor creative fit — that's a design judgment call.

---

## demo.json

It has the shape of a live vendor's data, and the checker holds it to these minimums:

| Field | Minimum | Notes |
|-------|---------|-------|
| `profile.slug` | — | Must match the theme slug |
| `config.theme` | — | Must match the theme slug |
| `products` | 6 | Include galleries, reviews, pricing. Spread `flags.featured` and `flags.is_new`. Every `shop_id` equals `profile.id` |
| `categories` | 3 | Each with an image |
| `posts` | 1 | With cover image |
| `pages` | 4 | `home` and three more; each design also ships `about`, `sales` and `landing` (see Templates) |
| `menus` | 1 | A header menu to the shop, collections, blog and your pages |

<a id="alternative-demo-stores"></a>

### Designs: more than one demo store

A theme can ship more than one demo store. Each store is a **design**. `demo.json` is
the main one (id `default`): the thumbnail, the section-library capture and the
theme's top-level compositions come from it. Each extra design is a file under
`demos/` in the same shape, declared in `theme.config.ts` with the **template** (the
business) it belongs to:

```
theme/
  demo.json              # the main design: a coffee roastery (template coffee)
  demos/
    foods.json           # design 1 of the foods template: a restaurant & takeaway
    foods.jpg            # its 1280×800 screenshot
    foods-2.json         # design 2 of the foods template: a grill house
    foods-2.jpg
```

```ts
// theme.config.ts
default_demo: { template: 'coffee', label: 'Coffee & café', design_label: 'Roastery', for: ['foods', 'health-wellness-store', 'vitamins-supplements', 'fitness-recovery'], description: '…' },
demos: [
  { id: 'foods', template: 'foods', label: 'Restaurant & takeaway', design_label: "Today's pot", for: ['foods'], description: '…' },
  // A second design of the same template: same business, a different design.
  // It declares only id, template, design_label and description — it inherits
  // the template's label and for.
  { id: 'foods-2', template: 'foods', design_label: 'Grill house', description: '…' },
],
```

- **`id`**: the design id, a lowercase slug. It becomes the URL and the filename, and
  it is what a store saves when a merchant picks it, so **never rename a shipped id**.
  `default` is reserved for `demo.json`.
- **`template`**: the key of the template (the business) the design belongs to,
  **on every design**, `default_demo` included. A lowercase slug, never `default`,
  never renamed once shipped. Template keys and design ids share one namespace: the
  main template's key may not be a design id.
- **`label`**: the business, as a merchant sees it (`Restaurant & takeaway`). It
  names the template, so a template's designs all carry the same one.
- **`design_label`**: what tells this design from the template's others (`Grill
  house`). Required when a template has two or more designs; Queek writes one on
  every design.
- **`for`**: the business slugs the template is the right store for, in the same
  vocabulary as `categories`. Same on every design of a template.

**Design 1** of a template is the design whose id is its key (`foods`; `default` for
the main template). The others follow in `demos[]` order. `label` and `for` are the
template's, declared once on design 1; a later design declares only `id`, `template`,
`design_label` and `description` — it inherits `label` and `for` from design 1.

Once published, every design previews at its own URL under the theme's slug, and every link inside it stays on that design:

| URL | shows |
|---|---|
| `/my-theme` | the **template gallery** (a theme with 2+ templates) |
| `/my-theme~coffee` | the main design, `demo.json` (the main template's key) |
| `/my-theme~foods`, `/my-theme~foods/shop` | design 1 of the foods template |
| `/my-theme~foods-2` | design 2 of the foods template |
| `/my-theme` | the store of a single-template theme (no gallery) |

Queek publishes each design with its own preview URL, home composition, page
compositions and variant images.

What the checker asks of a store, primary or not: the minimums above, art Queek can
host (it rehosts every file on submission), block types core renders, `profile.slug` and
`config.theme` naming this theme, `products[].shop_id` equal to `profile.id`, and a
`profile.id` no other store in the theme uses — the cart is keyed by it, so two
stores on one id would share a cart in the preview. Only the primary is required to
demonstrate every auto-pickable variant; an alternative that skips one gets a
warning, because a store built from it falls back to the primary's art for that
variant.

## Templates

**Theme → template → design.** The **theme** is the look. A
**template** is a business the theme is dressed as (Food, Hair). A **design**
is one concrete store of a template, one demo file: `food` and `food-2` are the Food
template's two designs. "Version" and "preset" are not words Queek uses.

A merchant (or Queek's AI, on their behalf) picks ONE design, and Queek builds
the vendor's store from its layout — its sections and variants, its header and
footer, its dials and each section's `style` — then fills every content slot with the
vendor's own material. The preview at `/<slug>~<id>` is what the vendor gets, content
aside. A theme ships one template per business it serves, and up to three designs of
each.

What each design must carry (`npm run check` rejects a gap):

- **`description`** (`theme/template-description`) — ≤ 300 characters, written
  for a model choosing on a merchant's behalf: who it fits · the look · the
  signature sections · what material it needs to look right. The main design's goes
  in `theme.config.ts` → `default_demo: { description }`; each other design's
  on its `demos[]` entry.

  > "Premium food. Dark, photo-led: full-bleed dish hero, tabbed menu, chef story,
  > reviews strip. Best for restaurants with 6+ strong dish photos."

- **A screenshot** (`theme/template-screenshot`) — `theme.jpg` (or `.png`) for the
  main design, `demos/<id>.jpg` for the rest, 1280×800, the design's first screen,
  captured by `npm run screenshot` at the design's own URL (see
  [theme.png](#themepng)). The AI looks at it before committing. Queek uploads it to
  its CDN when you submit, and publishes that URL as the design's preview image.
  Re-capture a screenshot after a design changes.
- **`for`** (`theme/template-business`) — the business the template is for, in the
  platform's vocabulary only (`docs/business-vocabulary.json`): service
  slugs a vendor registers as (`foods`, `beauty-cosmetics`…) and the marketplace
  catalogue's roots and branches (`beauty-personal-care` → `makeup`,
  `wigs-extensions-hair-accessories`…). The catalogue keys are
  what tell a wig seller from a makeup seller; Queek reads a vendor's business
  from what they sell and ranks a specific match above a broad one. The main
  template's goes in `default_demo: { for }` and names **its own** business, not
  the theme's `categories`. Every design of a template has the same `for`.
  **General or niche:** Queek matches a store first by the
  business category the merchant picked at setup (the service slugs), and by product
  categories only as the fallback and the niche signal. A **general** template (a
  business as a whole: clothes, food, beauty) **leads with** its business category
  (`fashion`, `foods`, `beauty-cosmetics`) and may add catalogue keys after it. A **niche** template (one
  kind of product inside a business: hair, shoes, jewellery) names **only**
  its catalogue keys (`["jewelry", "bags-accessories"]`, `["shoes"]`): naming the
  business would make it compete as a general template, and a makeup seller with no
  categorised products could be handed the wig store.
- **A `template` key and a `label`** naming the business the template is dressed as —
  `Restaurant & kitchen`, not `Food`. The main template's go in
  `default_demo: { template, label }` (the label falls back to the theme's name, which
  tells a merchant nothing next to the others); each other template's on its design
  1's `demos[]` entry.
- **A `design_label`** on each design of a template with two or more designs,
  unique within the template and true of any store (the same copy rules as below:
  `Neighbourhood buka`, never `Lekki buka` or `Mama Tee's buka`).
- **Chrome the theme implements** (`theme/template-chrome`) — `config.header.variant`
  and `config.footer.variant` name variants the theme declares. Queek
  publishes them as `header_variant` / `footer_variant`.
- **Style keys the variant declares** (`theme/template-style`) — a section's
  presentational fields (enum, boolean and colour fields: a tone, an alignment,
  a tilt, an overlay) are published per slot as `style`. Setting one the
  section's own variant does not declare is rejected: it would be copied onto
  every store built from the template and do nothing.

The design checks (explicit `template` on every design, one `for` per template,
`design_label` for 2+ designs, at most three designs per template, keys and ids in one
namespace) are `theme/template-designs`. `theme/template-versions` checks that no two
designs share a home composition. A design is grouped by the explicit `template` it
declares, never by an id's `-2` suffix.

What Queek publishes per design:
`id, template, template_label, design_index, design_label, label, for, description,
preview_url, preview_image, screenshot, header_variant, footer_variant, tokens`,
plus `home_composition` / `page_compositions` whose slots are
`{type, variant, style?, copy?}`, and `variant_images`.

- `template` / `template_label` — the template's key and label; `design_index` —
  1 for design 1, then 2, 3 with no gaps; `design_label` — as declared (null only on
  a one-design template that declares none).
- `label` — for readers that know no templates: the template label for a one-design
  template, `template_label — design_label` on **every** design of a 2+ design
  template, design 1 included (`Restaurant & kitchen — Dining room`,
  `Restaurant & kitchen — Neighbourhood buka`), so two cards never read alike.
- `for` — the template's, identical on each of its designs.
- `preview_url` — the design's own URL: `/my-theme~food-2`; `/my-theme~beauty` for the
  main design of a theme with a gallery; `/my-theme` for a single-template theme.
- Theme level: `preview_url` is the main design's URL (it matches `preview_image`,
  `theme.jpg`), and `gallery_url` is `/<slug>` for a theme with 2+ templates, else `null`.

`copy` is the section's words — its declared text fields and the
text keys of its list entries (steps, slides, FAQ), never links, images, alt text,
ids, prices or the demo store's own facts (email, phone, address, hours, coupon
code); Queek builds a section with no vendor facts behind it from them and its
AI rewrites them. A section still carrying template copy stays hidden from a
real store's shoppers until it is rewritten in the store's own words, so demo
copy may persuade: how things are made, the services, the story
and the claims are the demo's to tell ("Filled by hand", "Book a *fitting*").
What must not carry over is the demo store's identity: **no store name** (say
"our kitchen", "the studio"), **no place** ("across the city", or drop it), **no
naira amount and no promise only the vendor can make** (delivery windows, return
periods, free delivery, guarantees), **no opening hours or schedules**, and **no
founding date** ("since 2014") or email and phone number in the words.
Testimonials and reviews are exempt: their copy never reaches a real store.
Manifest notes and their quoted examples are different: Queek's AI writes fields from
them directly and they are never hidden, so they carry no claim, service,
turnaround or offer either. `theme/template-copy` rejects the rest.
`tokens` is the store's `config.tokens` — always the dials (sizes, weights,
spacing, radius, motion); the colours and faces only when the theme's CSS reads
the kit's colour/face vars (`--brand-*`, `--font-heading`/`--font-body`). A theme
that hard-codes its palette varies designs by layout, chrome, dials and
section `style`.

Rules for template authors:

- **A template is a business; the theme is the look.** One
  template per business the theme serves (`food`, `hair`, `clothes`…), each with
  that business's own sections (a priced menu, table booking, a size guide, install
  steps). The vendor's business picks the template through `for`; the merchant or
  Queek's AI picks the theme. **Never rename a shipped id or key**: vendors store the design
  id they picked (`foods` stays `foods`), and old links redirect by the key.
- **Designs** (`theme/template-designs`): up to three designs of one template —
  `{ id: 'food' }`, `{ id: 'food-2', template: 'food' }`, `{ id: 'food-3', template: 'food' }` —
  with exactly the same `for`; Queek spreads matching vendors across them. The id
  of a later design is any unused slug (`<key>-2` by habit): the grouping is the
  explicit `template`, never the suffix. Each has its own `design_label` saying what
  differs, its own description and screenshot, and is a different design, not a
  recolour: its own home order and section variants, plus its own header, footer and
  palette where the theme allows. No two designs in a theme may list the same home
  sections in the same order (`theme/template-versions`).
- **Designed pages** (`theme/template-pages`): every design ships `about`, `sales`
  and `landing` pages (page versions `about-2`…`-5`, `sales-2`/`-3`, `landing-2`/`-3`
  optional: the `-N` suffix still means something for page slugs), each previewable at
  `/<slug>~<id>/<page>`. Queek's AI clones the page for a
  vendor and fills it. On `sales` and `landing` every products section receives the
  products the merchant names — a single-product section (`featured`/`spotlight`) one
  each, in order, a list all of them — and the first hero is dressed with their
  photos. So design them for 1–3 products: a products section in the first three,
  closing on a contact card (both warned). `about` versions differ in story shape
  (how it started, team or kitchen, values and process, timeline, press); every
  section must be fillable from a vendor's real facts or photos, or it is dropped.
  The single-page default theme is exempt: every URL draws its one page.
- **Design for a thin vendor.** Slots the vendor has no data for are dropped
  (products, collections, reviews, blog); image slots fall back to the template's
  own art. Check the template still looks complete with 8 products, 3
  collections, 0 reviews and 2 photos.
- **Contact and FAQ** go where the design wants them; a template without them gets
  them appended at the end.

**The preview.** For a theme with two or more templates (and a main key):

- **The gallery.** `/<slug>` is the template gallery: one card per template (design
  1's screenshot, the template label, design 1's description, how many designs), each
  linking to `/<slug>~<key>`. It is Queek's own preview page, never a theme component:
  no theme CSS, header or footer. A single-template theme keeps `/<slug>` as its store.
- **The redirect.** The main store lives at `/<slug>~<main key>`, so an old link to
  `/<slug>/<page>` (sent in chats, saved in the dashboard) is a **308** there, query
  kept, answered before anything renders. Not moved: `/<slug>` itself, any `~`
  segment, single-template and unknown themes, a last segment with a dot.
- **All templates link and Designs dropdown.** The gallery `/<slug>` is the only page
  that lists a theme's templates; a template's store never lists the other templates.
  Every store of a gallery theme gets one **All templates** link at
  the end of the header menu, back to the gallery. A store whose template has two or
  more designs also gets a **Designs** item listing that template's designs by
  `design_label`, the one on screen marked `✓`.
  Every store, gallery theme or not, also gets a **Style guide** link to its own
  `/<slug>[~<id>]/style-guide` (left out when the demo's menu already links one).
  All are added at render time, never written into the demo JSON — Queek copies
  that into real stores — and carry `meta: { preview: true }`, so a theme that hides its
  own menu (the one-page default theme) can still show them. Designs is a `group` item
  with `url` children, so every header variant a design uses must draw a menu item's
  children (a dropdown on desktop, indented under it in the mobile menu), and each
  design's own header must render the gallery link and its Designs entries. The extra
  items make the menu longer: a header that sets the menu beside a centred logo must
  give it its own row when it does not fit on one line, never wrap it under itself or
  run it into the logo.
- **Embed.** When the merchant dashboard frames a preview, the frame shows exactly
  the design the merchant is about to activate: no All templates link and no Designs
  dropdown. The gallery requested in embed is a **307** (never cached) to the main design.

### Placeholder content

`theme/placeholder-content` rejects the stand-ins a new theme starts with, so none is
ever submitted:

- the skeleton's products: any demo product whose `slug` starts with `placeholder-`;
- the skeleton's placeholder photos, `media.usequeek.com/theme-assets/_bare/…`, matched by
  their exact URLs;
- a theme `description` in `theme.config.ts` that starts "Replace before publishing"
  (what `npm create @usequeek/theme` writes; each template's own placeholder
  description is `theme/template-description`'s).

Every theme's preview must look like itself, and shared stand-ins would make every store
look the same. A theme scaffolded with `npm create @usequeek/theme` therefore fails this
rule until you replace them. That is the first item on your to-do list, not a fault in the
scaffold. The starter repository itself fails it on purpose, so an unedited copy cannot be
submitted.

## theme.png

1280x800 screenshot of the homepage (`theme.jpg` or `theme.png`) — the main
design's screenshot; see [Templates](#templates). `npm run screenshot`
(`queek theme screenshot [design ids…]`) captures every design's first screen at
1280×800 into these files: `theme.jpg` for the main design, `demos/<id>.jpg` for the
rest. Pass design ids to capture only those. Queek uploads the screenshots when you
submit.

## Registration

A theme is one name, and it has to be the same everywhere: the `slug` in `manifest.ts`
and `theme.config.ts`, the `.theme-<slug>` root class that `layout.tsx` puts on its
root element (your whole stylesheet is scoped to it), and `profile.slug` and `config.theme`
in every demo store. `npm create @usequeek/theme` sets all of them; if you rename a theme
by hand, change all of them. You register nothing else: Queek registers the theme under
that slug when you submit it, so there is no loader to edit and no registry step to run.

## Validation

```bash
npm run check                            # what would block this theme from publishing
npx queek theme check --json             # same findings, machine-readable
npx queek theme check --quiet            # errors only
npx queek theme check --fail-level warning   # exit 1 on warnings too
```

Each finding names the rule, where it is, what is wrong, and what to do:

```
theme/demo.json
  error    6 placeholder product(s) and 10 of the starter's photos  theme/placeholder-content
           Fix: Replace the starter's products and photos with your own for this business. …
           Docs: https://github.com/usequeek/theme-starter/blob/main/docs/THEME.md#placeholder-content
```

**These are the rules Queek runs when you submit.** A few need Queek's side (the
demo-art host check and the two listed under the rule index); the report lists them at
the end. Beyond those there is no second definition of "valid" to pass locally and fail
on submission.

**A theme publishes only when every blocking finding is clear** — no partial
publish. A variant that does not render is not quietly dropped, because Queek
composes real stores from your manifest and demo, and a hole there
becomes a hole in a vendor's storefront.

`--json` exists for agents: each finding carries a stable `rule` id, a `level`,
`where`, `message`, `fix` and a `fixable` flag, and `summary` counts the errors and
warnings. The exit code is non-zero while any error blocks. Point your tooling at
it and iterate until `summary.errors` is 0.

### Rule index

| Rule | Checks |
|---|---|
| `theme/structure` | Every required file, block, page and shell is present |
| `theme/module-contract` | The default export is annotated `ThemeModule` |
| `theme/identity` | Manifest, config, demo and directory agree on the slug |
| `theme/core-boundary` | No SDK, Next.js or app-code imports; no direct API calls; no store mutations |
| `theme/code-quality` | Logo is a link, menu links use `menuItemToHref()`, client directives, no raw `<img>`, no cross-theme imports |
| `theme/footer-shows-powered-by` | Every footer variant renders `<PoweredByQueek />` |
| `theme/product-page-places-metafields` | The product page places `<ProductMetafields />` |
| `theme/markdown-html` | `renderMarkdown` output is rendered as children |
| `theme/vendor-facts` | A vendor's tagline, address, phone, email and description never fall back to your words |
| `theme/fonts-self-hosted` | Fonts ship as files in the theme |
| `theme/variant-parity`, `theme/field-parity` | Manifest and `index.ts` agree on variants; each variant declares the fields it reads |
| `theme/design-tokens` | A complete `tokens` block that `theme.css` actually uses |
| `theme/selection-metadata` | `best_for`, `auto_pick` and `min_images` are valid |
| `theme/subscribe-scope` | A `subscribe` scope with exactly one default |
| `theme/demo-store`, `theme/demo-stores` | Demo stores are complete, name this theme, and match `theme.config.ts` |
| `theme/demo-completeness`, `theme/demo-block-types`, `theme/composition-variants` | Every variant is shown; every section is a renderable block type and a declared variant |
| `theme/demo-art-hosting` | Demo images are on Queek's CDN (submission run only) |
| `theme/template-description`, `theme/template-business`, `theme/template-designs`, `theme/template-versions`, `theme/template-pages`, `theme/template-chrome`, `theme/template-style`, `theme/template-screenshot` | The template and design rules in [Templates](#templates) |
| `theme/template-copy` | Demo copy carries no store identity, offer or promise |
| `theme/placeholder-content` | No starter placeholders remain |
| `theme/no-hardcoded-strings`, `theme/locale-key-exists`, `theme/locale-key-naming`, `theme/locale-file-parity`, `theme/locale-key-unused` | Every printed word comes from `t()`; the locale files are well formed |

Two things only Queek can check, listed at the end of every report: that the design is its
own and not a copy of an existing Queek theme, and that every declared variant renders
visible content with sample data.
