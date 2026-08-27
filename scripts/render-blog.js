'use strict';
const fs = require('fs');
const upath = require('upath');
const pug = require('pug');
const sh = require('shelljs');
const prettier = require('prettier');
const matter = require('gray-matter');
const MarkdownIt = require('markdown-it');

const md = new MarkdownIt({ html: true, linkify: true, typographer: true });

const projectRoot = upath.resolve(upath.dirname(__filename), '..');
const srcRoot = upath.join(projectRoot, 'src');
const blogSrc = upath.join(srcRoot, 'blog');
const blogDest = upath.join(projectRoot, 'dist/blog');
const postTemplate = upath.join(srcRoot, 'pug/layouts/blog-post.pug');
const indexTemplate = upath.join(srcRoot, 'pug/layouts/blog-index.pug');

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
});

// Known post categories, in display order. Posts without a valid one fall back to MISC.
const CATEGORIES = ['MATH', 'DEV', 'AI', 'MISC'];

function getPosts() {
    if (!sh.test('-d', blogSrc)) {
        return [];
    }

    const mdFiles = sh
        .find(blogSrc)
        .filter((p) => p.match(/\.md$/));

    return mdFiles
        .map((filePath) => _parsePost(filePath))
        .filter(Boolean)
        .sort((a, b) => b.date - a.date);
}

function renderBlog() {
    if (!sh.test('-d', blogSrc)) {
        console.log(`### INFO: No blog source directory at ${blogSrc} — skipping blog build`);
        return;
    }

    if (!sh.test('-d', blogDest)) {
        sh.mkdir('-p', blogDest);
    }

    const posts = getPosts();

    const slugs = new Set();
    for (const post of posts) {
        if (slugs.has(post.slug)) {
            throw new Error(`### ERROR: Duplicate blog slug "${post.slug}". Rename one of the source files.`);
        }
        slugs.add(post.slug);

        const destPath = upath.join(blogDest, `${post.slug}.html`);
        const html = pug.renderFile(postTemplate, {
            doctype: 'html',
            filename: postTemplate,
            basedir: upath.join(srcRoot, 'pug'),
            baseUrl: '../',
            brand: '← HOME',
            pageTitle: `${post.title} · Gregor Ehrensperger`,
            title: post.title,
            dateIso: post.dateIso,
            dateFormatted: post.dateFormatted,
            categories: post.categories,
            contentHtml: post.contentHtml
        });
        fs.writeFileSync(destPath, _prettify(html));
        console.log(`### INFO: Rendered blog post ${post.slug} → ${destPath}`);
    }

    const indexHtml = pug.renderFile(indexTemplate, {
        doctype: 'html',
        filename: indexTemplate,
        basedir: upath.join(srcRoot, 'pug'),
        baseUrl: '../',
        brand: '← HOME',
        pageTitle: 'Blog · Gregor Ehrensperger',
        categories: CATEGORIES.filter((c) => posts.some((p) => p.categories.includes(c))),
        posts: posts.map((p) => ({
            slug: p.slug,
            title: p.title,
            dateIso: p.dateIso,
            dateFormatted: p.dateFormatted,
            excerpt: p.excerpt,
            categories: p.categories
        }))
    });
    const indexDest = upath.join(blogDest, 'index.html');
    fs.writeFileSync(indexDest, _prettify(indexHtml));
    console.log(`### INFO: Rendered blog index → ${indexDest} (${posts.length} post${posts.length === 1 ? '' : 's'})`);
}

module.exports = renderBlog;
module.exports.getPosts = getPosts;

function _parsePost(filePath) {
    const raw = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(raw);
    const fileBase = upath.basename(filePath, '.md');

    const dateValue = data.date instanceof Date
        ? data.date
        : (data.date ? new Date(data.date) : _dateFromFilename(fileBase));

    if (!dateValue || isNaN(dateValue.getTime())) {
        console.warn(`### WARN: Skipping ${filePath} — missing or invalid date (use YAML frontmatter "date: YYYY-MM-DD" or a YYYY-MM-DD- filename prefix)`);
        return null;
    }

    if (!data.title) {
        console.warn(`### WARN: Skipping ${filePath} — missing "title" in frontmatter`);
        return null;
    }

    const slug = data.slug || fileBase.replace(/^\d{4}-\d{2}-\d{2}-?/, '');
    if (!slug) {
        console.warn(`### WARN: Skipping ${filePath} — could not derive slug`);
        return null;
    }

    return {
        slug,
        title: data.title,
        excerpt: data.excerpt || '',
        date: dateValue,
        dateIso: dateValue.toISOString().slice(0, 10),
        dateFormatted: dateFormatter.format(dateValue),
        categories: _parseCategories(data.categories, filePath),
        contentHtml: md.render(content)
    };
}

function _parseCategories(value, filePath) {
    const given = (Array.isArray(value) ? value : [value])
        .filter(Boolean)
        .map((c) => String(c).trim().toUpperCase());

    const unknown = given.filter((c) => !CATEGORIES.includes(c));
    if (unknown.length) {
        console.warn(`### WARN: ${filePath} — unknown categories ${unknown.join(', ')} (known: ${CATEGORIES.join(', ')})`);
    }

    // Filtering CATEGORIES also dedupes and puts them in display order.
    const known = CATEGORIES.filter((c) => given.includes(c));
    return known.length ? known : ['MISC'];
}

function _dateFromFilename(fileBase) {
    const match = fileBase.match(/^(\d{4}-\d{2}-\d{2})/);
    return match ? new Date(match[1]) : null;
}

function _prettify(html) {
    return prettier.format(html, {
        printWidth: 1000,
        tabWidth: 4,
        singleQuote: true,
        proseWrap: 'preserve',
        endOfLine: 'lf',
        parser: 'html',
        htmlWhitespaceSensitivity: 'ignore'
    });
}
