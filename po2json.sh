#!/bin/bash
# install translation toolkit first: http://translate-toolkit.readthedocs.org/en/latest/index.html
#set -x
shopt -s extglob
completed_langs=$(git log --after="`git log --grep='Updated translation files with the recent changes' -n1 --format='%cd'`" | grep '100.0%' -B2|grep 'Translated using Weblate'|sed 's/^[ a-zA-Z]*(\(.*\))/\1/'| ( completed='';while read line; do export completed="$completed,"$(cd www/translation; grep "$line" -r  -l |cut -d. -f1); done; echo $completed)|sed -rn 's/^.(.*)/\1/p')
dst="$1"
if [ -z "$dst" ] ;then
	mode="INCLUDEPHRASESFROMLANG"
	if [ -z "$completed_langs" ];then 
		echo No recently completed language was detected
		exit 1
	else
		completed_langs={$completed_langs}
	fi
else
	mode="DONOTINCLUDEPHRASESFROMLANG"
	completed_langs={$(cd www/translation; ls *.po| (completed=''; while read line; do completed="$completed,"$(echo $line|cut -d. -f1); done; echo $completed) | sed -rn 's/^.(.*)/\1/p')}
fi
function make_new_templates(){
	cp -r www/i18n "$tmp_file"
	pushd "$tmp_file/i18n"&&
		for i in `ls !(en).json`; do cp en.json $i; done &&
	popd
}
destination_branch="dev"
current_branch=`git branch |grep '\*'|cut -d' ' -f2`
stashed=0
if [ "$current_branch" != "translation" ] ;then 
	git stash
	stashed=1
	git checkout translation
fi
tmp_file="/tmp/po2json-"`date +'%h%m%d%H%M%S'`
mkdir "$tmp_file"
cp -r www/translation "$tmp_file"
if [ "$mode" == "DONOTINCLUDEPHRASESFROMLANG" ]; then
	make_new_templates
fi
if [ "$mode" == "INCLUDEPHRASESFROMLANG" ]; then
	git checkout "$destination_branch" 
	make_new_templates
fi
po2json -t "$tmp_file/i18n" "$tmp_file/translation" "$tmp_file"
if [ "$mode" == "INCLUDEPHRASESFROMLANG" ]; then
	eval "cp $tmp_file/$completed_langs.json www/i18n"
	eval "git add www/i18n/$completed_langs.json"
	git commit -m "Converted translation files to json - `date +'%y%m%d'`"
else
	eval "cp $tmp_file/$completed_langs.json $dst"
fi
git checkout "$current_branch"
if [ $stashed -eq 1 ]; then 
	git stash pop
fi
shopt -u extglob
#set +x
