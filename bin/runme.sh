#!/bin/bash

if [ -n "$(which pianobar)" ]; then
    echo "Pianobar is awesome"
else
    echo "You must install pianobar first!"
    echo "https://github.com/PromyLOPh/pianobar"
    exit 1
fi

pushd `dirname $0` > /dev/null
SCRIPTPATH=`pwd -P`
popd > /dev/null
repodir="$(dirname $SCRIPTPATH)"

touch $repodir/pianobar-client/.history.json
touch ~/.config/pianobar/config
echo "event_command = $repodir/pianobar-client/handlePianoEvent.py" >> ~/.config/pianobar/config
pip install -r requirements.txt
exit 0
