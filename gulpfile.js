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
    // HTML templates
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

// ---------- Define watch tasks ---------- //

function watchTask() {
    // Watch HTML files
    watch([paths.templates.dir + '**/*.html', '!templates/*.html'], htmlTask);
};

// ---------- Define complex tasks ---------- //

let build = series(htmlTask, watchTask);

// ---------- Exports tasks ---------- //

exports.html        = htmlTask;
exports.watch       = watchTask;
exports.default     = build;
