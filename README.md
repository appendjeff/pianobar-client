# Pianobar Client

This is a web client to further enjoy [Pianobar]. The responsive material design makes it perfect to use on both your phone or your huge 27 inch monitor. It also uses clustering to make the color theme dynamically based off of the cover art image.

![Example of software](https://i.gyazo.com/accc7030b24228fa72e1079e24bcb797.png)

### Installation
Get yourself [pianobar], if you haven't already. Make sure that pianobar is running and that you can login to you pandora account.

Clone this repo and run the install script. I will create configure this for docker by the end of the summer.
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
python manage.py runserver 5067
```

### Tech

This pianobar client uses a couple of open source projects to work properly:

* [Pianobar] - console client for the web radio Pandora.
* [Pillow] - python image libary for the dynamic color themes based on cover art
* [Django] - The web framework for perfectionists with deadlines
* [jQuery] - fast, small, and feature-rich JavaScript library.
* [Materialize]- Material design library

And of course this pianobar client itself is open source.

License
----

MIT

**Free Software, Hell Yeah!**


[//]: # (These are reference links used in the body of this note and get stripped out when the markdown processor does its job. There is no need to format nicely because it shouldn't be seen. Thanks SO - http://stackoverflow.com/questions/4823468/store-comments-in-markdown-syntax)


   [Pianobar]: <https://github.com/PromyLOPh/pianobar>
   [jQuery]: <http://jquery.com>
   [Django]: <https://www.djangoproject.com/>
   [Pillow]: <https://pillow.readthedocs.org/en/3.0.0/index.html>
   [Materialize]: <http://materializecss.com/>

