#!/usr/bin/env bash

SRC=$(cd $(dirname "$0"); pwd)
source "${SRC}/../include.sh"

cd $file_path/serve
PORT=8081
PORT_2=8082
echo "################## PM2 SERVE ###################"

$pm2 serve --port $PORT
should 'should have started serving dir' 'online' 1

curl http://localhost:$PORT/ > /tmp/tmp_out.txt
OUT=`cat /tmp/tmp_out.txt | grep -o "good shit" | wc -l`
[ $OUT -eq 1 ] || fail "should have served index file under /"
success "should have served index file under /"

curl http://localhost:$PORT/index.html > /tmp/tmp_out.txt
OUT=`cat /tmp/tmp_out.txt | grep -o "good shit" | wc -l`
[ $OUT -eq 1 ] || fail "should have served index file under /index.html"
success "should have served index file under /index.html"

echo "Shutting down the server"
$pm2 delete all

curl http://localhost:$PORT/index.html > /tmp/tmp_out.txt
OUT=`cat /tmp/tmp_out.txt | grep -o "good shit" | wc -l`
[ $OUT -eq 0 ] || fail "should be offline"
success "should be offline"

$pm2 serve . $PORT_2
should 'should have started serving dir' 'online' 1

curl http://localhost:$PORT_2/index.html > /tmp/tmp_out.txt
OUT=`cat /tmp/tmp_out.txt | grep -o "good shit" | wc -l`
[ $OUT -eq 1 ] || fail "should be listening on port $PORT_2"
success "should be listening on port $PORT_2"

$pm2 delete all

$pm2 serve . $PORT_2 --name frontend
should 'should have started serving dir' 'online' 1
should 'should have custom name' 'frontend' 7

curl http://localhost:$PORT_2/index.html > /tmp/tmp_out.txt
OUT=`cat /tmp/tmp_out.txt | grep -o "good shit" | wc -l`
[ $OUT -eq 1 ] || fail "should be listening on port $PORT_2"
success "should be listening on port $PORT_2"

curl http://localhost:$PORT_2/yolo.html > /tmp/tmp_out.txt
OUT=`cat /tmp/tmp_out.txt | grep -o "your file doesnt exist" | wc -l`
[ $OUT -eq 1 ] || fail "should have served custom 404 file"
success "should have served custom 404 file"

$pm2 delete all

$pm2 start ecosystem.json
should 'should have started serving dir' 'online' 1

curl http://localhost:8081/index.html > /tmp/tmp_out.txt
OUT=`cat /tmp/tmp_out.txt | grep -o "good shit" | wc -l`
[ $OUT -eq 1 ] || fail "should be listening on port 8081"
success "should be listening on port 8081"

$pm2 stop ecosystem.json

curl http://localhost:8081/index.html > /tmp/tmp_out.txt
OUT=`cat /tmp/tmp_out.txt | grep -o "good shit" | wc -l`
[ $OUT -eq 0 ] || fail "should be offline"
success "should be offline"
