#!/bin/bash

for user in "thibaud" "jaimito" "grizix" "acekat" "berthou" "esj"; do  
	dir=store/$user
	if [[ ! -e $dir ]]; then
		mkdir -p $dir
	elif [[ ! -d $dir ]]; then
		echo "$dir already exists but is not a directory" 1>&2
	fi
done
