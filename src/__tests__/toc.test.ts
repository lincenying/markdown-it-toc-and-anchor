import { describe, expect, it } from 'vitest'

import mdIt from './utils/md-it'

describe('markdown-it-toc-and-anchor toc', () => {
    it('should work with nothing', () => {
        expect(mdIt('', { toc: true })).toBe('')
    })

    it('should do nothing if not asked to', () => {
        expect(mdIt('@[toc]')).toBe('<p></p>\n')
    })

    it('should do nothing with no heading', () => {
        expect(mdIt('@[toc]', { toc: true })).toBe('<p></p>\n')
    })

    it('should work with soft breaks', () => {
        expect(
            mdIt(
                `test
@[toc]
# Heading`,
                {
                    toc: true,
                },
            ),
        ).toBe(`<p>test
<ul class="markdownIt-TOC">
<li><a href="#heading">Heading</a></li>
</ul>
</p>
<h1 id="heading">Heading</h1>\n`)
    })

    it('should work with line breaks after text before toc', () => {
        expect(
            mdIt(
                `**123**+
@[toc]`,
                { toc: true },
            ),
        ).toBe(`<p><strong>123</strong>+
</p>\n`)
    })

    it('should not generate toc with different tokens starting with @[', () => {
        expect(
            mdIt(
                `@[tac]
# Heading`,
                {
                    toc: true,
                },
            ),
        ).toBe(`<p>@[tac]</p>
<h1 id="heading">Heading</h1>\n`)
    })

    it('should work when there is a line break between @[toc] and next element in the same inline token', () => {
        expect(
            mdIt(
                `@[toc]
test
# Heading`,
                {
                    toc: true,
                },
            ),
        ).toBe(`<p><ul class="markdownIt-TOC">
<li><a href="#heading">Heading</a></li>
</ul>

test</p>
<h1 id="heading">Heading</h1>\n`)
    })

    it('should allow custom class', () => {
        expect(
            mdIt(
                `@[toc]
# Heading`,
                {
                    toc: true,
                    tocClassName: 'test',
                },
            ),
        ).toBe(`<p><ul class="test">
<li><a href="#heading">Heading</a></li>
</ul>
</p>
<h1 id="heading">Heading</h1>\n`)
    })

    it('should handle not including default class in anchors when setting tocClassName to null', () => {
        expect(
            mdIt(
                `@[toc]
# Heading`,
                {
                    toc: true,
                    tocClassName: undefined,
                },
            ),
        ).toBe(`<p><ul>
<li><a href="#heading">Heading</a></li>
</ul>
</p>
<h1 id="heading">Heading</h1>\n`)
    })

    it('should support unicode headings', () => {
        expect(
            mdIt(
                `@[toc]
# 新年快乐`,
                {
                    toc: true,
                },
            ),
        ).toBe(`<p><ul class="markdownIt-TOC">
<li><a href="#%E6%96%B0%E5%B9%B4%E5%BF%AB%E4%B9%90">新年快乐</a></li>
</ul>
</p>
<h1 id="新年快乐">新年快乐</h1>\n`)
    })

    it('should work when skipping first level', () => {
        expect(
            mdIt(
                `@[toc]
# Heading
## Two
### Three
# One`,
                {
                    toc: true,
                    tocFirstLevel: 2,
                },
            ),
        ).toBe(`<p><ul class="markdownIt-TOC">
<li><a href="#two">Two</a>
<ul>
<li><a href="#three">Three</a></li>
</ul>
</li>
</ul>
</p>
<h1 id="heading">Heading</h1>
<h2 id="two">Two</h2>
<h3 id="three">Three</h3>
<h1 id="one">One</h1>\n`)
    })

    it('should work when skipping last level', () => {
        expect(
            mdIt(
                `@[toc]
# Heading
## Two
### Three
# One`,
                {
                    toc: true,
                    tocLastLevel: 2,
                },
            ),
        ).toBe(`<p><ul class="markdownIt-TOC">
<li><a href="#heading">Heading</a>
<ul>
<li><a href="#two">Two</a></li>
</ul>
</li>
<li><a href="#one">One</a></li>
</ul>
</p>
<h1 id="heading">Heading</h1>
<h2 id="two">Two</h2>
<h3 id="three">Three</h3>
<h1 id="one">One</h1>\n`)
    })

    it('should work with smiliar levels and similar titles', () => {
        expect(
            mdIt(
                `@[toc]
# Heading
# Heading`,
                { toc: true },
            ),
        ).toBe(`<p><ul class="markdownIt-TOC">
<li><a href="#heading">Heading</a></li>
<li><a href="#heading-2">Heading</a></li>
</ul>
</p>
<h1 id="heading">Heading</h1>
<h1 id="heading-2">Heading</h1>\n`)
    })

    it('should work with special chars', () => {
        expect(
            mdIt(
                `@[toc]
# 'Heading' ?
# $.lel!
# $.lel?
`,
                { toc: true },
            ),
        ).toBe(`<p><ul class="markdownIt-TOC">
<li><a href="#heading">'Heading' ?</a></li>
<li><a href="#lel">$.lel!</a></li>
<li><a href="#lel-2">$.lel?</a></li>
</ul>
</p>
<h1 id="heading">'Heading' ?</h1>
<h1 id="lel">$.lel!</h1>
<h1 id="lel-2">$.lel?</h1>\n`)
    })

    it('should work when not starting with h1', () => {
        expect(
            mdIt(
                `@[toc]
### a
# b
`,
                { toc: true },
            ),
        ).toBe(`<p><ul class="markdownIt-TOC">
<li>
<ul>
<li>
<ul>
<li><a href="#a">a</a></li>
</ul>
</li>
</ul>
</li>
<li><a href="#b">b</a></li>
</ul>
</p>
<h3 id="a">a</h3>
<h1 id="b">b</h1>\n`)
    })

    it('should work with formatted text in headings', () => {
        expect(
            mdIt(
                `@[toc]
# [test](http://google.com)
## text [test](http://google.com)
## **text**
## *text*
## ~~text~~
`,
                { toc: true },
            ),
        ).toBe(`<p><ul class="markdownIt-TOC">
<li><a href="#test">test</a>
<ul>
<li><a href="#text-test">text test</a></li>
<li><a href="#text"><strong>text</strong></a></li>
<li><a href="#text-2"><em>text</em></a></li>
<li><a href="#text-3"><s>text</s></a></li>
</ul>
</li>
</ul>
</p>
<h1 id="test"><a href="http://google.com">test</a></h1>
<h2 id="text-test">text <a href="http://google.com">test</a></h2>
<h2 id="text"><strong>text</strong></h2>
<h2 id="text-2"><em>text</em></h2>
<h2 id="text-3"><s>text</s></h2>\n`)
    })

    it('should work', () => {
        expect(
            mdIt(
                `@[toc]
# Heading 1
## SubHeading
# Heading 2
### Deeper Heading`,
                { toc: true },
            ),
        ).toBe(`<p><ul class="markdownIt-TOC">
<li><a href="#heading-1">Heading 1</a>
<ul>
<li><a href="#subheading">SubHeading</a></li>
</ul>
</li>
<li><a href="#heading-2">Heading 2</a>
*
<ul>
<li><a href="#deeper-heading">Deeper Heading</a></li>
</ul>
</li>
</ul>
</p>
<h1 id="heading-1">Heading 1</h1>
<h2 id="subheading">SubHeading</h2>
<h1 id="heading-2">Heading 2</h1>
<h3 id="deeper-heading">Deeper Heading</h3>\n`)
    })

    it('should return the same anchor hrefs when resetIds is true', () => {
        expect(mdIt(['# Heading', '# Heading', '# Heading'], { resetIds: true })).toEqual([
            '<h1 id="heading">Heading</h1>\n',
            '<h1 id="heading">Heading</h1>\n',
            '<h1 id="heading">Heading</h1>\n',
        ])
    })

    it('should return different anchor hrefs when resetIds is false', () => {
        expect(mdIt(['# Heading', '# Heading', '# Heading'], { resetIds: false })).toEqual([
            '<h1 id="heading">Heading</h1>\n',
            '<h1 id="heading-2">Heading</h1>\n',
            '<h1 id="heading-3">Heading</h1>\n',
        ])
    })

    it('should return the same anchor hrefs when resetIds is true and toc is true', () => {
        expect(
            mdIt(
                [
                    `@[toc]
# Heading`,
                    `@[toc]
# Heading`,
                    `@[toc]
# Heading`,
                ],
                {
                    toc: true,
                    resetIds: true,
                },
            ),
        ).toEqual([
            `<p><ul class="markdownIt-TOC">
<li><a href="#heading">Heading</a></li>
</ul>
</p>
<h1 id="heading">Heading</h1>\n`,
            `<p><ul class="markdownIt-TOC">
<li><a href="#heading">Heading</a></li>
</ul>
</p>
<h1 id="heading">Heading</h1>\n`,
            `<p><ul class="markdownIt-TOC">
<li><a href="#heading">Heading</a></li>
</ul>
</p>
<h1 id="heading">Heading</h1>\n`,
        ])
    })

    it('should return different anchor hrefs when resetIds is false and toc is true', () => {
        expect(
            mdIt(
                [
                    `@[toc]
# Heading`,
                    `@[toc]
# Heading`,
                    `@[toc]
# Heading`,
                ],
                {
                    toc: true,
                    resetIds: false,
                },
            ),
        ).toEqual([
            `<p><ul class="markdownIt-TOC">
<li><a href="#heading">Heading</a></li>
</ul>
</p>
<h1 id="heading">Heading</h1>\n`,
            `<p><ul class="markdownIt-TOC">
<li><a href="#heading-2">Heading</a></li>
</ul>
</p>
<h1 id="heading-2">Heading</h1>\n`,
            `<p><ul class="markdownIt-TOC">
<li><a href="#heading-3">Heading</a></li>
</ul>
</p>
<h1 id="heading-3">Heading</h1>\n`,
        ])
    })
})
