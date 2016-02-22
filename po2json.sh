#!/bin/bash
# install translation toolkit first: http://translate-toolkit.readthedocs.org/en/latest/index.html
set -x
shopt -s extglob
completed_langs="$1"
dst="$2"
if [ -z "$completed_langs" ] ;then
	echo "Error: completed languages cannot be empty"
	echo "Usage Example: ./po2json.sh id,cn"
	exit 1
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
		for i in `ls !(en.json)`; do cp en.json $i; done &&
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
if [ "$mode" == "EXCLUSIVE" ]; then
	make_new_templates
fi
git checkout "$destination_branch" 
if [ "$mode" == "INCLUSIVE" ]; then
	make_new_templates
fi
po2json -t "$tmp_file/i18n" "$tmp_file/translation" "$tmp_file"
if [ "$mode" == "INCLUSIVE" ]; then
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
set +x
