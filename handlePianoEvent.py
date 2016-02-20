#!/usr/bin/env python

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

    # do k-means clustering to get top 3 colors
    event['colorz'] = get_colors(event['coverArt'])

    with open(settings.HISTORY_PATH, 'w') as f:
        f.write(json.dumps(event))

    # enqueue .mp3 via youtube-dl
    # dequeue oldest non-saved .mp3 -- unless n < 10
