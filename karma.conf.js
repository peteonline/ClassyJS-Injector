module.exports = function(config) {
	config.set({
		basePath: 'src',
		files: [
			'../vendor/classyjs/build/classy.js',
			'Shim.js',
			'Injector.js',
			'InjectorTest.js',
		],
		frameworks: ['jasmine'],
		browsers: ['PhantomJS']
	});
};
