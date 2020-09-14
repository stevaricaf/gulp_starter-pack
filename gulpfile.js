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
    htmlBeautify    = require('gulp-html-beautify'),
    rename          = require('gulp-rename'),
    notify          = require('gulp-notify'),
    plumber         = require('gulp-plumber'),
    sourcemaps      = require('gulp-sourcemaps'),
    browserify      = require('browserify'),
    source          = require('vinyl-source-stream'),
    buffer          = require('vinyl-buffer'),
    babel           = require('gulp-babel'),
    concat          = require('gulp-concat'),
    uglify          = require('gulp-uglify-es').default,
    clean           = require('gulp-clean');

// ---------- Initializing file destinations ---------- //

let paths = {
    // HTML templates
    html: {
        dir: './templates/pages/',
        dest: './'
    },
    // JavaScript
    js: {
        dir: './js/',
        dest: './src/js/'
    }
};

// ---------- Error notification ---------- //

const errorNotification = {
    errorHandler: notify.onError({
        title: "Ops, you've made a mistake, find it...",
        message: 'Error: <%= error.message %>'
    })
};

// ---------- HTML templates task ---------- //

function htmlTask() {
    return src(paths.html.dir + '**/*.html')
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
        .pipe(dest(paths.html.dest))
};

// ---------- JavaScript tasks ---------- //

function jsMainTask() {
    return browserify(paths.js.dir + 'main.js').bundle()
        .pipe(source('main.js'))
        .pipe(buffer())
        .pipe(babel({
            compact: false,
            comments: false
        }))
        .pipe(dest(paths.js.dest))
};

function jsLibsTask() {
    return src(paths.js.dest + 'libs/**/*.js')
        .pipe(concat('libs.js'))
        .pipe(dest(paths.js.dest))
};

function jsMergeTask() {
    return src([paths.js.dest + 'libs.js', paths.js.dest + 'main.js'], { 
            allowEmpty: true 
        })
        .pipe(plumber(errorNotification))
        .pipe(sourcemaps.init())
        .pipe(concat('global.js'))
        .pipe(dest(paths.js.dest))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(uglify())
        .pipe(sourcemaps.write('.'))
        .pipe(dest(paths.js.dest + 'dist'))
};

function jsCleanTask() {
    return src([paths.js.dest + 'libs.js', paths.js.dest + 'main.js'], {
            allowEmpty: true,
            read: false
        })
        .pipe(clean())
};

// ---------- Define watch tasks ---------- //

function watchTask() {
    // Watch HTML files
    watch([paths.html.dir + '**/*.html', '!templates/*.html'], htmlTask);
    // Watch JS files
    watch([paths.js.dir + '**/*.js', !paths.js.dir + 'libs/**/*.js'], jsBuild);
};

// ---------- Define complex tasks ---------- //

let jsBuild     = series(jsMainTask, jsLibsTask, jsMergeTask, jsCleanTask);
let build       = series(parallel(htmlTask, jsBuild), watchTask);

// ---------- Exports tasks ---------- //

exports.html        = htmlTask;
exports.jsMain      = jsMainTask;
exports.jsLibs      = jsLibsTask;
exports.jsMerge     = jsMergeTask;
exports.jsClean     = jsCleanTask;
exports.watch       = watchTask;
exports.jsBuild     = jsBuild;
exports.default     = build;
