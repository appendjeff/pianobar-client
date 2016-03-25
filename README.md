# Pianobar Client

This software creates a web interface for [Pianobar]. The responsive material design makes it perfect to use on both your phone or your huge 27 inch monitor.


### Installation
Get yourself [pianobar], if you haven't already. Make sure that pianobar is running.
```sh
pianobar
```

Besides pianobar, the requirments are python's Flask and Pillow. Once pianobar is running smoothly Flask must be installed.

```sh
pip install flask
```

(Optional - for cool dynamic theme) Then get [Pillow] from this source:
https://pillow.readthedocs.org/en/3.0.0/installation.html

Clone this repo to where it will be stored. On ubuntu I store it in ~/src
```sh
cd path/to/repo/pwd
git clone https://github.com/appendjeff/pianobar-client.git
cd pianobar-client
```
Pianobar writes to a config file on certain events. Let's tell pianobar where the repo is stored.
```sh
touch ~/.config/pianobar/config
echo "event_command = path/to/repo/pianobar-client/handlePianoEvent.py" >> ~/.config/pianobar/config
```
That should about do it. Now run the following two processes in seperate terminal windows.
```sh
pianobar
```
```sh
path/to/repo/pianobar-client.py
```

### Tech

This pianobar client uses a couple of open source projects to work properly:

* [Pianobar] - console client for the web radio Pandora.
* [Flask] - web microframework for python.
* [jQuery] - fast, small, and feature-rich JavaScript library.
* [Pillow] - python image libary

And of course this pianobar client itself is open source.

License
----

MIT

**Free Software, Hell Yeah!**

### ToDo
  - Create setup script
  - move to a database. SQLite seems like a good choice


[//]: # (These are reference links used in the body of this note and get stripped out when the markdown processor does its job. There is no need to format nicely because it shouldn't be seen. Thanks SO - http://stackoverflow.com/questions/4823468/store-comments-in-markdown-syntax)


   [Pianobar]: <https://github.com/PromyLOPh/pianobar>
   [jQuery]: <http://jquery.com>
   [Flask]: <http://flask.pocoo.org/>
   [Pillow]: <https://pillow.readthedocs.org/en/3.0.0/index.html>


