#!/usr/bin/env python

from subprocess import call
from sys import platform as _platform

from os import path
import json
from collections import OrderedDict

from flask import Flask, request, render_template

import settings
from pianobar_control import PianobarControl

from colors import get_colors as get_img_url_colors
from get_wiki_data import get_first_p

app = Flask('Pianobar Client',
        template_folder=settings.ROOT_DIR+'/templates',
        static_folder=settings.ROOT_DIR+ '/static')

control = PianobarControl()

def get_current_song():
    with open(settings.HISTORY_PATH, 'r') as f:
        current_song = json.loads(f.read())
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
    current_song['stations'] = stations
    current_song['current_station_id'] = current_station_id
    return current_song

@app.route("/")
def root():
    current_song = get_current_song()

    return render_template('index.html',
            cover_art_src=current_song['coverArt'],
            artist=current_song['artist'],
            album=current_song['album'],
            title=current_song['title'],
            stations=current_song['stations'],
            current_station_id=current_song['current_station_id'],
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

@app.route("/get_colors", methods=['GET', 'POST'])
def get_colors():
    img_url = request.json['imgUrl']
    colorz = get_img_url_colors(img_url)
    return json.dumps({'colorz': colorz})

@app.route("/artist_info", methods=['GET', 'POST'])
def get_artist_info():
    current_song = get_current_song()
    artist = current_song['artist']
    p_tag = get_first_p(artist)
    return json.dumps({
        'p_tag': p_tag,
        'artist': artist
        })

if __name__ == "__main__":
    url = '%s://%s:%d/'%(settings.PROTOCOL, settings.DOMAIN, settings.PORT)
    OPEN = True
    if OPEN and (_platform == "linux" or _platform == "linux2"):
        call(['xdg-open', url])
    elif OPEN and _platform == "darwin":
        call(['open', url])
    elif OPEN:
        print("Bill Gates sucks")
    app.run(host=settings.DOMAIN, port=settings.PORT, debug=False)
