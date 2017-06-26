/**
 * Created by kellenren on 2016/7/13.
 */
var gulp = require('gulp');
var concat = require("gulp-concat");
var minify = require('gulp-minify');

gulp.task("js",function(){
    gulp.src(['./lib/*.js','./src/*.js'])
        .pipe(concat("viewer.js"))
        .pipe(minify({
            ext:{
                src:'.js',
                min:'.min.js'
            }
        }))
        .pipe(gulp.dest("./dist"));
    
})

gulp.task('css',function(){
    gulp.src('./src/*.css')
        .pipe(gulp.dest('./dist'))
})

gulp.task("default",["js","css"]);