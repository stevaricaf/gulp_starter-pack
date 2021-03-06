'use-stict';

// ---------- Initializing gulp dependencies ---------- //

let {
    src,
    dest,
    watch,
    series,
    parallel
}                   = require('gulp'),
    iconfont        = require('gulp-iconfont'),
    iconfontCss     = require('gulp-iconfont-css'),
    imagemin        = require('gulp-imagemin'),
    dustJs          = require('dustjs-linkedin'),
    dustHtml        = require('gulp-dust-html'),
    htmlBeautify    = require('gulp-html-beautify'),
    sass            = require('gulp-sass'),
    postcss         = require('gulp-postcss'),
    autoprefixer    = require('autoprefixer'),
    flexbugsFixes   = require('postcss-flexbugs-fixes'),
    cssnano         = require('cssnano'),
    sassLint        = require('gulp-sass-lint'),
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
    // Icons
    icons: {
        cfg:  'config/',
        dir:  'assets/icons/',
        dest: 'assets/fonts/dist/',
    },
    // Images
    imgs: {
        dir:  'assets/images/',
        dest: 'assets/images/dist/',
    },
    // HTML templates
    html: {
        dir:  'templates/pages/',
        dest: './'
    },
    // Styles
    styles: {
        dir:  'scss/',
        dest: 'src/css/',
    },
    // JavaScript
    js: {
        dir:  'js/',
        dest: 'src/js/'
    },
    // Production
    prod: {
        dirAssets:  'assets/',
        dirHtml: './',
        dirCss:  'src/css/dist/',
        dirJs:   'src/js/dist/',
        dest:    'public_prod/'
    }
};

// ---------- Error notification ---------- //

let errorNotification = {
    errorHandler: notify.onError({
        title: "Ops, you've made a mistake, find it...",
        message: 'Error: <%= error.message %>'
    })
};

// ---------- Iconfont task ---------- //

let runTimestamp = Math.round(Date.now()/1000);
let fontName = 'font-flat';

function iconfontTask() {
    return src(paths.icons.dir + '*.svg')
        .pipe(iconfontCss({
            // Name that the generated font will have
            fontName: fontName,
            // CSS class of fonts (example: class="font-svgName")
            cssClass: 'font',
            // Path to the template that will be used to create the SASS/LESS/SCSS/CSS file
            path: paths.icons.cfg + 'iconfont.scss',
            // Path where the file will be generated (relative to 'path.styles.dest')
            targetPath: '../../../' + paths.styles.dir + 'fonts/_iconfont.scss',
            // Path to the icon font file (relative to 'path.styles.dest')
            fontPath: '../../../' + paths.icons.dest
        }))
        .pipe(iconfont({
            // Name that the generated font will have
            fontName: fontName,
            // Recommended option (true)
            prependUnicode: true,
            // Font file formats that will be created
            formats: ['ttf', 'woff', 'woff2'],
            // Normalizing font width and height
            normalize: true,
            // Recommended to get consistent builds when watching files
            timestamp: runTimestamp
        }))
        .on('glyphs', function(glyphs, options) {
            // CSS templating, e.g.
            console.log(glyphs, options);
        })
        .pipe(dest(paths.icons.dest))
};

// ---------- Image minify task ---------- //

function imgminTask() {
    return src([paths.imgs.dir + '*', !paths.imgs.dest + '*'])
        .pipe(imagemin([
            imagemin.gifsicle({
                interlaced: true,
            }),
            imagemin.mozjpeg({
                quality: 75,
                progressive: true,
            }),
            imagemin.optipng({
                optimizationLevel: 5,
            }),
        ], {
            verbose: true,
        }))
        .pipe(dest(paths.imgs.dest))
}

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

// ---------- SASS copmpiler task ---------- //

let plugins = [
    autoprefixer({
        overrideBrowserslist: ['last 2 versions', 'ios >= 8']
    }),
    flexbugsFixes({
        bug4: true,
        bug6: true,
        bug81a: true
    }),
];

function stylesTask() {
    return src(paths.styles.dir + '**/*.s+(c|a)ss')
        .pipe(plumber(errorNotification))
        .pipe(sourcemaps.init())
        .pipe(sass({
            outputStyle: 'expanded',
            indentWidth: 4,
            precision: 3
        }))
        .pipe(postcss(plugins))
        .pipe(dest(paths.styles.dest))
        .pipe(rename({ 
            suffix: '.min'
        }))
        .pipe(postcss([
            cssnano
        ]))
        .pipe(sourcemaps.write('.'))
        .pipe(dest(paths.styles.dest + 'dist/'))
};

// ---------- Lint script task ---------- //

function sassLintTask() {
    return src(paths.styles.dir)
        .pipe(sassLint({
            config: '.sass-lint.yml'
        }))
        .pipe(sassLint.format())
        .pipe(sassLint.failOnError())
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
    return src(paths.js.dir + 'libs/**/*.js')
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
        .pipe(dest(paths.js.dest + 'dist/'))
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
    // Watch SCSS files
    watch([paths.styles.dir + '**/*.s+(c|a)ss'], stylesBuild);
    // Watch JS files
    watch([paths.js.dir + '**/*.js', !paths.js.dir + 'libs/**/*.js'], jsBuild);
};

// ---------- Production build ---------- //

function assetsProdTask() {
    return src(paths.prod.dirAssets + '**/*')
        .pipe(dest(paths.prod.dest + 'assets/'))
};

function htmlProdTask() {
    return src([
        paths.prod.dirHtml + '**/*.html',
        '!templates/**/*.html',
        '!node_modules/**/*.html'
    ])
        .pipe(dest(paths.prod.dest))
};

function stylesProdTask() {
    return src(paths.prod.dirCss + 'styles.min.css')
        .pipe(dest(paths.prod.dest + 'src/css/'))
};

function jsProdTask() {
    return src(paths.prod.dirJs + 'global.min.js')
        .pipe(dest(paths.prod.dest + 'src/js/'))
};

// ---------- Define complex tasks ---------- //

let stylesBuild = series(stylesTask, sassLintTask);
let jsBuild     = series(jsMainTask, jsLibsTask, jsMergeTask, jsCleanTask);
let devBuild    = series(parallel(htmlTask, stylesBuild, jsBuild), watchTask);
let prodBuild   = parallel(assetsProdTask, htmlProdTask, stylesProdTask, jsProdTask);

// ---------- Exports developer tasks ---------- //

exports.iconfont    = iconfontTask;
exports.imgmin      = imgminTask;
exports.html        = htmlTask;
exports.styles      = stylesTask;
exports.sassLint    = sassLintTask;
exports.jsMain      = jsMainTask;
exports.jsLibs      = jsLibsTask;
exports.jsMerge     = jsMergeTask;
exports.jsClean     = jsCleanTask;
exports.watch       = watchTask;
exports.stylesBuild = stylesBuild;
exports.jsBuild     = jsBuild;
exports.default     = devBuild;

// ---------- Exports production tasks ---------- //

exports.prodAssets  = assetsProdTask;
exports.prodHtml    = htmlProdTask;
exports.prodStyles  = stylesProdTask;
exports.prodJs      = jsProdTask;
exports.prodBuild   = prodBuild;
