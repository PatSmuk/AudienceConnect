/* global process, __dirname */
var gulp = require('gulp'),
  nodemon = require('gulp-nodemon'),
  plumber = require('gulp-plumber'),
  livereload = require('gulp-livereload'),
  stylus = require('gulp-stylus'),
  mocha = require('gulp-mocha'),
  env = require('gulp-env'),
  gutil = require('gulp-util'),
  webpack = require('webpack');

gulp.task('stylus', function () {
    gulp.src('./public/css/*.styl')
        .pipe(plumber())
        .pipe(stylus())
        .pipe(gulp.dest('./public/css'))
        .pipe(livereload());
});

gulp.task('watch', function () {
    gulp.watch('./public/css/*.styl', ['stylus']);
});

gulp.task('develop', function () {
    livereload.listen();
    nodemon({
        script: 'bin/www',
        ext: 'js jade json',
        stdout: false
    }).on('readable', function () {
        this.stdout.on('data', function (chunk) {
            if(/^Express server listening on port/.test(chunk)){
                livereload.changed(__dirname);
            }
        });
        this.stdout.pipe(process.stdout);
        this.stderr.pipe(process.stderr);
    });
});

gulp.task('test', function () {
    env({ vars: {NODE_ENV: 'testing'} });

    return gulp.src('./test/**/*.js', {read: false})
               .pipe(mocha({reporter: 'spec'}))
               .on('end', function () { process.exit(); });
});

gulp.task('webpack', function (callback) {
    webpack({
        context: __dirname + '/webapp',
        entry: './main.jsx',
        output: {
            path: __dirname + '/public/js',
            filename: 'bundle.js'
        },
        module: {
            loaders: [
                {
                    test: /\.jsx?$/,
                    loader: 'babel-loader',
                    query: {
                        presets: ['es2015', 'react']
                    }
                }
            ]
        }
    }, function (err, stats) {
        if (err) throw new gutil.PluginError("webpack", err);
        gutil.log("[webpack]", stats.toString());
        callback();
    })
});

gulp.task('default', [
    'stylus',
    'develop',
    'watch'
]);
