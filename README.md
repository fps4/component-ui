@fps4/component-ui
==================

Reusable, framework-agnostic React UI components for FPS4 web projects.

Install (GitHub Packages)
-------------------------
1) Add to your project's `.npmrc`:
   - `@fps4:registry=https://npm.pkg.github.com`
   - `//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN`

2) Install:
```
npm i @fps4/component-ui@0.1.0
```

Peer dependencies
-----------------
- `react` (>=18)
- `react-dom` (>=18)
- `@mui/material` (>=5)

Usage
-----
```
import NextLink from 'next/link';
import { ContentCarousel, MarkdownRenderer } from '@fps4/component-ui';

<ContentCarousel
  heading="Highlights"
  items={[
    {
      title: 'Welcome',
      description: 'Build once, reuse everywhere.',
      href: '/about'
    }
  ]}
  LinkComponent={NextLink}
/>

<MarkdownRenderer preset="fps4-home" content="# Hello" />
```

Framework-agnostic links
------------------------
Components accept an optional `LinkComponent` and `getLinkProps` to stay router-agnostic.

Example for Next.js:
```
<ContentTiles
  LinkComponent={NextLink}
  getLinkProps={({ href }) => ({ href })}
/>
```

Example for React Router:
```
<ContentTiles
  LinkComponent={Link}
  getLinkProps={({ href }) => ({ to: href })}
/>
```

Component props (high level)
----------------------------
- ContentCarousel
  - `items` array supports `title`, `description`, `image`, `video`, `backgroundColor`,
    `href`/`ctaHref`, `ctaLabel`, `eyebrow`.
  - `LinkComponent`, `getLinkProps` for routing.
- ContentTiles
  - `items` array or object with `title`, `description`, `eyebrow`, `backgroundColor`,
    `backgroundImage`, `href`/`ctaHref`, `ctaLabel`.
  - `ViewportComponent` to wrap the container (optional).
  - `LinkComponent`, `getLinkProps` for routing.
  - `ctaVariant` (defaults to `body2`) to control CTA text styling.
- CtaButtons
  - `items` array with `label`/`ctaLabel`, `href`/`ctaHref`, optional `action`.
  - `onAction(button)` to handle custom actions without app-specific hooks.
  - `isActionDisabled(button)` to disable action buttons when needed.
  - `LinkComponent`, `getLinkProps` for routing.
- PageLinks
  - `items` array with `ctaLabel`, `ctaHref`, optional `icon`.
  - `onCopy()` fires after a successful copy-to-clipboard action.
  - `LinkComponent`, `getLinkProps` for routing.
- MarkdownRenderer
  - Base behavior: thin wrapper around `react-markdown` with passthrough props.
  - Presets:
    - `preset="base"` (default)
    - `preset="fps4-home"` for FPS4 home markdown headings/lists/links with slug anchors.
    - `preset="fps4-page"` for FPS4 page markdown typography/lists/links and YouTube image-embed mapping.
  - `content` or `children` for markdown source text (`content` takes precedence when both are provided).
  - `lang`, `fallbackLang`, `youtubeMap` are used by `fps4-page` for localized YouTube references.
  - `components` and `rehypePlugins` can still be passed to extend or override preset behavior.

Build
-----
```
npm run build
```
Outputs to `dist/` (ESM + type declarations).
