#!/usr/bin/env python

import os
import sys
import json

import settings
from colors import get_colors

if sys.argv[1] == 'songstart':
    event = {}
    for line in sys.stdin.readlines():
        try:
            key,value = line.split('=')
            event[key] = value.strip()
        except ValueError:
            pass

    img_src = event['coverArt']
    img_dir = os.path.join(os.path.split(os.path.abspath(__file__))[0], 'static', 'img')
    # try to do k-means clustering to get top 3 colors
    try:
        event['colorz'] = get_colors(event['coverArt'])
    except IOError:
        # The client uses hexes, so try to keep colorz as hex
        event['colorz'] = ['#FFFFFF', '#F6CA2C', '#000000']
        event['coverArt'] = 'static/images/no_cover_art.png'

    with open(settings.HISTORY_PATH, 'w') as f:
        f.write(json.dumps(event))
