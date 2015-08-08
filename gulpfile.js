var gulp = require('gulp'),
    concat = require('gulp-concat');

gulp.task('concatenate-js', function () {
  return gulp.src(['public/bower_components/jquery/dist/jquery.min.js',
                   'public/bower_components/moment/min/moment.min.js',
                   'public/bower_components/angular/angular.min.js',
                   'public/bower_components/angular-animate/angular-animate.min.js',
                   'public/bower_components/angular-route/angular-route.min.js',
                   'public/bower_components/angular-touch/angular-touch.min.js',
                   'public/bower_components/angular-aria/angular-aria.min.js',
                   'public/bower_components/hammerjs/hammer.min.js',
                   'public/bower_components/angular-material/angular-material.min.js',
                   'public/bower_components/bootstrap/dist/js/bootstrap.min.js',
                   'public/bower_components/eonasdan-bootstrap-datetimepicker/build/js/bootstrap-datetimepicker.min.js',
                   'public/assets/angular/angular-progress.js',
                   'public/assets/angular/angular-auth.js',
                   'public/assets/angular/angular-toast.js',
                   'public/assets/angular/angular-dateTime.js',
                   'public/assets/js/app.js',
                   'public/assets/js/controllers/login.js',
                   'public/assets/js/controllers/fixtures.js',
                   'public/assets/js/controllers/fixture-new.js',
                   'public/assets/js/controllers/players.js',
                   'public/assets/js/controllers/season.js',
                   'public/assets/js/controllers/standings.js',
                   'public/assets/js/controllers/wall.js',
                   'public/assets/js/controllers/assets/js/script.js'
                   ])
    .pipe(concat('pepl.js'))
    .pipe(gulp.dest('public/dist/js'));
});

// 'default' is executed if no pram is passed to grunt
// [] is where we define task dependencies
gulp.task('default', [], function() {
  gulp.start('concatenate-js');
});
