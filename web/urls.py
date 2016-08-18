from django.conf.urls import include, url
from . import views

urlpatterns = [
    url(r'artistShit', views.get_artist_info, name='get_artist_info'),
    url(r'info', views.get_info, name='get_info'),
    url(r'history', views.get_history, name='get_history'),
    url(r'colors', views.get_colors, name='get_colors'),
    url(r'^action', views.action , name='action'),
    url(r'^$', views.index, name='index'),
]
