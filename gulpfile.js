var gulp = require("gulp");
var babel = require("gulp-babel");
var del = require("del");
var jasmine = require("gulp-jasmine");

function convert6to5() {
  return babel({
    modules: "commonStrict"
  });
}

gulp.task("clean", function(cb) {
  del(["dist"], cb);
});

gulp.task("build", ["clean"], function () {
  return gulp.src("src/**/*.js")
    .pipe(convert6to5())
    .pipe(gulp.dest("dist"));
});

gulp.task("publish", ["build"], function() {

});


// Testing tasks
var convertedTestsFolder = "__build_tests__";
gulp.task("cleanTests", function(cb) {
  del([convertedTestsFolder], cb);
});

gulp.task("test", ["build", "cleanTests"], function() {
  return gulp.src("tests/**/*.js")
    .pipe(convert6to5())
    .pipe(gulp.dest(convertedTestsFolder))
    .pipe(jasmine());
});
