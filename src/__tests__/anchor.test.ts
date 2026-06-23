import { describe, expect, it } from 'vitest'

import mdIt from './utils/md-it'

describe('markdown-it-toc-and-anchor anchor', () => {
    it('should add anchors', () => {
        expect(
            mdIt(
                `@[toc]
# 'Heading' ?
# $.lel!
# $.lel?
`,
                { anchorLink: true },
            ),
        ).toBe(
            `<p></p>
<h1 id="heading"><a class="markdownIt-Anchor" href="#heading">#</a> 'Heading' ?</h1>
<h1 id="lel"><a class="markdownIt-Anchor" href="#lel">#</a> $.lel!</h1>
<h1 id="lel-2"><a class="markdownIt-Anchor" href="#lel-2">#</a> $.lel?</h1>\n`,
        )
    })

    it('should add anchors after', () => {
        expect(
            mdIt(
                `@[toc]
# 'Heading' ?
# $.lel!
# $.lel?
`,
                {
                    anchorLink: true,
                    anchorLinkBefore: false,
                },
            ),
        ).toBe(
            `<p></p>
<h1 id="heading">'Heading' ? <a class="markdownIt-Anchor" href="#heading">#</a></h1>
<h1 id="lel">$.lel! <a class="markdownIt-Anchor" href="#lel">#</a></h1>
<h1 id="lel-2">$.lel? <a class="markdownIt-Anchor" href="#lel-2">#</a></h1>\n`,
        )
    })

    it('should support GitHub style anchor link', () => {
        expect(
            mdIt(
                `@[toc]
# Heading`,
                {
                    anchorLink: true,
                    anchorClassName: 'anchor',
                    anchorLinkSymbol: '',
                    anchorLinkSymbolClassName: 'octicon octicon-link',
                    anchorLinkSpace: false,
                },
            ),
        ).toBe(
            `<p></p>
<h1 id="heading"><a class="anchor" href="#heading">`
            + '<span class="octicon octicon-link"></span></a>Heading</h1>\n',
        )
    })

    it('should support empty heading', () => {
        expect(
            mdIt(
                `@[toc]
# `,
                {},
            ),
        ).toBe(`<p></p>
<h1 id=""></h1>
`)
    })

    it('should handle not including default class in anchors when setting anchorClassName to null', () => {
        expect(
            mdIt(
                `@[toc]
  # Heading
  `,
                {
                    anchorLink: true,
                    anchorClassName: undefined,
                },
            ),
        ).toBe(`<p></p>
<h1 id="heading"><a href="#heading">#</a> Heading</h1>
`)
    })

    it('should support custom slugify function from readme', () => {
        expect(
            mdIt(
                `@[toc]
# test me i'm famous`,
                {
                    slugify: string => `/some/prefix/${string.replace(/([/ '])/g, '_')}`,
                },
            ),
        ).toBe(`<p></p>
<h1 id="/some/prefix/test_me_i_m_famous">test me i'm famous</h1>
`)
    })

    it('should support wrapping heading text in the anchor link', () => {
        expect(
            mdIt(
                `@[toc]

# Heading`,
                {
                    anchorLink: true,
                    wrapHeadingTextInAnchor: true,
                },
            ),
        ).toBe(
            `<p></p>
<h1 id="heading"><a class="markdownIt-Anchor" href="#heading">Heading</a></h1>\n`,
        )
    })

    it('should use prefix', () => {
        expect(
            mdIt(
                `
# Hello World
`,
                {
                    anchorLink: true,
                    anchorLinkPrefix: 'section-',
                },
            ),
        ).toBe(
            `<h1 id="section-hello-world"><a class="markdownIt-Anchor" href="#section-hello-world">#</a> Hello World</h1>\n`,
        )
    })
})
