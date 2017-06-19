var gulp = require('gulp');
var nodemon = require('gulp-nodemon');
var sass = require('gulp-sass');
var useref = require('gulp-useref');
var uglify = require('gulp-uglify');
var watch = require('gulp-watch');
var gulp_if = require('gulp-if');
var cssnano = require('gulp-cssnano');
var imagemin = require('gulp-imagemin');
var runSequence = require('run-sequence');
var jshint = require('gulp-jshint');
var csslint = require('gulp-csslint');
var del = require('del');
var gutil = require('gulp-util');
var header = require('gulp-header');
//var env = process.env.NODE_ENV || 'development';
var Server = require('karma').Server;
var jasmineNode = require('gulp-jasmine-node');
var pump = require('pump');
var concat = require('gulp-concat');
var autoprefixer = require('autoprefixer');
var postcss      = require('gulp-postcss');
//var browserSync = require('browser-sync').create();
//var reload = browserSync.reload;
var replace = require('gulp-replace');
var sourcemaps = require('gulp-sourcemaps');
var gulp_config = require('./gulp_config/init.js');

var source = require('vinyl-source-stream');
//var browserify = require('browserify');
const babel = require('gulp-babel');

var ROOT_DIR = 'app';
var DEV_DIR = 'public';
var DIST_DIR = 'public/dist';

//task for nodemon
gulp.task('nodemon', function () {
    //var running = false;
    nodemon({
        script: 'app.js',
        ext:'js scss',
        tasks:['css']
    })
});

var serverPaths = {
    scripts: ['config/*.js',
        'config/**/*.json',
        'app/**/*.js*',
        'app/**/*.hbs*',
        'app.js']
};

var clientPaths = {
    styleScss: './public/assets/css/prohivescss/main.scss',
    styleCss: './public/assets/css/prohivecss/main.css',
    customJS: './public/assets/**/*.js',
    serviceWorker: './public/progresshive-sw.js',
    lib: './public/lib/*.js',
    manifest: 'public/manifest.json',
    progresshiveLib: './public/widely.js',
    progresshiveLibDeploy: './public/progresshive-deploy.js',
    images: './public/resource/image/**/*.+(png|jpg|jpeg|gif|svg)',
    favicon: './public/resource/favicon/*.+(png|ico|json|xml)',
    genServiceWorker: './public/progresshive-sw.js'
};
var swPaths = {
    styleScss: 'assets/css/prohivescss/main.scss',
    styleCss: 'assets/css/prohivecss/*.css',
    customJS: 'assets/**/*.js',
    serviceWorker: 'progresshive-sw.js',
    lib: 'lib/*.js',
    manifest: 'manifest.json',
    progresshiveLib: 'public/widely.js',
    images: 'resource/image/**/*.+(png|jpg|jpeg|gif|svg)',
    favicon: 'resource/favicon/*.+(png|ico|json|xml)',
    genServiceWorker: 'progresshive-sw.js'
};
var dashboardPaths = {
    styleCss: 'public/tool/css/*.css'
};
/**
 * Watch custom files
 */
// gulp.task('watch', function() {
//     if(process.env.NODE_ENV == 'development'){
//         gulp.watch([clientPaths.styleScss], ['sass']);
//     } 
// });

/**
 * Live reload server
 */
// gulp.task('webserver', function() {
//     connect.server({
//         root: 'dist',
//         livereload: true,
//         port: 8888
//     });
// });

// gulp.task('livereload', function() {
//     gulp.src(['dist/**/*.*'])
//         .pipe(watch(['dist/**/*.*']))
//         .pipe(connect.reload());
// });

gulp.task('css',function(){
    runSequence('sass','autoprefixer');
})

//task to compile scss into css
gulp.task('sass', function () {
    return gulp.src(clientPaths.styleScss)
        .pipe(sass())
        .pipe(gulp.dest('./public/assets/css/prohivecss'))
});

gulp.task('autoprefixer', function () {
    return gulp.src(clientPaths.styleCss)
        .pipe(postcss([ autoprefixer({ browsers: ['last 2 versions','Safari > 5','Explorer >6'] }) ]))
        .pipe(gulp.dest('./public/assets/css/prohivecss'));
});

//task for js-lint
gulp.task('jshint', function () {
    return gulp.src(clientPaths.customJS)
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
});

//task for css-lint 
gulp.task('css-lint', function () {
    gulp.src(clientPaths.styleCss)
        .pipe(csslint())
        .pipe(csslint.reporter())
});

//task for optimizing css 
gulp.task('cssnano', function () {
    return gulp.src(clientPaths.styleCss)
        .pipe(concat({ path: 'main.min.css' }))
        .pipe(cssnano())
        .pipe(gulp.dest('./public/dist/css'));
});


//task for optimizing js
gulp.task('uglify', function () {

    pump([
        gulp.src(clientPaths.customJS),
        concat({ path: 'main.min.js' }),
        gulp_if(process.env.NODE_ENV === 'production', replace("'https://luminous-torch-2375.firebaseio.com/'", "'https://progresshive.firebaseio.com/'")),
        uglify({
            compress: {
                drop_console: true
            }
        }),
        gulp.dest('./public/dist/js'),
    ]
    );
    pump([
        gulp.src(clientPaths.serviceWorker),
        concat({ path: 'progresshive-sw.js' }),
        gulp_if(process.env.NODE_ENV === 'production', replace("firebase_url : 'https://luminous-torch-2375.firebaseio.com/'", "firebase_url : 'https://progresshive.firebaseio.com/'")),
        gulp.dest('./public/dist')
    ]
    );
    pump([
        gulp.src(clientPaths.progresshiveLibDeploy),
        concat({ path: 'progresshive-deploy.js' }),
        gulp.dest('./public/dist')
    ]
    );
    pump([
        gulp.src(clientPaths.lib),
        concat({ path: 'lib.min.js' }),
        uglify({
            compress: {
                drop_console: true
            }
        }),
        gulp.dest('./public/dist/lib'),
    ]
    );
    pump([
        gulp.src(clientPaths.manifest),
        concat({ path: 'manifest.json' }),
        gulp.dest('./public/dist'),
    ]
    );
});


gulp.task('uglify-stg', function () {

    pump([
        gulp.src(clientPaths.customJS),
        concat({ path: 'main.min.js' }),
        gulp_if(process.env.NODE_ENV === 'staging', replace('https://luminous-torch-2375.firebaseio.com/', 'https://progresshive-stg.firebaseio.com/')),
        uglify({
            compress: {
                drop_console: true
            }
        }),
        gulp.dest('./public/dist/js'),
    ]
    );
    pump([
        gulp.src(clientPaths.serviceWorker),
        concat({ path: 'progresshive-sw.js' }),
        gulp_if(process.env.NODE_ENV === 'staging', replace("firebase_url : 'https://luminous-torch-2375.firebaseio.com/'", "firebase_url : 'https://progresshive-stg.firebaseio.com/'")),
        gulp.dest('./public/dist')
    ]
    );
    pump([
        gulp.src(clientPaths.progresshiveLibDeploy),
        concat({ path: 'progresshive-deploy.js' }),
        gulp.dest('./public/dist')
    ]
    );
    pump([
        gulp.src(clientPaths.lib),
        concat({ path: 'lib.min.js' }),
        uglify({
            compress: {
                drop_console: true
            }
        }),
        gulp.dest('./public/dist/lib'),
    ]
    );
    pump([
        gulp.src(clientPaths.manifest),
        concat({ path: 'manifest.json' }),
        gulp.dest('./public/dist'),
    ]
    );
});

// gulp.task('useref', function() {
//     return gulp.src('app/views/layouts/main.hbs')
//     .pipe(useref({
//             searchPath: 'public'
//         }))
//     // Minifies only if it's a JavaScript file
//     .pipe(gulp_if('*.js',uglify()))
//     // Minifies only if it's a CSS file 
//     .pipe(gulp_if('*.css', cssnano()))
//     .pipe(gulp.dest('./public/dist'))
// });

//task to minify images
gulp.task('images', ['copy-fav'], function () {
    return gulp.src(clientPaths.images)
        .pipe(gulp.dest('./public/dist/resource/image'))
});

//task to copy favicons
gulp.task('copy-fav', function () {
    return gulp.src(clientPaths.favicon)
        .pipe(gulp.dest('./public/dist/resource/favicon'))
});

//task to clean the dist dir
gulp.task('clean:dist', function () {
    return del.sync('./public/dist')
});

//tasks for setting environments
gulp.task('set-dev-node-env', function () {
    return process.env.NODE_ENV = 'development';
});

gulp.task('set-test-node-env', function () {
    return process.env.NODE_ENV = 'testing';
});
gulp.task('set-stage-node-env', function () {
    return process.env.NODE_ENV = 'staging';
});
gulp.task('set-prod-node-env', function () {
    return process.env.NODE_ENV = 'production';
});

// task for sw-precache
function writeServiceWorkerFile(clientDir, handleFetch, callback)  {
    var path = require('path');
    var swPrecache = require('@kapoorji/test-bundle');

    var config = {
        cacheId: "progresshive-cache",
        handleFetch: handleFetch,
        updateHandler: true,
        runtimeCaching: [
            // {
            //     urlPattern: /\/tool\/#\//,
            //     handler: 'cacheFirst',
            //     options: {
            //         cache: {
            //             maxEntries: 2,
            //             name: 'tool-cache'
            //         }
            //     }
            // },
            // {
            //     urlPattern: /.*/,
            //     handler:'networkFirst',
            //     options: {
            //         cache:{
            //             name:'plugIn-cache',
            //             maxAgeSeconds: 60*60*24*7
            //         }
            //     }
            // },
            {
                urlPattern: /pricing/,
                handler: 'networkFirst',
                options: {
                    cache: {
                        maxEntries: 1,
                        name: 'pricing-cache',
                        maxAgeSeconds: 60 * 60 * 24 * 7
                    }
                }
            },
            {
                urlPattern: /inquire/,
                handler: 'networkFirst',
                options: {
                    cache: {
                        maxEntries: 1,
                        name: 'inquire-cache',
                        maxAgeSeconds: 60 * 60 * 24 * 7
                    }
                }
            },
        ],
        importScripts: [
            'https://cdn.firebase.com/js/client/2.4.2/firebase.js'
        ],
        staticFileGlobs: [
            '/',
            '/offline',
            clientDir + '/assets/css/prohivecss/main.css',
            clientDir + '/assets/js/app.js',
          //  clientDir + '/progresshive.js',
            clientDir + '/assets/js/inquire.js',
            clientDir + '/resource/image/*/*',
            clientDir + '/resource/image/*',
            clientDir + '/resource/favicon/*',
            clientDir + '/lib/*'
        ],
         stripPrefix: clientDir + '/',
        verbose: true,
         dynamicUrlToDependencies: {
            '/': [
                path.join(ROOT_DIR, 'views/layouts', 'main.hbs'),
                path.join(ROOT_DIR, 'views', 'index.hbs')
            ],
            '/offline': [
                path.join(ROOT_DIR, 'views/layouts', 'main.hbs'),
                path.join(ROOT_DIR, 'views', 'offline.hbs')
            ],
        //     '/inquire': [
        //         path.join(ROOT_DIR, 'views/layouts', 'main.hbs'),
        //         path.join(ROOT_DIR, 'views/layouts', 'inquire.hbs')
        //     ],
        //     '/tool/': [
        //         path.join(clientDir, 'tool','controllers/client.login.js'),
        //         path.join(clientDir, 'tool', 'controllers/client.campaign.detail.js'),
        //         path.join(clientDir, 'tool','controllers/client.campaign.modal.js'),
        //         path.join(clientDir, 'tool','controllers/client.dashboard.js'),
        //         path.join(clientDir, 'tool','controllers/client.send.push.notification.js'),
        //         path.join(clientDir, 'tool','controllers/client.service.campaign.js'),
        //         path.join(clientDir, 'tool','controllers/client.show.campaign.js'),
        //         path.join(clientDir, 'tool','controllers/client.register.controller.js'),
        //         path.join(clientDir, 'tool','controllers/client.headbar.controller.js'),
        //         path.join(clientDir, 'tool','controllers/client.segment.controller.js'),
        //         path.join(clientDir, 'tool','controllers/client.user.controller.js'),
        //         path.join(clientDir, 'tool','controllers/client.app.setting.controller.js'),
        //         path.join(clientDir, 'tool','controllers/client.welcome.controller.js'),
        //         path.join(clientDir, 'tool','controllers/client.sent.controller.js'),
        //         path.join(clientDir, 'tool','controllers/client.ab.test.controller.js'),
        //         path.join(clientDir, 'tool','controllers/client.show.ab.controller.js'),
        //         path.join(clientDir, 'tool','controllers/client.reset.password.controller.js'),
        //         path.join(clientDir, 'tool/controllers/client.invite.users.controller.js'),
        //         path.join(clientDir, 'tool/controllers/client.register.admin.controller.js'),
        //         path.join(clientDir, 'tool/controllers/client.plans.controller.js'),
        //         path.join(clientDir, 'tool/controllers/client.user.insight.controller.js'),
        //         path.join(clientDir, 'tool/controllers/client.plan.usage.controller.js'),
        //         path.join(clientDir, 'tool/controllers/client.plans.modal.js'),
        //         path.join(clientDir, 'tool/controllers/client.deactivatedUser.controller.js'),
        //         path.join(clientDir, 'tool/controllers/client.deactivatedUserHeader.controller.js'),
        //         path.join(clientDir, 'tool/controllers/client.delete.campaign.modal.controller.js'),
        //         path.join(clientDir, 'tool/controllers/client.invited.modal.controller.js'),
        //         path.join(clientDir, 'tool/controllers/client.deactivateAcc.modal.controller.js'),

        //         path.join(clientDir, 'tool/directives/loading.js'),
        //         path.join(clientDir, 'tool/directives/widget.js'),
        //         path.join(clientDir, 'tool/directives/widget-body.js'),
        //         path.join(clientDir, 'tool/directives/widget-footer.js'),
        //         path.join(clientDir, 'tool/directives/widget-header.js'),


        //         path.join(clientDir, 'tool', 'module.js'),
        //         path.join(clientDir, 'tool', 'config/routes.js'),
        //         path.join(clientDir, 'tool', 'css/rdash.css'),
        //         path.join(clientDir, 'tool', 'services/client.render.message.js'),

        //         path.join(clientDir, 'tool', 'assets/lib/js/isteven-multi-select.js'),
        //         path.join(clientDir, 'tool', 'assets/lib/js/Blob.js'),
        //         path.join(clientDir, 'tool', 'services/client.render.message.js'),
        //         path.join(clientDir, 'tool', 'services/client.render.message.js'),

        //         path.join(ROOT_DIR, 'views', 'tool.hbs'),

        //    ]

        },

        // navigateFallback: '/offline',
        // navigateFallbackWhitelist: [/pricing/]
    }
    del.sync(path.join(clientDir,swPaths.genServiceWorker));
    swPrecache.write(path.join(clientDir,swPaths.genServiceWorker), config, callback);
};

//task for running the test once
gulp.task('test', function (done) {
    new Server({
        configFile: __dirname + '/karma.conf.js',
        singleRun: true
    }, done).start();
});

// task for watching for file changes and re-run tests on each change
gulp.task('tdd', function (done) {
    new Server({
        configFile: __dirname + '/karma.conf.js'
    }, done).start();
});

//task for jasmine-node-karma
gulp.task('jasmineNode', function () {
    return gulp.src(['spec/**/*Spec.js']).pipe(jasmineNode({
        timeout: 10000
    }));
});

// tasks for service worker

gulp.task('generate-service-worker-dev', function (callback) {
        
      writeServiceWorkerFile(DEV_DIR, true, callback);
});

gulp.task('generate-service-worker-dist', function (callback) {
      writeServiceWorkerFile(DIST_DIR, true, callback);
});

//tasks for development env.
gulp.task('build-dev', function () {
    console.log('Building Files for development environment')
    runSequence('set-dev-node-env', 'sass', ['css-lint', 'jshint'])
});

gulp.task('run-dev', function () {
    console.log('Running in development environment')
    runSequence('set-dev-node-env','sass','autoprefixer', 'nodemon')
});

//tasks for testing env.
gulp.task('build-test', function () {
    console.log('Building Files for testing environment')
    runSequence('set-test-node-env', 'jasmineNode')
});

gulp.task('run-test', function () {
    console.log('Running in testing environment')
    runSequence('set-test-node-env', 'nodemon', 'jasmineNode')
});

//tasks for staging env.
gulp.task('build-stage', function () {
    console.log('Building Files for staging environment');
    runSequence('set-stage-node-env', 'clean:dist', 'sass','autoprefixer', 'cssnano', 'uglify-stg','uglifyController' ,'images',  'copyHtmlDash', 'copyBower', 'copySupport', 'copyProgresshiveJs', 'initialize-files','copyProgresshiveJs');
});

gulp.task('run-stage', function () {
    console.log('Running in staging environment');
    runSequence('set-stage-node-env', 'clean:dist', 'sass','autoprefixer', 'cssnano', 'uglify-stg', 'uglifyController' ,'images', 'copyHtmlDash', 'copyBower', 'copyProgresshiveJs', 'copySupport', 'initialize-files','copyProgresshiveJs', 'nodemon');
});

//tasks for production env.
gulp.task('build-prod', function () {
    console.log('Building Files for production environment');
    runSequence('set-prod-node-env', 'clean:dist', 'sass','autoprefixer', 'cssnano', 'uglify', 'uglifyController', 'images', 'copyHtmlDash', 'copyBower', 'copySupport', 'initialize-files');
});

gulp.task('run-prod', function () {
    console.log('Running in production environment'); 
    runSequence('set-prod-node-env', 'clean:dist', 'sass','autoprefixer', 'cssnano', 'uglify', 'uglifyController' ,'images', 'nodemon', 'copyHtmlDash', 'copyBower', 'copySupport','initialize-files');
});

// gulp.task('default', function(callback) {
//     console.log('Building Files for '+process.env.NODE_ENV+' environment')
//     if(process.env.NODE_ENV=='development')
//     runSequence('nodemon', 'sass', ['css-lint', 'jshint', 'watch'], callback)

//     else if(process.env.NODE_ENV=='testing')
//     runSequence('nodemon', 'sass', ['css-lint', 'jshint', 'jasmineNode', 'watch-test'], callback)

//     else if(process.env.NODE_ENV=='production')
//     runSequence('clean:dist', 'nodemon', ['sass', 'jshint', 'css-lint', 'cssnano', 'uglify', 'images'], callback)

// });

//tasks for dashboard




gulp.task('cssnanoDash', function () {
    return gulp.src(dashboardPaths.styleCss)
        .pipe(concat({ path: 'mainDash.min.css' }))
        .pipe(postcss([ autoprefixer({ browsers: ['last 2 versions','Safari > 5','Explorer >6'] }) ]))
        .pipe(cssnano())
        .pipe(gulp.dest('./public/dist/tool/css'));
});

// gulp.task('cssnanoDashLib', function(){
//     return gulp.src('public/tool/lib/angular-chart.js/dist/angular-chart.min.css')
//     .pipe(concat({ path: 'angular-chart.min.css'}))
//     .pipe(cssnano())
//     .pipe(gulp.dest('./public/dist/tool/lib/angular-chart.js/dist'));
// });

gulp.task('uglifyDash', function () {

    // pump([
    //     gulp.src('public/tool/controllers/**/*.js'),
    //     concat({ path: 'controllers.min.js' }),
    //      uglify({
    //         compress: {
    //             drop_console: true
    //         }
    //     }),
    //     gulp.dest('./public/dist/tool/controllers/')
    // ]
    // );

    pump([
        gulp.src('public/tool/module.js'),
        concat({ path: 'module.min.js' }),
        gulp_if(process.env.NODE_ENV === 'production', replace('firebase_url: "https://luminous-torch-2375.firebaseio.com/"', 'firebase_url:"https://progresshive.firebaseio.com/"')),
         gulp_if(process.env.NODE_ENV === 'staging', replace('firebase_url: "https://luminous-torch-2375.firebaseio.com/"', 'firebase_url:"https://progresshive-stg.firebaseio.com/"')),
        uglify({
            compress: {
                drop_console: true
            }
        }),
        gulp.dest('./public/dist/tool')
    ]
    );
    pump([
        gulp.src('public/tool/assets/js/*.js'),
        concat({ path: 'custom.min.js' }),
        uglify({
            compress: {
                drop_console: true
            }
        }),
        gulp.dest('./public/dist/tool/assets/js')
    ]
    );
    pump([
        gulp.src('public/tool/assets/lib/js/isteven-multi-select.js'),
        concat({ path: 'isteven-multi-select.min.js' }),
        uglify({
            compress: {
                drop_console: true
            }
        }),
        gulp.dest('./public/dist/tool/assets/lib/js')
    ]
    );
    pump([
        gulp.src('public/tool/assets/lib/js/Blob.js'),
        concat({ path: 'Blob.min.js' }),
        uglify({
            compress: {
                drop_console: true
            }
        }),
        gulp.dest('./public/dist/tool/assets/lib/js')
    ]
    );
    pump([
        gulp.src('public/tool/config/*.js'),
        concat({ path: 'routes.min.js' }),
        // replace("templateUrl: 'views/register.html'", "templateUrl: 'views/tempRegister.html'"),
        uglify({
            compress: {
                drop_console: true
            }
        }),
        gulp.dest('./public/dist/tool/config')
    ]
    );
    pump([
        gulp.src('public/tool/data/message.json'),
        concat({ path: 'message.json' }),
        gulp.dest('./public/dist/tool/data')
    ]
    );
    pump([
        gulp.src('public/tool/data/tooltip.json'),
        concat({ path: 'tooltip.json' }),
        gulp.dest('./public/dist/tool/data')
    ]
    );
     pump([
        gulp.src('public/tool/data/segmentImpressionData.json'),
        concat({ path: 'segmentImpressionData.json' }),
        gulp.dest('./public/dist/tool/data')
    ]
    );
     pump([
        gulp.src('public/tool/data/states.json'),
        concat({ path: 'states.json' }),
        gulp.dest('./public/dist/tool/data')
    ]
    );
    pump([
        gulp.src('public/tool/directives/*.js'),
        concat({ path: 'directives.min.js' }),
        uglify({
            compress: {
                drop_console: true
            }
        }),
        gulp.dest('./public/dist/tool/directives/')
    ]
    );
    pump([
        gulp.src('public/tool/services/*.js'),
        concat({ path: 'services.min.js' }),
        //  uglify({
        //     // compress: {
        //     //     drop_console: true
        //     // }
        // }),
        gulp.dest('./public/dist/tool/services/')
    ]
    );
});

// gulp.task('strip', function() {
// //var browserify = require("browserify") 
//   var fs = require("fs")

// var b = browserify("./public/progresshive.js")
// b.transform("stripify")

// b.bundle().pipe(fs.createWriteStream("bundle.js"))

// });

gulp.task('build', function() {

  var license = '/* \n @license Widely v1.0.6 \n\n Terms: https://widely.io/terms-of-use \n\n */\n';  
  var jsFiles = './public/widely.js',  
    jsDest = './build';

    return gulp.src(jsFiles)
            .pipe(sourcemaps.init({loadMaps: true}))
            .pipe(concat('widely.js'))
            .pipe(uglify({
            compress: {
                drop_console: true
            }}))
            .pipe(header(license))
            .pipe(sourcemaps.write('./'))
            .pipe(gulp.dest(jsDest));
}
);

//    var bundler = browserify({
//     entries: ['./public/progresshive-deploy.js'],
//     debug: true
//   });

//  // bundler.plugin('browserify-header');
//   bundler.plugin('minifyify', {
//     map: './build/progresshive.map.json',
//     output: './build/progresshive.map.json'
//   });

//   return bundler
//     .bundle()
//     .pipe(source('progresshive.js'))
//     .pipe(header(license))
//     .pipe(gulp.dest('./build/'));
// });

gulp.task('uglifyController', function() {
  var license = '/* \n @license Widely v1.0.0 \n\n Terms: https://progresshive.io/terms-of-use \n\n */\n';  
  var jsFiles = './public/tool/controllers/**/*.js';  
  var jsDest = './public/dist/tool/controllers/';
     gulp.src(jsFiles)
            .pipe(sourcemaps.init({loadMaps: true}))
            .pipe(concat('controllers.min.js'))
            .pipe(uglify({
            compress: {
                drop_console: true
            }}))
            .pipe(sourcemaps.write('../../../maps/'))
            .pipe(gulp.dest(jsDest));
}
);

gulp.task('imagesDash', function () {
    return gulp.src('./public/tool/assets/img/*.+(png|jpg|jpeg|gif|svg|ico)')
        .pipe(gulp.dest('./public/dist/tool/assets/img'))
});

gulp.task('libDash', ['randomDash'], function () {
    return gulp.src('./public/tool/assets/lib/rdash-ui/**/*.*')
        .pipe(gulp.dest('./public/dist/tool/assets/lib/rdash-ui'))
});

gulp.task('randomDash', function () {
    return gulp.src(['./public/tool/assets/lib/rdash-ui/LICENSE', './public/tool/assets/lib/rdash-ui/.bower.json'])
        .pipe(gulp.dest('./public/dist/tool/assets/lib/rdash-ui'))
});

gulp.task('fontDash', function () {
    return gulp.src('./public/tool/fonts/*.+(eot|ttf|svg|woff)')
        .pipe(gulp.dest('./public/dist/tool/fonts'))
});

// gulp.task('viewsDash', ['imagesDash', 'libDash', 'fontDash', 'cssnanoDash', 'uglifyDash', 'cssnanoDashLib'], function(){
//     return gulp.src('./public/tool/views/**/*.html')
//     .pipe(gulp.dest('./public/dist/tool/views'))  
// });

gulp.task('viewsDash', ['imagesDash', 'libDash', 'fontDash', 'cssnanoDash', 'uglifyDash'], function () {
    return gulp.src('./public/tool/views/**/*.html')
        .pipe(gulp.dest('./public/dist/tool/views'))
});

gulp.task('copyHtmlDash', ['viewsDash'], function () {
    gulp.src('./public/tool/*.html')
        .pipe(gulp.dest('./public/dist/tool'));
});

gulp.task('copyBower', function () {
    gulp.src('./public/bower_components/**/*.*')
        .pipe(gulp.dest('./public/dist/bower_components/'));
})

gulp.task('copySupport', function () {
    gulp.src('./public/support/**/*.*')
        .pipe(gulp.dest('./public/dist/support/')); 
})

gulp.task('copyProgresshiveJs', function () {
        gulp.src(clientPaths.progresshiveLib)
         .pipe(gulp.dest('./public/dist'))
})

gulp.task('babel', () => {
  
    return gulp.src('./public/tool/controllers/client.plans.modal.js')
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(gulp.dest('./public/tool/controllers/'));

});

gulp.task('initialize-files', function () {
    if (process.env.NODE_ENV === 'production') {
        var manifest_data = {
            replaceSrc: './public/manifest.json',
            replaceDist: './public/dist/',
            replaceType: 'manifest'
        }
        _replace_string(manifest_data);
        var serviceWorker_data = {
            replaceSrc: './public/progresshive-sw.js',
            replaceDist: './public/dist/',
            replaceType: 'serviceWorker'
        }
        _replace_string(serviceWorker_data);
    }
    if (process.env.NODE_ENV === 'staging') {
        var manifest_data = {
            replaceSrc: './public/manifest.json',
            replaceDist: './public/dist/',
            replaceType: 'manifest'
        }
        _replace_string(manifest_data);
        var serviceWorker_data = {
            replaceSrc: './public/progresshive-sw.js',
            replaceDist: './public/dist/',
            replaceType: 'serviceWorker'
        }
        _replace_string(serviceWorker_data);
    }

});

function _replace_string(replace_data) {
    if (!(typeof (replace_data) === 'undefined')) {
        if (replace_data.replaceType && replace_data.replaceType.length !== 0) {
            if (replace_data.replaceSrc && replace_data.replaceSrc.length !== 0) {
                if (replace_data.replaceDist && replace_data.replaceDist.length !== 0) {
                    switch (replace_data.replaceType) {
                        case 'manifest': {

                            var original_string = '"gcm_sender_id": "230803098615"';
                            var gulp_data = gulp_config.env();
                            var replace_string = '"gcm_sender_id": "' + gulp_data.gcm_sender_id + '"';
                            gulp.src(replace_data.replaceSrc)
                                .pipe(replace(original_string, replace_string))
                                .pipe(gulp.dest(replace_data.replaceDist));
                        }
                            break;
                        case 'serviceWorker': {
                            var gulp_data = gulp_config.env();
                            var original_string = "firebase_url: 'https://luminous-torch-2375.firebaseio.com/'";
                            var replace_string = "firebase_url: '" + gulp_data.firebase_url + "'";
                            var original_string1 = "hashId: '-KJnwb9AxhQSgNxCCRFr'";
                            var replace_string1 = "hashId: '" + gulp_data.hashId + "'";
                            var original_string2 = '"/assets/css/prohivecss/main.css"';
                            var replace_string2 = gulp_data.dependencies;
                            var original_string3 = '"offline-cache"';
                            var replace_string3 = '"' + gulp_data.cache_name + '"';
                            gulp.src(replace_data.replaceSrc)
                                .pipe(replace(original_string, replace_string))
                                .pipe(replace(original_string1, replace_string1))
                                .pipe(replace(original_string2, replace_string2))
                                .pipe(replace(original_string3, replace_string3))
                                .pipe(gulp.dest(replace_data.replaceDist));

                        }
                            break;
                        default: {
                            console.log('build broke3: ".type" property in the  parameter in _replace_string() call dose not match : it must be one of "manifest" or "serviceWorker"');
                        }
                    }
                }
                else {
                    console.log('build borke1');
                }
            }
            else {
                console.log('build broke2: You must set "replaceSrc" property in the  parameter in _replace_string() call');
            }
        }
        else {
            console.log('build broke4: You must set type property in the  parameter in _replace_string() call');
        }
    }
    else {
        console.log('build broke5: You must pass a parameter in _replace_string() call');
    }

}
