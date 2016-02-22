#!/bin/bash
# install translation toolkit first: http://translate-toolkit.readthedocs.org/en/latest/index.html
shopt -s extglob
included_languages="ar,de,en,es,fr,id,it,pl,pt,ru,vi,zh_cn,zh_tw,it"
if [ ! -e "po2json.sh" ]; then
	echo "Error: This script needs the po2json.sh as its dependency"
	exit 1
fi

tmp_file="/tmp/json2po-"`date +'%h%m%d%H%M%S'`
mkdir "$tmp_file"
mkdir "$tmp_file/old_po"
mkdir "$tmp_file/new_po"

current_branch=`git branch |grep '\*'|cut -d' ' -f2`
stashed=0
if [ "$current_branch" != "dev" ] ;then 
	git stash
	stashed=1
	git checkout dev 
fi

cp -r www/i18n "$tmp_file/lang"
pushd "$tmp_file/lang"&&
	for i in `ls !(en.json)`;do cp en.json $i;done&&
popd

git checkout "$current_branch"
if [ $stashed -eq 1 ]; then 
	git stash pop
fi

./po2json.sh "$included_languages" "$tmp_file/old_po"
json2po -t "$tmp_file/lang" "$tmp_file/old_po" "$tmp_file/new_po"
pushd www/translation&&
	for i in `ls !(en.json)`; do msgmerge -U $i "$tmp_file/new_po/$i"; done&&
popd
git add www/translation/*.po
rm www/translation/*.po~
git commit -m "Updated translation files with the recent changes - `date +'%y%m%d'`"

shopt -u extglob
