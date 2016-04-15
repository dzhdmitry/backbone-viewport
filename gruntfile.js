module.exports = function(grunt) {
	var src = ['src/spa.js'],
        banner = '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
            '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
            '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
            '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;\n' +
            '* Licensed <%= _.map(pkg.licenses, function(l) { return l.type; }).join(", ") %>\n' +
            '*/\n';

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		uglify: {
			options: {
				banner: banner
			},
			build: {
				src: src,
				dest: 'dist/spa.min.js'
			}
		},
		concat: {
			options: {
				banner: banner
			},
			dist: {
				src: src,
				dest: 'dist/spa.js'
			}
		},
		qunit: {
			all: ['test/*.html']
		}
	});

	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-qunit');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.registerTask('build', ['concat', 'uglify']);
	//grunt.registerTask('default', ['qunit', 'build']);
};

/*
npm-install grunt  - install grunt locally
npm-install  - install all dependencies (uglify etc)

grunt qunit
grunt default
 */
