#!/bin/bash

SCRIPT_DIR="$( cd -P "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
if [  x$1 == "xwebsite" ]; then
  # create javascript for the website
  ROOT="$SCRIPT_DIR/../website/"
else
  # create javascript for the mdown backend
  ROOT="$SCRIPT_DIR/../"
fi

JS="$ROOT/js/"
THEMES="$ROOT/themes/"
JS_OUTPUT="$ROOT/script.min.js"
CSS="$ROOT/css/"
JSC="java -jar $SCRIPT_DIR/closure-compiler.jar"

DEBUG=1
LEVEL="WHITESPACE_ONLY"
#LEVEL="SIMPLE_OPTIMIZATIONS"

if [ x$1 == "xwebsite" ]; then
	JS_COMPILE_TARGETS=" \
		$JS/*.js	\
	"
	JS_INCLUDE_TARGETS=" \
		$JS/min/*.js
	"
else
	# assets for mdown generated pages
	
	# compile / minify
	JS_COMPILE_TARGETS=" \
		$JS/*.js \
		$JS/gimmicks/*.js \
	"
	# only include but do not compile/minify
	JS_INCLUDE_TARGETS=" \
		$JS/min/*.min.js \
		$THEMES/bootswatch/assets/js/bootstrap.min.js \
	"
fi

if [ $DEBUG -eq 1  ]; then
	# when debugging, copy the compile targs to include targets
	JS_INCLUDE_TARGETS=$JS_INCLUDE_TARGETS$JS_COMPILE_TARGETS
fi

# append already minified files to it
cat $JS_INCLUDE_TARGETS > $JS_OUTPUT

# if debug, we dont compile but end here
test 1 -eq $DEBUG && exit 0

# prefix each build target with --js
PARAMS=""
for target in $JS_COMPILE_TARGETS; do
	PARAMS="$PARAMS --js $target"
done

# build all js scripts
$JSC $PARAMS \
  --compilation_level=$LEVEL \
	>> $JS_OUTPUT

