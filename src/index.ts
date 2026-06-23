import type MarkdownIt from 'markdown-it'
import type { RenderRule } from 'markdown-it/lib/renderer.mjs'
import clone from 'clone'
import Token from 'markdown-it/lib/token.mjs'
import uslug from 'uslug'

const TOC = '@[toc]'
const TOC_RE = /^@\[toc\]/im

export interface TocHeading {
    content: string
    anchor: string
    level: number
}

export type TocCallback = (
    tocMarkdown: string,
    tocArray: TocHeading[],
    tocHtml: string,
) => void

export interface PluginOptions {
    toc?: boolean
    tocClassName?: string
    tocFirstLevel?: number
    tocLastLevel?: number
    tocCallback?: TocCallback | null
    anchorLink?: boolean
    anchorLinkSymbol?: string
    anchorLinkBefore?: boolean
    anchorClassName?: string
    resetIds?: boolean
    anchorLinkSpace?: boolean
    anchorLinkSymbolClassName?: string | null
    wrapHeadingTextInAnchor?: boolean
    slugify?: (value: string) => string
    anchorLinkPrefix?: string
}

interface ResolvedPluginOptions extends Required<
    Omit<PluginOptions, 'slugify' | 'anchorLinkPrefix' | 'tocCallback'>
> {
    tocCallback: TocCallback | null
    slugify?: (value: string) => string
    anchorLinkPrefix?: string
}

interface TocTreeNode {
    heading?: Partial<TocHeading>
    nodes: TocTreeNode[]
}

type InlineTokenWithTocAnchor = Token & {
    _tocAnchor?: string
}

let markdownItSecondInstance!: MarkdownIt
let headingIds: Record<string, number> = {}
let tocHtml = ''

function repeat(string: string, num: number): string {
    return Array.from({ length: num + 1 }).join(string)
}

function makeSafe(string: string,
    ids: Record<string, number>,
    slugifyFn: (value: string) => string): string {
    const key = slugifyFn(string)
    if (!ids[key]) {
        ids[key] = 0
    }
    ids[key]++
    return key + (ids[key] > 1 ? `-${ids[key]}` : '')
}

function space(): Token {
    return Object.assign(new Token('text', '', 0), { content: ' ' })
}

function renderAnchorLinkSymbol(options: ResolvedPluginOptions): Token[] {
    if (options.anchorLinkSymbolClassName) {
        return [
            Object.assign(new Token('span_open', 'span', 1), {
                attrs: [['class', options.anchorLinkSymbolClassName]],
            }),
            Object.assign(new Token('text', '', 0), {
                content: options.anchorLinkSymbol,
            }),
            new Token('span_close', 'span', -1),
        ]
    }

    return [
        Object.assign(new Token('text', '', 0), {
            content: options.anchorLinkSymbol,
        }),
    ]
}

function renderAnchorLink(anchor: string,
    options: ResolvedPluginOptions,
    tokens: Token[],
    idx: number): void {
    const attrs: [string, string][] = []

    if (options.anchorClassName != null) {
        attrs.push(['class', options.anchorClassName])
    }

    attrs.push(['href', `#${anchor}`])

    const openLinkToken = Object.assign(new Token('link_open', 'a', 1), {
        attrs,
    })
    const closeLinkToken = new Token('link_close', 'a', -1)
    const headingChildren = tokens[idx + 1].children!

    if (options.wrapHeadingTextInAnchor) {
        headingChildren.unshift(openLinkToken)
        headingChildren.push(closeLinkToken)
    }
    else {
        const linkTokens = [
            openLinkToken,
            ...renderAnchorLinkSymbol(options),
            closeLinkToken,
        ]

        const actionOnArray: Record<string, 'push' | 'unshift'> = {
            false: 'push',
            true: 'unshift',
        }
        const anchorBeforeKey = String(options.anchorLinkBefore)

        if (options.anchorLinkSpace) {
            linkTokens[actionOnArray[String(!options.anchorLinkBefore)]](space())
        }

        headingChildren[actionOnArray[anchorBeforeKey]](...linkTokens)
    }
}

function treeToMarkdownBulletList(tree: TocTreeNode[], indent = 0): string {
    return tree
        .map((item) => {
            const indentation = '  '
            let node = `${repeat(indentation, indent)}*`
            if (item.heading?.content) {
                const contentWithoutAnchor = item.heading.content.replace(
                    /\[([^\]]*)\]\([^)]*\)/g,
                    '$1',
                )
                node += ` [${contentWithoutAnchor}](#${item.heading.anchor})\n`
            }
            else {
                node += '\n'
            }
            if (item.nodes.length) {
                node += treeToMarkdownBulletList(item.nodes, indent + 1)
            }
            return node
        })
        .join('')
}

function generateTocMarkdownFromArray(headings: TocHeading[],
    options: ResolvedPluginOptions): string {
    const tree: TocTreeNode = { nodes: [] }

    headings.forEach((heading) => {
        if (
            heading.level < options.tocFirstLevel
            || heading.level > options.tocLastLevel
        ) {
            return
        }

        let i = 1
        let lastItem: TocTreeNode = tree
        for (; i < heading.level - options.tocFirstLevel + 1; i++) {
            if (lastItem.nodes.length === 0) {
                lastItem.nodes.push({
                    heading: {},
                    nodes: [],
                })
            }
            lastItem = lastItem.nodes[lastItem.nodes.length - 1]
        }
        lastItem.nodes.push({
            heading,
            nodes: [],
        })
    })

    return treeToMarkdownBulletList(tree.nodes)
}

export default function markdownItTocAndAnchor(
    md: MarkdownIt,
    options?: PluginOptions,
): void {
    const resolvedOptions: ResolvedPluginOptions = {
        toc: true,
        tocClassName: 'markdownIt-TOC',
        tocFirstLevel: 1,
        tocLastLevel: 6,
        tocCallback: null,
        anchorLink: true,
        anchorLinkSymbol: '#',
        anchorLinkBefore: true,
        anchorClassName: 'markdownIt-Anchor',
        resetIds: true,
        anchorLinkSpace: true,
        anchorLinkSymbolClassName: null,
        wrapHeadingTextInAnchor: false,
        ...options,
    }

    markdownItSecondInstance = clone(md) as MarkdownIt
    headingIds = {}

    md.core.ruler.push('init_toc', (state) => {
        const tokens = state.tokens

        if (resolvedOptions.resetIds) {
            headingIds = {}
        }

        const tocArray: TocHeading[] = []
        const slugifyFn
            = (typeof resolvedOptions.slugify === 'function'
                && resolvedOptions.slugify)
            || uslug

        for (let i = 0; i < tokens.length; i++) {
            if (tokens[i].type !== 'heading_close') {
                continue
            }

            const heading = tokens[i - 1] as InlineTokenWithTocAnchor
            const headingClose = tokens[i]

            if (heading.type === 'inline') {
                let content: string
                if (
                    heading.children
                    && heading.children.length > 0
                    && heading.children[0].type === 'link_open'
                ) {
                    content = heading.children[1].content
                    heading._tocAnchor = makeSafe(content, headingIds, slugifyFn)
                }
                else {
                    content = heading.content
                    heading._tocAnchor = makeSafe(
                        heading.children!.reduce((acc, t) => acc + t.content, ''),
                        headingIds,
                        slugifyFn,
                    )
                }

                if (resolvedOptions.anchorLinkPrefix) {
                    heading._tocAnchor
                        = resolvedOptions.anchorLinkPrefix + heading._tocAnchor
                }

                tocArray.push({
                    content,
                    anchor: heading._tocAnchor,
                    level: +headingClose.tag.substr(1, 1),
                })
            }
        }

        const tocMarkdown = generateTocMarkdownFromArray(
            tocArray,
            resolvedOptions,
        )
        const tocTokens = markdownItSecondInstance.parse(tocMarkdown, {})

        if (
            typeof tocTokens[0] === 'object'
            && tocTokens[0].type === 'bullet_list_open'
        ) {
            const attrs = (tocTokens[0].attrs = tocTokens[0].attrs || [])

            if (resolvedOptions.tocClassName != null) {
                attrs.push(['class', resolvedOptions.tocClassName])
            }
        }

        tocHtml = markdownItSecondInstance.renderer.render(
            tocTokens,
            markdownItSecondInstance.options,
            {},
        )

        const env = state.env as {
            tocCallback?: TocCallback
        }

        if (typeof env.tocCallback === 'function') {
            env.tocCallback.call(undefined, tocMarkdown, tocArray, tocHtml)
        }
        else if (typeof resolvedOptions.tocCallback === 'function') {
            resolvedOptions.tocCallback.call(
                undefined,
                tocMarkdown,
                tocArray,
                tocHtml,
            )
        }
        else if (
            typeof (md.options as { tocCallback?: TocCallback }).tocCallback
            === 'function'
        ) {
            (md.options as { tocCallback: TocCallback }).tocCallback.call(
                undefined,
                tocMarkdown,
                tocArray,
                tocHtml,
            )
        }
    })

    md.inline.ruler.after('emphasis', 'toc', (state, silent) => {
        if (
            state.src.charCodeAt(state.pos) !== 0x40
            || state.src.charCodeAt(state.pos + 1) !== 0x5B
            || silent
        ) {
            return false
        }

        const execResult = TOC_RE.exec(state.src)
        const match = execResult ? execResult.filter(m => m) : []
        if (match.length < 1) {
            return false
        }

        let token = state.push('toc_open', 'toc', 1)
        token.markup = TOC
        token = state.push('toc_body', '', 0)
        token = state.push('toc_close', 'toc', -1)

        state.pos = state.pos + 6

        return true
    })

    const originalHeadingOpen: RenderRule
        = md.renderer.rules.heading_open
            || function (...args) {
                const [tokens, idx, opts, , self] = args
                return self.renderToken(tokens, idx, opts)
            }

    md.renderer.rules.heading_open = function (...args) {
        const [tokens, idx] = args
        const headingToken = tokens[idx + 1] as InlineTokenWithTocAnchor

        const attrs = (tokens[idx].attrs = tokens[idx].attrs || [])
        const anchor = headingToken._tocAnchor!
        attrs.push(['id', anchor])

        if (resolvedOptions.anchorLink) {
            renderAnchorLink(anchor, resolvedOptions, tokens, idx)
        }

        return originalHeadingOpen.apply(this, args)
    }

    md.renderer.rules.toc_open = () => ''
    md.renderer.rules.toc_close = () => ''
    md.renderer.rules.toc_body = () => ''

    if (resolvedOptions.toc) {
        md.renderer.rules.toc_body = () => tocHtml
    }
}
