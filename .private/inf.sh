#!/bin/bash

# simple script that will periodically build our scripts,
# handy in development
while :
do
  sh build_assets.sh
  echo "done."
  sleep 1
done
