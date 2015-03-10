var gulp = require("gulp");
var babel = require("gulp-babel");
var del = require("del");

gulp.task("clean", function(cb) {
  del(["dist"], cb);
});

gulp.task("build", function () {
  return gulp.src("src/**/*.js")
    .pipe(babel({
      modules: "commonStrict"
    }))
    .pipe(gulp.dest("dist"));
});

gulp.task("publish", ["build"], function() {

});
