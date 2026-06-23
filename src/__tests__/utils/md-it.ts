import type { Options as MarkdownItOptions } from 'markdown-it'
import type { PluginOptions, TocCallback } from '../../index'

import markdownIt from 'markdown-it'
import markdownItTocAndAnchor from '../../index'

type MarkdownItOptionsWithTocCallback = MarkdownItOptions & {
    tocCallback?: TocCallback
}

export default function mdIt(
    md: string | string[],
    options: PluginOptions = {},
    mdOptions: MarkdownItOptionsWithTocCallback = {},
    renderEnv: Record<string, unknown> = {},
): string | string[] | undefined {
    const mdItInstance = markdownIt({
        html: true,
        linkify: true,
        ...mdOptions,
    }).use(markdownItTocAndAnchor, {
        toc: false,
        anchorLink: false,
        ...options,
    })

    if (typeof md === 'string') {
        return mdItInstance.render(md, renderEnv)
    }

    if (Array.isArray(md)) {
        return md.map(s => mdItInstance.render(s, renderEnv))
    }
}
