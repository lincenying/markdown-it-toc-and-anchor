import { describe, expect, it } from 'vitest'

import mdIt from './utils/md-it'

describe('markdown-it-toc-and-anchor toc-callback', () => {
    it('should work with disabled toc insertion + callback, returning heading only', () => {
        const callback = (tocMarkdown: string, tocArray: unknown[], tocHtml: string) => {
            expect(tocMarkdown).toBe('* [Heading](#heading)\n')
            expect(tocArray).toEqual([
                {
                    content: 'Heading',
                    anchor: 'heading',
                    level: 1,
                },
            ])
            expect(tocHtml).toBe(`<ul class="markdownIt-TOC">
<li><a href="#heading">Heading</a></li>
</ul>\n`)
        }

        expect(
            mdIt('# Heading', {
                tocCallback: callback,
            }),
        ).toBe('<h1 id="heading">Heading</h1>\n')
    })

    it('should also work with callback, returning toc and heading', () => {
        const callback = (tocMarkdown: string, tocArray: unknown[], tocHtml: string) => {
            expect(tocMarkdown).toBe('* [Heading](#heading)\n')
            expect(tocArray).toEqual([
                {
                    content: 'Heading',
                    anchor: 'heading',
                    level: 1,
                },
            ])
            expect(tocHtml).toBe(`<ul class="markdownIt-TOC">
<li><a href="#heading">Heading</a></li>
</ul>\n`)
        }

        expect(
            mdIt(
                `@[toc]
# Heading`,
                {
                    toc: true,
                    tocCallback: callback,
                },
            ),
        ).toBe(`<p><ul class="markdownIt-TOC">
<li><a href="#heading">Heading</a></li>
</ul>
</p>
<h1 id="heading">Heading</h1>\n`)
    })

    it('should work with disabled toc insertion + callback in md options, returning heading only', () => {
        const callback = (tocMarkdown: string, tocArray: unknown[], tocHtml: string) => {
            expect(tocMarkdown).toBe('* [Heading](#heading)\n')
            expect(tocArray).toEqual([
                {
                    content: 'Heading',
                    anchor: 'heading',
                    level: 1,
                },
            ])
            expect(tocHtml).toBe(`<ul class="markdownIt-TOC">
<li><a href="#heading">Heading</a></li>
</ul>\n`)
        }

        expect(
            mdIt(
                '# Heading',
                {},
                {
                    tocCallback: callback,
                },
            ),
        ).toBe('<h1 id="heading">Heading</h1>\n')
    })

    it('should work with disabled toc insertion + callback in md render env, returning heading only', () => {
        const callback = (tocMarkdown: string, tocArray: unknown[], tocHtml: string) => {
            expect(tocMarkdown).toBe('* [Heading](#heading)\n')
            expect(tocArray).toEqual([
                {
                    content: 'Heading',
                    anchor: 'heading',
                    level: 1,
                },
            ])
            expect(tocHtml).toBe(`<ul class="markdownIt-TOC">
<li><a href="#heading">Heading</a></li>
</ul>\n`)
        }

        expect(
            mdIt(
                '# Heading',
                {},
                {},
                {
                    tocCallback: callback,
                },
            ),
        ).toBe('<h1 id="heading">Heading</h1>\n')
    })
})
