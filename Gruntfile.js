var path = require('path');
var includeRegExp = new RegExp('@@include\\(\\s*["\'](.*?)["\'](,\\s*({[\\s\\S]*?})){0,1}\\s*\\)');

module.exports = function(grunt) {
    var serveStatic = require('serve-static');

    var config = {
        web: 'web',
        dist: 'dist'
    };

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        config: config,
        clean: {
            dist: {
                files: [{
                    dot: true,
                    src: [
                        '<%= config.dist %>/*',
                        '!<%= config.dist %>/.svn'
                    ]
                }]
            }
        },
        includereplace: {
            build: {
                options: {
                    prefix: '@@',
                    suffix: '',
                    wwwroot: './',
                    globals: {
                        SITE: '胡夫塔',
                        HOST: 'http://console.dhbiji.com/',
                        API: 'http://api.hufutown.com/api/console/b.php',
                        HTML: '.html',
                        DEBUG: 0,
                        BUILD: new Date().getTime()
                    },
                    includesDir: '',
                    docroot: '.'
                },
                src: '<%= config.dist %>/**/*.{js,html}',
                dest: './'
            },
            test: {
                options: {
                    prefix: '@@',
                    suffix: '',
                    wwwroot: './',
                    globals: {
                        SITE: '胡夫塔',
                        HOST: 'http://console.hufutown.com/',
                        API: 'http://api.hufutown.com/api/console/b.php',
                        HTML: '.html',
                        DEBUG: 1,
                        BUILD: new Date().getTime()
                    },
                    includesDir: '',
                    docroot: '.'
                },
                src: '<%= config.dist %>/**/*.{js,html}',
                dest: './'
            },
            server: {
                options: {
                    prefix: '@@',
                    suffix: '',
                    wwwroot: './',
                    globals: {
                        SITE: '胡夫塔',
                        HOST: '/',
                        API: 'http://api.hufutown.com/api/console/b.php',
                        HTML: '.html',
                        DEBUG: 1,
                        BUILD: 'test' //new Date().getTime()
                    },
                    includesDir: '',
                    docroot: '.'
                },
                src: '<%= config.dist %>/**/*.{js,html}',
                dest: './'
            }
        },
        jshint: {
            dist: [
                '<%= config.web %>/public/js/module/*.js'
            ]
        },
        useminPrepare: {
            options: {
                dest: '<%= config.dist %>'
            },
            html: '<%= config.web %>/index.html'
        },
        usemin: {
            html: ['<%= config.dist %>/**/*.html']
        },
        uglify: {
            dist: {
                files: [
                    {
                        '<%= config.dist %>/public/js/qdtrip.min.js': [
                            '<%= config.web %>/public/js/jquery.hound.admin.min.js',
                            '<%= config.web %>/public/js/consts.js',
                            '<%= config.web %>/public/js/apis.js',
                            '<%= config.web %>/public/js/utils.js',
                            '<%= config.web %>/public/js/common.js'
                        ]
                    },
                    {
                        expand: true,
                        cwd: '<%= config.web %>/public/js/module',
                        dest: '<%= config.dist %>/public/js/module',
                        src: '**/*.js'
                    }
                ]
            }
        },
        postcss: {
            options: {
                processors: [
                    require('postcss-advanced-variables')(),
                    require('postcss-calc')(),
                    require('postcss-nested')(),
                    require('postcss-cssnext')({
                        browsers: [
                            '>1%',
                            'last 2 versions',
                            'Firefox ESR',
                            'not ie < 9'
                        ],
                        flexbox: 'no-2009'
                    }),
                    require('postcss-px2rem')({remUnit: 32})
                ]
            },
            dist: {
                src: '<%= config.web %>/public/css/qdtrip.pcss',
                dest: '<%= config.web %>/public/css/qdtrip.css'
            }
        },
        cssmin: {
            dist: {
                files: {
                    '<%= config.dist %>/public/css/qdtrip.min.css': [
                        '<%= config.web %>/public/css/jquery.hound.admin.min.css',
                        '<%= config.web %>/public/css/qdtrip.css',
                        '<%= config.web %>/public/css/main.css',
                        '<%= config.web %>/public/css/visa.css',
                    ]
                }
            }
        },
        copy: {
            dist: {
                files: [
                    {
                        expand: true,
                        dot: true,
                        cwd: '<%= config.web %>',
                        dest: '<%= config.dist %>',
                        src: [
                            '**/*.html',
                            '**/*.{png,jpg,gif}',
                            '**/*.{otf,eot,svg,ttf,woff,woff2}'
                        ]
                    },
                    {
                        expand: true,
                        dot: true,
                        cwd: '<%= config.web %>/public/js/plugins/',
                        dest: '<%= config.dist %>/public/js/plugins/',
                        src: [
                            '**/*'
                        ]
                    }
                ]
            },
            hound: {
                files: [{
                    expand: true,
                    cwd: '<%= config.web %>/../../jquery-hound/dist/',
                    src: ['fonts/*', 'js/jquery.hound.admin*.js', 'css/jquery.hound.admin*.css'],
                    dest: '<%= config.web %>/public'
                }]
            },
            test: {
                files: [{
                    expand: true,
                    cwd: '<%= config.dist %>',
                    src: ['**/*', '!**/inc-*.html'],
                    dest: '<%= config.dist %>/../../hufu-console/'
                }]
            },
            build: {
                files: [{
                    expand: true,
                    cwd: '<%= config.dist %>',
                    src: ['**/*', '!**/inc-*.html'],
                    dest: '<%= config.dist %>/../../console-dhbiji/'
                }]
            }
        },
        watch: {
            scripts: {
                files: ['<%= config.web %>/public/js/**/*.js'],
                tasks: ['jshint'],
                options: {
                    livereload: true
                }
            },
            postcss: {
                files: ['<%= config.web %>/public/css/*.pcss'],
                tasks: ['postcss']
            },
            styles: {
                files: ['<%= config.web %>/public/css/*.css']
            },
            livereload: {
                options: {
                    livereload: '<%= connect.options.livereload %>'
                },
                files: [
                    '<%= config.web %>/**/*.html'
                ]
            }
        },
        connect: {
            options: {
                port: 9000,
                open: false,
                livereload: 35729,
                hostname: '*'
            },
            livereload: {
                options: {
                    base: '<%= config.web %>',
                    middleware: function(connect){
                        return [
                            connect().use('/bower_components', serveStatic('./bower_components')),
                            connect().use('/node_modules', serveStatic('./node_modules')),
                            // connect().use('/public', serveStatic('./web/public')),
                            connect().use('/public/fonts', serveStatic('./web/public/fonts')),
                            connect().use('/public/images', serveStatic('./web/public/images')),
                            // connect().use('/public/css', serveStatic('./web/public/css')),
                            function(req, res, next) {
                                //include
                                var filePath = req.url,
                                    fileSearch = filePath.indexOf('?'),
                                    fileDir = path.dirname(filePath),
                                    body;

                                var options = grunt.config.data.includereplace.server.options,
                                    globalVars = options.globals,
                                    globalVarNames = Object.keys(globalVars),
                                    globalVarRegExps = {};
                                globalVarNames.forEach(function(globalVarName) {
                                    if (grunt.util._.isString(globalVars[globalVarName])) {
                                        globalVars[globalVarName] = globalVars[globalVarName];
                                    } else {
                                        globalVars[globalVarName] = JSON.stringify(globalVars[globalVarName]);
                                    }
                                });

                                if (fileSearch !== -1) {
                                    filePath = filePath.substr(0, fileSearch);
                                }

                                if (-1 !== filePath.indexOf('.map') || -1 !== filePath.indexOf('.ico')) {
                                    console.log('ignore - %s', config.web + filePath);
                                    return res.end();
                                }

                                if (filePath.indexOf('.js') !== -1) {
                                    console.log('request - %s', config.web + filePath);
                                    return res.end(replace(grunt.file.read(config.web + filePath), {}));
                                }

                                if (filePath.indexOf('.html') === -1) {
                                    body = grunt.file.read(config.web + filePath);
                                } else {
                                    console.log('request - %s', config.web + filePath);
                                    body = replace(grunt.file.read(config.web + filePath));
                                    var matches = includeRegExp.exec(body);

                                    if (fileDir.substr(-1) !== '/') {
                                        fileDir =  fileDir + '/'
                                    }
                                    while (matches) {
                                        var match = matches[0];
                                        var includePath = matches[1];
                                        var localVars = matches[3] ? JSON.parse(matches[3]) : {};
                                        var includeFullPath = config.web + fileDir + includePath;

                                        console.log('include - %s', includeFullPath);
                                        body = body.replace(match, grunt.file.read(includeFullPath));
                                        body = replace(body, localVars);

                                        matches = includeRegExp.exec(body);
                                    }
                                }

                                function replace(contents, localVars) {
                                    localVars = localVars || {};

                                    var varNames = Object.keys(localVars);
                                    var varRegExps = {};
                                    varNames.forEach(function(varName) {
                                        if (grunt.util._.isString(localVars[varName])) {
                                            localVars[varName] = grunt.template.process(localVars[varName]);
                                        } else {
                                            localVars[varName] = JSON.stringify(localVars[varName]);
                                        }
                                        varRegExps[varName] = varRegExps[varName] || new RegExp(options.prefix + varName + options.suffix, 'g');
                                        contents = contents.replace(varRegExps[varName], localVars[varName]);
                                    });

                                    globalVarNames.forEach(function(globalVarName) {
                                        globalVarRegExps[globalVarName] = globalVarRegExps[globalVarName] || new RegExp(options.prefix + globalVarName + options.suffix, 'g');
                                        contents = contents.replace(globalVarRegExps[globalVarName], globalVars[globalVarName]);
                                    });

                                    return contents;
                                }

                                return res.end(body);
                            }
                        ];
                    }
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-include-replace');
    grunt.loadNpmTasks('grunt-postcss');
    grunt.loadNpmTasks('grunt-usemin');

    //server
    grunt.registerTask('server', [
        'postcss',
        'connect:livereload',
        'watch'
    ]);

    //build
    grunt.registerTask('build', [
        'clean:dist',
        'postcss',
        'jshint',
        'copy:dist',
        'useminPrepare',
        'usemin',
        'cssmin:dist',
        'uglify:dist',
        'includereplace:build',
        'copy:build'
    ]);

    //test
    grunt.registerTask('test', [
        'clean:dist',
        'postcss',
        'jshint',
        'copy:dist',
        'useminPrepare',
        'usemin',
        'cssmin:dist',
        'uglify:dist',
        'includereplace:test',
        'copy:test'
    ]);

    // Default task(s).
    grunt.registerTask('default');

    //install hound
    grunt.registerTask('hound', ['copy:hound']);

};
