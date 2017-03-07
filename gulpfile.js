var gulp = require("gulp");
var browserify = require("browserify");
var source = require('vinyl-source-stream');
var watchify = require("watchify");
var sourcemaps = require("gulp-sourcemaps");
var tsify = require("tsify");
var gutil = require("gulp-util");
var buffer = require("vinyl-buffer");

var tsc = require("gulp-typescript");

var paths = {
    pages: ['src/*.html']
};

function swallowError(error) {

    // If you want details of the error in the console
    console.log(error.toString())

    this.emit('end')
}

gulp.task("copy-html", function () {
    return gulp.src(paths.pages)
        .pipe(gulp.dest("dist"));
});

gulp.task("bundle", function () {

    var bundler = browserify({
        basedir: '.',
        debug: true,
        entries: ['src/ts/app.ts'],
        cache: {},
        packageCache: {}
    }).plugin(tsify);

    return bundler
        .bundle()
        .pipe(source('bundle.js'))
        .on('error', swallowError)
        .pipe(buffer())
        .pipe(sourcemaps.init({
            loadMaps: true
        }))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest("dist/"));
});

gulp.task('watch', function () {
    gulp.watch('src/**', ['default'])
});

gulp.task("default", ["copy-html", "bundle"]);