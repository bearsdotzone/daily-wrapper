FROM eclipse-temurin:21

ADD mafia.sh mafia.sh
# ADD KoLmafia/scripts/daily-wrapper/main-script-name.js /root/.kolmafia/scripts/daily.js
# ADD GLOBAL_prefs.txt.bak /root/.kolmafia/settings/GLOBAL_prefs.txt
# RUN echo "saveState\nsaveState.bearsdotzone=$KOL_SAVESTATE\nsaveStateActive=true" > /root/.kolmafia/settings/GLOBAL_prefs.txt

RUN apt-get update
RUN apt-get install -y curl jq npm git
RUN chmod +x mafia.sh
# RUN ls scripts/
# RUN echo $HOME

ENTRYPOINT ./mafia.sh
# ENTRYPOINT echo $MAFIASTATE
# ENTRYPOINT ./mafia.sh
# ENTRYPOINT /bin/bash
