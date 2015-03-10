var gulp = require("gulp");
var babel = require("gulp-babel");
var del = require("del");
var jasmine = require("gulp-jasmine");

gulp.task("clean", function(cb) {
  del(["dist"], cb);
});

gulp.task("build", ["clean"], function () {
  return gulp.src("src/**/*.js")
    .pipe(babel({
      modules: "commonStrict"
    }))
    .pipe(gulp.dest("dist"));
});

gulp.task("publish", ["build"], function() {

});

gulp.task("test", ["build"], function() {
  return gulp.src("spec/**/*.js")
    .pipe(jasmine());
});
