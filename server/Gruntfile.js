module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
  	pkg: grunt.file.readJSON('package.json'),

  	jshint: {
  		// http://jshint.com/docs/options/

  		options:{
  			//camelcase:true,
  			curly:true,
  			maxstatements:100,
  			newcap:true,
  			//unused:true,
  			undef:true,
  			singleGroups:true,
  			maxparams: 4,
  			maxdepth:3,
  			freeze:true,
  			node:true,
  			noarg:true,
  			//strict:true,
  			
  			// http://stackoverflow.com/questions/359494/does-it-matter-which-equals-operator-vs-i-use-in-javascript-comparisons
  			//eqeqeq:true,
  			immed:true

  		},
  		all: ['model/**/*.js', 'config/**/*.js', 'lib/**/*.js', 'routes/**/*.js']
  	}
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
};
