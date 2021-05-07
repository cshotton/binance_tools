#!/bin/bash
API=$1
SECRET=$2
shift 2
for f in $* 
do 
    # echo "Processing $f file.."
    node index $API $SECRET $f
done