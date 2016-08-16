var exec = require('child_process').exec;
var path = require('path');

// If going to run from a branch but translation and dev should check if checkout of destination branch, source branch and original branch is being doing right

var darwin_prefix = '';
var asyncChain = function asyncChain(){
	return {
		asyncCallChain: [],
		pipe: function pipe(fun){
			this.asyncCallChain.push(fun);
			return this;
		},
		exec: function exec() {
			var wrap = function (call, callback) {
				return function () {
					call(callback);
				};
			};
			for (var i = this.asyncCallChain.length-1; i > -1; i--) {
				this.asyncCallChain[i] = wrap(this.asyncCallChain[i], i < this.asyncCallChain.length - 1 ? this.asyncCallChain[i + 1] : function(){});
			}
			this.asyncCallChain[0]();
		},
	};
};

var DESTINATION_BRANCH = 'dev';
var SOURCE_BRANCH = 'translation';

var data = {
	finishedLanguageList: null,	
};

var runInShell = function runInShell(cb, cmd){
	exec('bash -c \'' + cmd + '\'', function (err, stdout, stderr) {
		data.lastShellStdErr = stderr.trim();
		if (!err) {
			data.lastShellStdOut = stdout.trim();
			cb();
		} else {
			console.log(err, stderr);
		}
	});
};

var removeWhitespaceFromEnd = function removeWhitespaceFromEnd(done, path){
	exec("bash -c \""+darwin_prefix+"sed -i 's/[[:blank:]]*\$//' " + path + "\"", function(err, stdout, stderr){
		if (!err){
			done();
		} else {
			console.log(err, stderr);
		}
	});
};

var checkoutToBranch = function checkoutToBranch(cb, branch, filename){
	runInShell(function(){
		cb();
	}, "git checkout " + branch + ' -- ' + filename);
};

var copy = function copy(cb, src, dst){
	runInShell(cb, darwin_prefix+"cp -r " + src + " " + dst);
};

var copyJsonFiles = function copyJsonFiles(cb, dst) {
	copy(function(){
		runInShell(cb, 'for filename in `'+darwin_prefix+'ls -I en.json ' +  data.tmp_dir + '/' + dst + '/`; do '+darwin_prefix+'cp ' +  data.tmp_dir + '/' + dst + '/en.json ' +  data.tmp_dir + '/' + dst + '/$filename; done');
	}, 'www/i18n', data.tmp_dir + '/' + dst);
};

var callPoToJson = function callPoToJson(cb){
	exec('po2json --fuzzy -t ' + data.tmp_dir + '/i18n ' + data.tmp_dir + '/translation ' + data.tmp_dir, function (err, stdout, stderr) {
		console.log(stdout, stderr);
		removeWhitespaceFromEnd(cb, data.tmp_dir + '/*.json');
	});
};

var makeDir = function makeDir(done, dir){
	runInShell(function(){
		done();
	}, darwin_prefix + 'mkdir -p ' + dir);
};

var makeTempDir = function makeTempDir(done, prefix){
	var tmp_dir=prefix + new Date().toLocaleDateString().replace(new RegExp('/', 'g'), '-');
	runInShell(function(){
		data.tmp_dir = tmp_dir;
		done();
	}, darwin_prefix + 'rm -rf ' + tmp_dir + '; '+darwin_prefix+'mkdir -p ' + tmp_dir);
};
var convertPoToJson = function convertPoToJson(done) {
	checkoutToBranch(function(){
		copyJsonFiles(function(){
			callPoToJson(function(){
				runInShell(function(){
					runInShell(function(){
						console.log(data.lastShellStdOut, data.lastShellStdErr);
						checkoutToBranch(function(){
							done();
						}, data.originalBranch, 'www/i18n');
					}, 'pushd ' + data.tmp_dir + '/mobile && '+darwin_prefix+'cp ../*.json www/i18n && git add www/i18n/{' + data.finishedLanguageList.join(',') + '}.json; git commit -m "Converted translation files to json - ' + (new Date()).toLocaleDateString().replace(new RegExp('/', 'g'), '-') + '"; git push '+data.remoteUrl+' '+DESTINATION_BRANCH+'; popd ');
				}, 'git clone -b '+DESTINATION_BRANCH+' ./ ' + data.tmp_dir + '/mobile');
			});
		}, 'i18n');
	}, DESTINATION_BRANCH, 'www/i18n');
};

var isLinux = function isLinux(done){
	var os = process.platform;
	if ( os === 'linux' ) {
		done();
	} else if ( os === 'darwin' ) {
		darwin_prefix = 'g';
		done();
	} else {
		console.log('Sorry this script only works on Mac or Linux');
	}
};

var runIfBranchClean = function runIfBranchClean(done){
	exec("git status -s", function (err, stdout, stderr) {
		if (!stdout.trim()){
			done();
		} else {
			console.log('Branch is not clean, please commit the changes first');
		}
	});
};

var getNameOfOriginalBranch = function getNameOfOriginalBranch(done){
	runInShell(function(){
		data.originalBranch = data.lastShellStdOut;
		done();
	}, 'git rev-parse --abbrev-ref HEAD');
};

var getRemoteUrl = function getRemoteUrl(done, dir){
	runInShell(function(){
		data.remoteUrl = data.lastShellStdOut;
		done();
	}, 'git remote get-url --push origin');
};

var translate = {};
translate.po2json = function po2json(){

	asyncChain()
	.pipe(isLinux)
	.pipe(runIfBranchClean)
	.pipe(getNameOfOriginalBranch)
	.pipe(getRemoteUrl)
	.pipe(function(done) {
		makeTempDir(done, '/tmp/po2json-');
	})
	.pipe(function getTheFinishedLanguageList(done){
		var finishedLanguageList = [];
		var lastUpdateOfTranslations = '';
		asyncChain().pipe(function(doneLvl2){
			exec("git log --grep='Updated translation files with the recent changes' --oneline|"+darwin_prefix+"head -1 |"+darwin_prefix+"cut -d' ' -f1", function (err, stdout, stderr) {
				lastUpdateOfTranslations = stdout.trim();
				doneLvl2();
			});
		})
		.pipe(function(){
			exec("git log "+lastUpdateOfTranslations+"..HEAD --grep='100.0%' --oneline |"+darwin_prefix+"cut -d' ' -f1 ", function (err, stdout, stderr) {
				var listOfCommits = stdout.trim().split('\n');
				listOfCommits.forEach(function (commit, index){
					exec("git diff-tree --no-commit-id --name-only -r "+commit, function (err, stdout, stderr) {
						if (stdout.trim()) {
							finishedLanguageList.push(path.parse(stdout.trim()).name);
						}
						if (index === listOfCommits.length - 1) {
							if ( finishedLanguageList.length ) {
								console.log('Completed languages are', finishedLanguageList.join(','));
							} else {
								console.log('No finished language detected, exiting...');
							}
							data.finishedLanguageList = finishedLanguageList;
							if ( finishedLanguageList.length ) {
								done();
							}
						}
					});
				});
			});
		}).exec();
	})
	.pipe(function copyPoFilesFromTranslationBranch(done){
		checkoutToBranch(function(){
			copy(function(){
				checkoutToBranch(function(){
					done();
				}, data.originalBranch, 'www/translation');
			}, 'www/translation', data.tmp_dir);
		}, SOURCE_BRANCH, 'www/translation');
	})
	.pipe(function decideToConvertOrCopy(done){
		convertPoToJson(done);
	})
	.exec();
};

translate.json2po = function json2po(){
	asyncChain()
	.pipe(isLinux)
	.pipe(runIfBranchClean)
	.pipe(getNameOfOriginalBranch)
	.pipe(getRemoteUrl)
	.pipe(function (done) {
		makeTempDir(done, '/tmp/json2po-');
	})
	.pipe(function checkIfConversionIsNeeded(done){
		checkoutToBranch(function(){
			copy(function(){
				checkoutToBranch(function(){
					exec('bash -c \'diff www/i18n/en.json ' + data.tmp_dir + '/en.json\'', function (err, stdout, stderr) {
						if ( stdout.trim() === '' ) {
							console.log('No change detected in the template file, exiting...');
						} else {
							done();
						}
					});
				}, data.originalBranch, 'www/i18n');
			}, 'www/i18n/en.json', data.tmp_dir + '/en.json');
		}, DESTINATION_BRANCH, 'www/i18n');
	})
	.pipe(function makeDirForMergedPo(done){
		makeDir(done, data.tmp_dir + '/new_po');
	})
	.pipe(function makeDirForMergedPo(done){
		makeDir(done, data.tmp_dir + '/translated_i18n');
	})
	.pipe(function copyCurrentPoFiles(done){
		copy(done, 'www/translation', data.tmp_dir);
	})
	.pipe(function copyJsonFilesFromDev(done){
		checkoutToBranch(function(){
			copyJsonFiles(function(){
				checkoutToBranch(function(){
					done();
				}, data.originalBranch, 'www/i18n');
			}, 'i18n');
		}, DESTINATION_BRANCH, 'www/i18n');
	})
	.pipe(function generateNewPo(done){
		runInShell(done, 'json2po ' + data.tmp_dir + '/i18n ' + data.tmp_dir + '/new_po');
	})
	.pipe(function makeJsonBasedOnCurrentPo(done){
		copyJsonFiles(function(){
			runInShell(done, 'po2json --fuzzy -t ' + data.tmp_dir + '/current_i18n_template ' + data.tmp_dir + '/translation ' + data.tmp_dir + '/translated_i18n ');
		}, 'current_i18n_template');
	})
	.pipe(function generateMergedPo(done){
		runInShell(done, 'json2po -t ' + data.tmp_dir + '/i18n ' + data.tmp_dir + '/translated_i18n ' + data.tmp_dir + '/new_po; '+darwin_prefix+'rm -f ' + data.tmp_dir + '/new_po/en.po');
	})
	.pipe(function finalizeChanges(rootDone){
		runInShell(function(){
			asyncChain()
			.pipe(function mergeOldWithNew(done){
				runInShell(done, 'pushd ' + data.tmp_dir + '/mobile/www/translation; for filename in `'+darwin_prefix+'ls -I en.json`; do msgmerge --no-fuzzy-matching -U $filename ' + data.tmp_dir + '/new_po/$filename; done; popd');
			})
			.pipe(function replaceJsonBackups(done){
				copy(done, data.tmp_dir + '/i18n/*', data.tmp_dir + '/mobile/www/i18n');
			})
			.pipe(function removeWhitespaceFromJsons(done){
				removeWhitespaceFromEnd(done, data.tmp_dir + '/mobile/www/i18n/*.json ' + data.tmp_dir + '/mobile/www/translation/*.po');
			})
			.pipe(function removeAllAutoBackups(done){
				runInShell(done, 'rm -f ' + data.tmp_dir + '/mobile/www/translation/*.po~');
			})
			.pipe(function commitChanges(done){
				runInShell(done, 'pushd ' + data.tmp_dir + '/mobile; git add www/i18n/*.json www/translation/*.po; git commit -m "Updated translation files with the recent changes - ' + (new Date()).toLocaleDateString().replace(new RegExp('/', 'g'), '-') + '"; git push '+data.remoteUrl+' '+ SOURCE_BRANCH + '; popd');
			})
			.exec();
		}, 'git clone -b '+SOURCE_BRANCH+' ./ ' + data.tmp_dir + '/mobile');
	})
	.exec();
};

module.exports = translate;
