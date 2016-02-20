#!/usr/bin/env python

from os import path
import json
from collections import OrderedDict

from flask import Flask, request, render_template

import settings
from pianobar_control import PianobarControl 


app = Flask('Pianobar Client',
        template_folder=settings.ROOT_DIR+'/templates',
        static_folder=settings.ROOT_DIR+ '/static')

control = ''
control = PianobarControl()

def get_current_song():
    with open(settings.HISTORY_PATH, 'r') as f:
        current_song = json.loads(f.read())
        return current_song

@app.route("/")
def root():
    current_song = get_current_song()
    current_station_name = current_song['stationName']
    current_station_id = 0
    c = 0
    stations = OrderedDict()
    while True:
        key = 'station' + str(c)
        try:
            stations[str(c)]=current_song[key]
        except KeyError:
            break
        if current_song[key] == current_station_name:
            current_station_id = c
        c +=1

    return render_template('index.html',
            cover_art_src=current_song['coverArt'],
            artist=current_song['artist'],
            album=current_song['album'],
            title=current_song['title'],
            stations=stations,
            current_station_id=current_station_id
            )

@app.route("/play", methods=['GET', 'POST'])
def play():
    control.play()
    return json.dumps(get_current_song())

@app.route("/pause", methods=['GET', 'POST'])
def pause():
    control.pause()
    return json.dumps(get_current_song())

@app.route("/lower_volume", methods=['GET', 'POST'])
def lower_volume():
    control.lower_volume()
    return json.dumps(get_current_song())

@app.route("/raise_volume", methods=['GET', 'POST'])
def raise_volume():
    control.raise_volume()
    return json.dumps(get_current_song())

@app.route("/next", methods=['GET', 'POST'])
def next():
    control.next()
    return json.dumps(get_current_song())

@app.route("/get_info", methods=['GET', 'POST'])
def get_info():
    return json.dumps(get_current_song())

@app.route("/change_station/<station_id>", methods=['GET', 'POST'])
def change_station(station_id):
    control.change_station(station_id)
    return json.dumps(get_current_song())

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5067, debug=True)
