'use-stict';

// ---------- Initializing gulp dependencies ---------- //

let {
    src,
    dest,
    watch,
    series,
    parallel
}                   = require('gulp'),
    dustJs          = require('dustjs-linkedin'),
    dustHtml        = require('gulp-dust-html'),
    htmlBeautify    = require('gulp-html-beautify');

// ---------- Initializing file destinations ---------- //

let paths = {
    // Html templates
    templates: {
        dir: './templates/pages/',
        dest: './'
    }
};

// ---------- HTML templates task ---------- //

function htmlTask() {
    return src(paths.templates.dir + '**/*.html')
        .pipe(dustHtml({
            basePath: 'templates',
            data: {},
            whitespace: true,
            defaultExt: '.html',
            config: {
                cache: false
            }
        }))
        .pipe(htmlBeautify({
            indent_size: 4,
            indent_char: '',
            indent_with_tabs: true,
            preserve_newlines: false,
            end_with_newline: false
        }))
        .pipe(dest(paths.templates.dest))
};

// ---------- Define complex tasks ---------- //

let build = htmlTask;

// ---------- Exports tasks ---------- //

exports.html        = htmlTask;
exports.default     = build;
