# @lincy/markdown-it-toc-and-anchor

**English** | [简体中文](README-CN.md)

[![npm version](https://img.shields.io/npm/v/@lincy/markdown-it-toc-and-anchor.svg)](https://www.npmjs.com/package/@lincy/markdown-it-toc-and-anchor)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> [markdown-it](https://github.com/markdown-it/markdown-it) plugin that adds table of contents and anchor links to headings.

Fork of [markdown-it-toc-and-anchor](https://github.com/medfreeman/markdown-it-toc-and-anchor), rewritten in TypeScript with built-in type definitions.

## Features

- Insert a table of contents at `@[toc]` in your Markdown
- Add `id` attributes and optional anchor links (`#`) to headings
- Customize TOC level range, CSS classes, slug generation, and anchor placement
- Receive TOC data via callback (Markdown, structured array, or HTML)

## Installation

```bash
pnpm add @lincy/markdown-it-toc-and-anchor markdown-it
```

```bash
npm install @lincy/markdown-it-toc-and-anchor markdown-it
```

```bash
yarn add @lincy/markdown-it-toc-and-anchor markdown-it
```

`markdown-it` is a peer dependency at runtime — install it in your project.

## Usage

### Basic

Place `@[toc]` where you want the table of contents to appear:

```md
@[toc]

# Introduction

## Getting started
```

```ts
import markdownItTocAndAnchor from '@lincy/markdown-it-toc-and-anchor'
import MarkdownIt from 'markdown-it'

const md = new MarkdownIt({
    html: true,
    linkify: true,
})

md.use(markdownItTocAndAnchor)

const html = md.render(markdown)
```

Rendered output includes a TOC list at the `@[toc]` position and `id` attributes on each heading. Anchor links are enabled by default.

### With options

```ts
import markdownItTocAndAnchor from '@lincy/markdown-it-toc-and-anchor'
import MarkdownIt from 'markdown-it'

const md = new MarkdownIt({ html: true, linkify: true })

md.use(markdownItTocAndAnchor, {
    tocClassName: 'table-of-contents',
    anchorLinkSymbol: '¶',
    anchorLinkBefore: false,
    tocFirstLevel: 2,
    tocLastLevel: 4,
})

const html = md.render(markdown)
```

### TypeScript

The plugin exports types you can import directly:

```ts
import type {
    PluginOptions,
    TocCallback,
    TocHeading,
} from '@lincy/markdown-it-toc-and-anchor'
```

## Options

All options are optional.

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `toc` | `boolean` | `true` | Enable or disable replacing `@[toc]` with the generated TOC HTML |
| `tocClassName` | `string \| null` | `"markdownIt-TOC"` | CSS class for the TOC `<ul>`. Set to `null` to omit the class |
| `tocFirstLevel` | `number` | `1` | Lowest heading level included in the TOC (e.g. `2` skips `<h1>`) |
| `tocLastLevel` | `number` | `6` | Highest heading level included in the TOC (e.g. `5` skips `<h6>`) |
| `tocCallback` | `TocCallback \| null` | `null` | Callback invoked with TOC data after parsing. See [TOC callback](#toc-callback) |
| `anchorLink` | `boolean` | `true` | Add clickable anchor links inside headings |
| `anchorLinkSymbol` | `string` | `"#"` | Text shown for the anchor link |
| `anchorLinkBefore` | `boolean` | `true` | Place the anchor link before (`true`) or after (`false`) the heading text |
| `anchorLinkSpace` | `boolean` | `true` | Insert a space between the anchor link and heading text |
| `anchorLinkSymbolClassName` | `string \| null` | `null` | When set, wrap the symbol in `<span class="...">` |
| `anchorClassName` | `string \| null` | `"markdownIt-Anchor"` | CSS class for anchor `<a>` elements. Set to `null` to omit |
| `anchorLinkPrefix` | `string` | `undefined` | Prefix added to generated heading IDs (e.g. `"section-"`) |
| `wrapHeadingTextInAnchor` | `boolean` | `false` | Wrap the entire heading text in the anchor link (overrides symbol and position options) |
| `resetIds` | `boolean` | `true` | Reset duplicate-ID counters on each render. Set to `false` when rendering multiple documents on one page |
| `slugify` | `(value: string) => string` | [`uslug`](https://www.npmjs.com/package/uslug) | Custom function to generate heading IDs from text |

### Custom slugify

```ts
md.use(markdownItTocAndAnchor, {
    slugify: value => `/some/prefix/${value.replace(/([/ '])/g, '_')}`,
})
```

## TOC callback

Use `tocCallback` to receive TOC data without inserting it into the document, or in addition to `@[toc]`.

```ts
interface TocHeading {
    content: string
    anchor: string
    level: number
}

type TocCallback = (
    tocMarkdown: string,
    tocArray: TocHeading[],
    tocHtml: string,
) => void
```

### Plugin options

```ts
md.use(markdownItTocAndAnchor, {
    toc: false,
    tocCallback(tocMarkdown, tocArray, tocHtml) {
        console.log(tocHtml)
    },
})
```

### Global markdown-it options

```ts
const md = new MarkdownIt().use(markdownItTocAndAnchor)

md.set({
    tocCallback(tocMarkdown, tocArray, tocHtml) {
        console.log(tocHtml)
    },
})

md.render(markdown)
```

### Render environment

```ts
md.render(markdown, {
    tocCallback(tocMarkdown, tocArray, tocHtml) {
        console.log(tocHtml)
    },
})
```

When multiple sources define a callback, priority is: render environment → plugin options → global markdown-it options.

## Development

```bash
pnpm install
pnpm test          # run tests
pnpm test:watch    # watch mode
pnpm build         # compile to dist/
pnpm lint          # eslint
pnpm lint:ts       # type check
```

## Contributing

- Pull requests and stars are welcome.
- For bugs and feature requests, please [open an issue](https://github.com/lincenying/markdown-it-toc-and-anchor/issues).
- Pull requests should include passing tests (`pnpm test`).

## [Changelog](CHANGELOG.md)

## [License](LICENSE)

MIT — see [LICENSE](LICENSE). Based on the original work by [Maxime Thirouin](https://github.com/medfreeman/markdown-it-toc-and-anchor).
