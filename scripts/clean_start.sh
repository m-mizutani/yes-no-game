#!/bin/sh

rm data/user.msg
sudo PORT=80 DEBUG=yes-no-game node-dev app.js
