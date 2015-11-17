/*
 *  Dragoon Project
 *  Arizona State University
 *  (c) 2014, Arizona Board of Regents for and on behalf of Arizona State University
 *
 *	This file stores the number of current version of Dragoon deployed on server
 *	currentVersion number should be manually incremented to higher version when
 *	new build is deployed on server.
 *
 */

var gulp = require('gulp'),
	jshint = require('gulp-jshint-cached'),
	cache = require('gulp-cached'),
	shell = require('gulp-shell'),
	replace = require('gulp-replace'),
	scp = require('gulp-scp2'),
	zip = require('gulp-zip'),
	mocha = require('gulp-mocha'),
	version = require('./version.js'),
	fs = require('fs');


//Set Configuration parameters
var config = {
	testPath: '../tests/RunTests.sh',

	buildPath: 'util/buildscripts/build.sh',
	buildProfile: 'release.profile.js',
	buildOutputFile: 'build-output.txt',

	releasePath: '../release/'+ version.getVersion(),
	wwwPath: '../release/www',

	hostname: 'dragoon.asu.edu',
	deployPath: '/home/laits/build/',
	destinationDir: '../release/live',

	testCommands : [
		'sudo java -jar ../tests/selenium-server-standalone-2.46.0.jar -log selenium.log & ',
		'echo "started selenium"'
	]
};

//Set Windows Configurations
var isWindows = /^win/.test(process.platform); //Check if system is windows
if(isWindows){
	config.testPath = '../tests/';
	config.buildPath = 'util/buildscripts/build.bat';

	testCommands = [
		'START /B java -jar .\selenium-server-standalone-2.45.0.jar -log selenium.log',
		'call mocha ./scripts/coreTests/ -t 30000',
		'call mocha ./scripts/bugTests/ -t 30000 '
	]
}

gulp.task('default', ['watch']);

gulp.task('watch', ['lint'], function (){
	gulp.watch('js/*.js', ['lint']);
	gulp.watch('index.html', ['lint']);
});

gulp.task('test', [ 'startSelenium', 'build'], function(done){
	var testsPassing = false;
	gulp.src('../tests/scripts/coreTests/*.js', {read: false})
		.pipe(mocha({reporter: 'nyan', timeout: 30000}))
		.once('error', function () {
			console.log("Tests do not pass");
			shutdownSelenium();
			process.exit(1);
		}).once('end', function () {
			console.log("All tests are passing");
			shutdownSelenium();
			conosle.log("Auto Deploying");
			scpRelease();
			done();
		});
});

gulp.task('startSelenium', shell.task(config.testCommands));

gulp.task('build', ['dojoBuild'], function (done){
	console.log("Copying files ...");
	var filesToCopy = [
		'./css/**/*.*',
		'./ET/**/*.*',
		'./Liviz/**/*.*',
		'./tincan/**/*.*',
		'./publicLogin/*/*.*',
		'./jsPlumb/lib/**/*.*',
		'./jsPlumb/demo/**/*.*',
		'./*.php',
		'./*.html',
		'./*.json',
		'version.js'];

	var externalFiles = [
		'../*.sql',
		'../db_user_password'
	];

	gulp.src(['../release/www/jsPlumb/*.*']).pipe(gulp.dest(config.wwwPath +'/jsPlumb/src')).on("end", function(){
		gulp.src(filesToCopy , {base: './'}).pipe(gulp.dest(config.wwwPath)).on("end", function(){
			console.log("Modifying Index.html");
			gulp.src(['index.html']).pipe(replace("document.write('<scr'+'ipt src=\"dojo/dojo.js\"></scr'+'ipt>');",
				"document.write('<scr'+'ipt src=\"dojo/dojo.js?'+ version +'\"></scr'+'ipt>'); \n document.write('<scr'+'ipt src=\"dragoon/index.js?'+ version +'\"></scr'+'ipt>');"))
				.pipe(gulp.dest(config.wwwPath)).on("end", function(){
					gulp.src(config.wwwPath+'/**', {base:'../release'}).pipe(gulp.dest(config.releasePath)).on("end", function(){
						console.log('Copying other folders...');
						gulp.src(externalFiles).pipe(gulp.dest(config.releasePath)).on("end", function(){
							console.log("Build Complete");
							generateZip();
							done();
						});
					});
				});
		});
	});
});

gulp.task('dojoBuild', ['clean'],  shell.task(config.buildPath + ' --profile '+ config.buildProfile +' > ../release/'+ config.buildOutputFile));

gulp.task('clean', shell.task(['mkdir -p ../release/' ]));

gulp.task('deploy', scpRelease);

gulp.task('lint', function (){
	return gulp.src('js/*.js')
		.pipe(cache('linting'))
		.pipe(jshint())
		.pipe(jshint.reporter('jshint-stylish'));
});

function generateZip(){
	console.log("Generating Zip...");
	gulp.src(config.releasePath +'/**/*.*')
		.pipe(zip(version.getVersion()+'.zip'))
		.pipe(gulp.dest('../release'))
		.on("end", shell.task(['rm -rf '+ config.wwwPath,
			'rm -rf '+ config.destinationDir,
			'mv '+ config.releasePath+' '+ config.destinationDir,
			'mkdir '+ config.destinationDir + '/www/problems',
			'mkdir '+ config.destinationDir + '/www/images',
			'cp -R ./problems/ '+ config.destinationDir + '/www/problems/',
			'cp -R ./images/ '+ config.destinationDir +'/www/images/',
			'cp ../db_user_password '+ config.destinationDir +'/db_user_password']
		));
}

function scpRelease(){
	getUserPassword();
	console.log("Deploying on "+ config.hostname);
	gulp.src(config.releasePath+".zip").pipe(scp({
		host: config.hostname,
		username: config.username,
		password:config.password,
		dest: config.deployPath
	})).on('error', function(err) {
			console.log(err);
	});
}

function shutdownSelenium(){
	console.log("Shutting down selenuim...")
	shell.task('curl localhost:4444/selenium-server/driver/?cmd=shutDownSeleniumServer');
}

function getUserPassword(){
	var fileContent=fs.readFileSync("../ssh_user_password", "utf8");
	var content = fileContent.split('\n');
	config.username = content[0];
	config.password = content[1];
}