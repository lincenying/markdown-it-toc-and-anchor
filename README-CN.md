# @lincy/markdown-it-toc-and-anchor

[English](README.md) | **简体中文**

[![npm version](https://img.shields.io/npm/v/@lincy/markdown-it-toc-and-anchor.svg)](https://www.npmjs.com/package/@lincy/markdown-it-toc-and-anchor)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> 为 [markdown-it](https://github.com/markdown-it/markdown-it) 提供目录（TOC）与标题锚点链接的插件。

基于 [markdown-it-toc-and-anchor](https://github.com/medfreeman/markdown-it-toc-and-anchor) 的 fork，使用 TypeScript 重写，并内置类型定义。

## 特性

- 在 Markdown 中的 `@[toc]` 位置插入目录
- 为标题添加 `id` 属性，并可选择性地插入锚点链接（`#`）
- 可自定义目录层级范围、CSS 类名、slug 生成规则与锚点位置
- 通过回调获取目录数据（Markdown、结构化数组或 HTML）

## 安装

```bash
pnpm add @lincy/markdown-it-toc-and-anchor markdown-it
```

```bash
npm install @lincy/markdown-it-toc-and-anchor markdown-it
```

```bash
yarn add @lincy/markdown-it-toc-and-anchor markdown-it
```

`markdown-it` 在运行时需要由你的项目自行安装。

## 用法

### 基础用法

在需要显示目录的位置写入 `@[toc]`：

```md
@[toc]

# 介绍

## 快速开始
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

渲染结果会在 `@[toc]` 处输出目录列表，并为每个标题添加 `id` 属性。锚点链接默认开启。

### 配置选项

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

插件直接导出以下类型，可按需导入：

```ts
import type {
    PluginOptions,
    TocCallback,
    TocHeading,
} from '@lincy/markdown-it-toc-and-anchor'
```

## 配置项

所有配置项均为可选。

| 选项 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `toc` | `boolean` | `true` | 是否将 `@[toc]` 替换为生成的目录 HTML |
| `tocClassName` | `string \| null` | `"markdownIt-TOC"` | 目录 `<ul>` 的 CSS 类名。设为 `null` 则不添加类名 |
| `tocFirstLevel` | `number` | `1` | 目录包含的最低标题级别（如 `2` 会跳过 `<h1>`） |
| `tocLastLevel` | `number` | `6` | 目录包含的最高标题级别（如 `5` 会跳过 `<h6>`） |
| `tocCallback` | `TocCallback \| null` | `null` | 解析完成后触发的回调，用于获取目录数据。详见 [目录回调](#目录回调) |
| `anchorLink` | `boolean` | `true` | 是否在标题内添加可点击的锚点链接 |
| `anchorLinkSymbol` | `string` | `"#"` | 锚点链接显示的文本 |
| `anchorLinkBefore` | `boolean` | `true` | 锚点链接放在标题文字之前（`true`）或之后（`false`） |
| `anchorLinkSpace` | `boolean` | `true` | 是否在锚点链接与标题文字之间插入空格 |
| `anchorLinkSymbolClassName` | `string \| null` | `null` | 设置后，将符号包裹在 `<span class="...">` 中 |
| `anchorClassName` | `string \| null` | `"markdownIt-Anchor"` | 锚点 `<a>` 元素的 CSS 类名。设为 `null` 则不添加 |
| `anchorLinkPrefix` | `string` | `undefined` | 为生成的标题 ID 添加前缀（如 `"section-"`） |
| `wrapHeadingTextInAnchor` | `boolean` | `false` | 将整个标题文字包裹在锚点链接内（会覆盖符号与位置相关选项） |
| `resetIds` | `boolean` | `true` | 每次渲染时重置重复 ID 计数器。同一页面渲染多份文档时可设为 `false` |
| `slugify` | `(value: string) => string` | [`uslug`](https://www.npmjs.com/package/uslug) | 自定义从标题文本生成 ID 的函数 |

### 自定义 slugify

```ts
md.use(markdownItTocAndAnchor, {
    slugify: value => `/some/prefix/${value.replace(/([/ '])/g, '_')}`,
})
```

## 目录回调

使用 `tocCallback` 可在不将目录插入文档的情况下获取目录数据，也可与 `@[toc]` 同时使用。

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

### 插件选项

```ts
md.use(markdownItTocAndAnchor, {
    toc: false,
    tocCallback(tocMarkdown, tocArray, tocHtml) {
        console.log(tocHtml)
    },
})
```

### 全局 markdown-it 选项

```ts
const md = new MarkdownIt().use(markdownItTocAndAnchor)

md.set({
    tocCallback(tocMarkdown, tocArray, tocHtml) {
        console.log(tocHtml)
    },
})

md.render(markdown)
```

### 渲染环境（render env）

```ts
md.render(markdown, {
    tocCallback(tocMarkdown, tocArray, tocHtml) {
        console.log(tocHtml)
    },
})
```

当多处都定义了回调时，优先级为：渲染环境 → 插件选项 → 全局 markdown-it 选项。

## 开发

```bash
pnpm install
pnpm test          # 运行测试
pnpm test:watch    # 监听模式
pnpm build         # 编译到 dist/
pnpm lint          # eslint
pnpm lint:ts       # 类型检查
```

## 参与贡献

- 欢迎提交 Pull Request 与 Star。
- 如有 bug 或功能建议，请 [提交 Issue](https://github.com/lincenying/markdown-it-toc-and-anchor/issues)。
- Pull Request 需确保测试通过（`pnpm test`）。

## [更新日志](CHANGELOG.md)

## [许可证](LICENSE)

MIT — 详见 [LICENSE](LICENSE)。基于 [Maxime Thirouin](https://github.com/medfreeman/markdown-it-toc-and-anchor) 的原始项目。
