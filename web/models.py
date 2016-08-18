from __future__ import unicode_literals

from django.db import models
from django.conf import settings
from django.contrib.auth.models import User


class Thing(models.Model):
    name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta():
        abstract = True

    def __str__(self):
        return '%s' %self.name


class Artist(Thing):
    description = models.TextField(null=True, blank=True)


class Album(Thing):
    year = models.DateField(null=True, blank=True)
    img_url = models.URLField(null=True, blank=True)


class Song(Thing):
    artist = models.ForeignKey(Artist)
    album = models.ForeignKey(Album)
    notes = models.TextField(null=True, blank=True)


class History(models.Model):
    song = models.ForeignKey(Song)
    station_name = models.CharField(max_length=255)
    listened_at = models.DateTimeField(auto_now_add=True)

    class Meta():
        get_latest_by = 'listened_at'

    def __str__(self):
        return '%s listened to at %s' %(str(self.song), self.listened_at)

    @staticmethod
    def export(x):
        def dict_callback(x):
            return {
                    'song': x.song.name,
                    'artist': x.song.artist.name,
                    'album': x.song.album.name,
                    'listened_at': x.listened_at
                    }
        return map(dict_callback, History.objects.order_by('-listened_at'))
