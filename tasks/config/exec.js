module.exports = function(grunt) {

    grunt.config.set('exec', {
        webpackDevServerLift : 'webpack-dev-server --content-base ./tmp/public/ --port 9999',
    });

    grunt.loadNpmTasks('grunt-exec');
};
