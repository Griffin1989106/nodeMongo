#!/usr/bin/env bash

SRC=$(cd $(dirname "$0"); pwd)
source "${SRC}/include.sh"

pm2dev="`type -P node` `pwd`/bin/pm2-dev"
pmd="`type -P node` `pwd`/bin/pmd"

$pmd test/fixtures/child.js &
PM2_PID=$!

sleep 2
kill $PM2_PID
spec "should process been killed"
