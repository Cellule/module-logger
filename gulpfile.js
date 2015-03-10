var gulp = require("gulp");
var babel = require("gulp-babel");
var del = require("del");
var jasmine = require("gulp-jasmine");
var git = require("gulp-git");

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

// build before removing src files
gulp.task("removeDev", ["build"], function(cb) {
  del(["src", "tests"], cb);
});

gulp.task("prepublish", ["removeDev", "cleanTests"], function(cb) {
  git.exec({args: "clean -d -fx -e node_modules"}, cb);
});

gulp.task("postpublish", function(cb) {
  git.exec({args: "checkout ."}, cb)
})

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
