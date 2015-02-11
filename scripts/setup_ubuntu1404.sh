#!/bin/bash

sudo apt-get update -y
sudo apt-get install -y python-software-properties
sudo add-apt-repository -y ppa:chris-lea/node.js
sudo apt-get update -y
sudo apt-get upgrade -y
sudo apt-get install -y build-essential cmake libev4 libev-dev libpcap-dev git libmsgpack-dev libmsgpack3 zlib1g-dev libssl-dev  libreadline-dev imagemagick
sudo apt-get install nodejs git graphviz -y

git clone https://github.com/m-mizutani/yes-no-game.git
cd yes-no-game && npm install

