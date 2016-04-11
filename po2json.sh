#!/bin/bash
# install translation toolkit first: http://translate-toolkit.readthedocs.org/en/latest/index.html
#set -x
shopt -s extglob
completed_langs="$1"
all_languages=false
dst="$2"
if [ -z "$completed_langs" -a ! -e "$completed_langs" ] ;then
	all_languages=true
elif [ -e "$completed_langs" ] ;then
	all_languages=true
	dst="$completed_langs"
else
	echo "$completed_langs"| grep -q , && completed_langs="{$completed_langs}"
fi
if [ -z "$dst" ] ;then
	mode="INCLUSIVE"
else
	mode="EXCLUSIVE"
fi
function make_new_templates(){
	cp -r www/i18n "$tmp_file"
	pushd "$tmp_file/i18n"&&
		for i in `ls !(en).json`; do cp en.json $i; done &&
	popd
}
destination_branch="oauth"
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
if [ "$mode" == "EXCLUSIVE" ]; then
	make_new_templates
fi
if [ "$mode" == "INCLUSIVE" ]; then
	git checkout "$destination_branch" 
	make_new_templates
fi
po2json -t "$tmp_file/i18n" "$tmp_file/translation" "$tmp_file"
if [ "$mode" == "INCLUSIVE" ]; then
	test $all_languages == false && eval "cp $tmp_file/$completed_langs.json www/i18n"
	test $all_languages == true && cp "$tmp_file/"!(en).json www/i18n
	test $all_languages == false && eval "git add www/i18n/$completed_langs.json"
	test $all_languages == true && git add www/i18n/!(en).json
	git commit -m "Converted translation files to json - `date +'%y%m%d'`"
else
	test $all_languages == false && eval "cp $tmp_file/$completed_langs.json $dst"
	test $all_languages == true && cp "$tmp_file/"!(en).json "$dst"
fi
git checkout "$current_branch"
if [ $stashed -eq 1 ]; then 
	git stash pop
fi
shopt -u extglob
#set +x
