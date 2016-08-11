# Pianobar Client

This is a web app to control pandora via [Pianobar]. The responsive material design makes it perfect to use on both your phone or your huge 27 inch monitor.

### Installation
Get yourself [pianobar], if you haven't already. Make sure that pianobar is running and that you can login to you pandora account.
```sh
pianobar
```

Clone this repo and run the install script.
```sh
git clone https://github.com/appendjeff/pianobar-client.git
cd pianobar-client
./bin/runme.sh
```

That should about do it. Now run the following two processes in seperate terminal windows.
```sh
pianobar
```
```sh
./pianobar-client/runserver.py
```

### Tech

This pianobar client uses a couple of open source projects to work properly:

* [Pianobar] - console client for the web radio Pandora.
* [Flask] - web microframework for python.
* [Pillow] - python image libary for the dynamic color themes based on cover art
* [Materialize]- Material design library
* [jQuery] - fast, small, and feature-rich JavaScript library.

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
   [Materialize]: <http://materializecss.com/>

