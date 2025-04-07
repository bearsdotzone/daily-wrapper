#!/bin/sh
curl -fLsgo kolmafia.jar $(curl -fsg 'https://api.github.com/repos/kolmafia/kolmafia/releases/latest' | jq -r '.assets[] | select(.browser_download_url | contains(".jar")).browser_download_url')
mkdir -p /root/.kolmafia/settings/
echo "saveState\nsaveState.bearsdotzone=$KOL_SAVESTATE\nsaveStateActive=true" > /root/.kolmafia/settings/GLOBAL_prefs.txt
git clone https://github.com/bearsdotzone/daily-wrapper.git
cd /daily-wrapper || return
npm install -g yarn
yarn install
yarn build
mkdir -p /root/.kolmafia/scripts/
cp KoLmafia/scripts/daily-wrapper/main-script-name.js /root/.kolmafia/scripts/daily.js
cd /
java -jar kolmafia.jar --CLI /root/.kolmafia/scripts/daily.js
if [ -f "/root/.kolmafia/data/output.txt" ]; then
  curl -X POST --data "@/root/.kolmafia/data/output.txt" --header 'Content-Type: application/json' $KOL_WEBHOOK
fi
