//install scripts:
//npm install --save grunt load-grunt-tasks grunt-shell grunt-contrib-watch grunt-autoprefixer grunt-contrib-less grunt-express-server grunt-contrib-clean grunt-contrib-uglify grunt-contrib-copy

module.exports = function(grunt) {

	require('load-grunt-tasks')(grunt);

	grunt.initConfig({

		autoprefixer: {

			options: {

			},

			grimelist: {
				expand: true,
				flatten: false,
				src: 'public/style/**/*.css'
			}
		},

		less: {

			development: {
				options: {
					paths: ['public-src/style']
				},
				files: [{
					expand: true,
					cwd: 'public-src/style',
					src: ['**/*.less'],
					dest: 'public/style',
					ext: '.css'
				}]
			},

			production: {
				options: {
					paths: ['public-src/style'],
					cleancss: true
				},
				files: [{
					expand: true,
					cwd: 'public-src/style',
					src: ['**/*.less'],
					dest: 'public/style',
					ext: '.css'
				}]
			}

		},

		clean: {
			all: [
			'public/style',
			'public/js',
			'public/img/*.png',
			'public/img/*.webm',
			'public/favicon.ico'
			]
		},

		express: {
			dev: {
				options: {
					script: 'bin/www'
				}
			}
		},

		uglify: {
			prod: {
				files: [{
					expand: true,
					cwd: 'public-src/js',
					src: '**/*.js',
					dest: 'public/js'
				}]
			}
		},

		copy: {
			development: {
				files: [{
					expand: true,
					dot: true,
					cwd: 'public-src',
					src: [
					'js/**/*.js',
					'img/**/*'
					],
					dest: 'public'
				}
				]
			},
			production: {
				files: [{
					expand: true,
					dot: true,
					cwd: 'public-src',
					src: [
					'img/**/*'
					],
					dest: 'public'
				}
				]
			}
		},

		watch: {

			express: {
				files: [
					'bin/www',
					'app.js',
				],
				tasks: ['express:dev'],
				options: {
					nospawn: true
				}
			},
			styles: {
				files: ['public-src/style/**/*.less'],
				tasks: ['buildstyles']
			},
			js: {
				files: ['public-src/js/**/*.js'],
				tasks: ['copy:development']
			},
			img: {
				files: ['public-src/img/**/*'],
				tasks: ['copy:development']
			}
		}

	});

grunt.registerTask('buildstyles', 'Compile and autoprefix LESS to CSS', [
	'less:development',
	'autoprefixer'
	]);

grunt.registerTask('buildprod', 'Builds all files for prod deploys', [
	'clean',
	'less:production',
	'autoprefixer',
	'uglify',
	'copy:production'
	]);

grunt.registerTask('builddev', 'Builds all files for dev testing', [
	'clean',
	'buildstyles',
	'copy'
	]);

grunt.registerTask('work', 'Build and run app for development', [
	'clean',
	'builddev',
	'express:dev',
	'watch'
	]);

}
