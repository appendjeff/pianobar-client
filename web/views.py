import json
from collections import OrderedDict

from django.shortcuts import render
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.exceptions import ObjectDoesNotExist

from models import Artist, Album, Song, History

from pianobar_control import PianobarControl
from colors import get_colors as get_img_url_colors
from get_wiki_data import get_first_p


def set_db(current_song):
    artist, _ = Artist.objects.get_or_create(name=current_song.get('artist'))
    album, _ = Album.objects.get_or_create(
            name=current_song.get('album'),
            img_url=current_song.get('coverArt'))
    song, new_song = Song.objects.get_or_create(artist=artist, album=album,
            name=current_song.get('title'))

    try:
        last_song = History.objects.latest().song
    except History.DoesNotExist:
        # When there is no history yet ..
        History.objects.create(song=song,
                station_name=current_song.get('stationName'))
    else:
        if last_song != song:
            History.objects.create(song=song,
                station_name=current_song.get('stationName'))
            song.increment_play_count()


def get_current_song():

    # change this open to something from models
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

    set_db(current_song)
    return current_song


def index(request):
    current_song = get_current_song()


    things = dict(
        cover_art_src=current_song['coverArt'],
        artist=current_song.get('artist'),
        album=current_song.get('album'),
        title=current_song.get('title'),
        stations=current_song.get('stations').items(),
        current_station_id=current_song['current_station_id'],
    )
    return render(request, 'web/index.html', things)


def get_history(request):
    return JsonResponse({'history': History.export(1)})


def get_info(request):
    return JsonResponse(get_current_song())


def get_artist_info(request):
    current_song = get_current_song()
    artist = current_song['artist']
    p_tag = get_first_p(artist)
    return JsonResponse({'p_tag': p_tag, 'artist': artist})


@csrf_exempt
def get_colors(request):
    img_url = request.POS.get('imgUrl')
    colorz = get_img_url_colors(img_url)
    return JsonResponse({'colorz': colorz})


@csrf_exempt
def action(request):
    """
    Call the pianobar controller to perform an action.
    Allows for arg support for some actions.
    """
    action_type = request.POST.get('actionType')
    action_arg = request.POST.get('actionArg')
    pianobar_controller = PianobarControl()
    pianobar_controller.perform_action(action_type, action_arg)
    return JsonResponse(get_current_song())
