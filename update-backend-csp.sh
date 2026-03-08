#!/bin/bash
cd /home/ssm-user/agrinext/backend/dist
cp server.js server.js.backup
aws s3 cp s3://agrinext-images-1772367775698/server.js server.js
cd ..
pkill -f 'node dist/server.js' || true
export PATH=/home/ssm-user/.nvm/versions/node/v18.20.8/bin:$PATH
nohup node dist/server.js > ../backend.log 2>&1 &
sleep 3
ps aux | grep 'node dist/server.js' | grep -v grep
