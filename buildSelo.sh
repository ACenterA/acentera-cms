#!/bin/bash
[[ -e node_modules/selo ]] && rm -fr node_modules/selo
[[ -e ../node_modules/selo ]] && rm -fr ../node_modules/selo
[[ -e selo/build ]] && rm -fr selo/build
(cd selo && npm run dev ) &
PID=$!
sleep 5
kill ${PID}
npm i selo -S
# docker rm -f serverlesscms_cmsdev_1
# rm -f public/assets/js/app.js
