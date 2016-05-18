'use strict'

var globalStationId;
var globalSong;
var colorz = ['#000000', '#e7e7e7', '#ffffff'];
var tags = [];
var isPaused = false;

var awesomplete; 

function main(stationId) {
    /*
     * Set initial state
     */
    $.ajax({
        type: "POST",
        url: '/get_info',
        success: function(res) {
            globalSong = JSON.parse(res);
            globalStationId = globalSong['current_station_id'];
            setActiveStation();
            setSongCard();
            longPolling({});

            var awesomList = [];
            for (var key in globalSong) {
                if (key.search(/station\d/) != -1) {
                    awesomList.push(globalSong[key]);
                }
            }
            var searchInput = document.getElementById('stationSearch');
            awesomplete = new Awesomplete(searchInput, {
                minChars: 2,
                list: awesomList
            });
            eventDelegation();
        }
    });


    /*
     * Event delegation
     */
    function eventDelegation() {
      $('body').keyup(onKeyPressUp);
      $('#changeColor').click(shuffleColorTheme)
      $('#play').click(onPlay);
      $('#pause').click(onPause);
      $('#next').click(onNext);
      $('#lowerVolume').click(onLowerVolume);
      $('#raiseVolume').click(onRaiseVolume);
      $('.station-item').click(onStationItem);
      $('.station-item:not(.active)').mouseenter(onStationMouseEnter) 
      $('.station-item:not(.active)').mouseleave(onStationMouseLeave);
      $('.collection-header').click(onCollectionHeaderClick);
      $('#stationSearch').on('keyup', onStationSearch);
      $('.stationSearchTag i').keyup(onSearchTagClick);
      $('#currentSongContainer').mouseenter(scrollToCurrentStation);
    }


    /*
     * Functions
     */
    function update(song) {
        globalSong = song;
        if (song.current_station_id != globalStationId) {
            globalStationId = song.current_station_id;
            setActiveStation();
        }
        setSongCard();
    }

    function onKeyPressUp(el) {
      if (event.target.tagName === 'INPUT') {
        return false;
      }
      if (el.keyCode == 75) {
          (isPaused ? onPlay() : onPause());
          isPaused = !isPaused
      }
      if (el.keyCode == 76)
          onNext();
    }

    function shuffleColorTheme() {
        function shuffle() {
            var j, x, i;
            for (i = colorz.length; i; i -= 1) {
                j = Math.floor(Math.random() * i);
                x = colorz[i - 1];
                colorz[i - 1] = colorz[j];
                colorz[j] = x;
            }
            return colorz;
        }
        var oldColorz = colorz.slice();
        shuffle();
        if (oldColorz !== colorz)
            setColorz();
        else {
            console.log(oldColorz, colorz);
            shuffleColorTheme();
        }
    }

    function onPlay() {
        $.ajax({
            type: "POST",
            url: '/play',
            success: function(res) {
                isPaused = false;
                Materialize.toast('playing', 2000);
            }
        });
    };

    function onPause() {
        $.ajax({
            type: "POST",
            url: '/pause',
            success: function(res) {
                isPaused = true;
                Materialize.toast('paused', 2000)
            }
        });
    };

    function onNext() {
        $.ajax({
            type: "POST",
            url: '/next',
            success: function(res) {
                var song = JSON.parse(res);
                pollThenSet(song);
                Materialize.toast('next', 2000)
            }
        });
    };

    function onLowerVolume() {
        $.ajax({
            type: "POST",
            url: '/lower_volume',
            success: function(res) {
                Materialize.toast('a little softer now', 2000)
            }
        });
    };

    function onRaiseVolume() {
        $.ajax({
            type: "POST",
            url: '/raise_volume',
            success: function(res) {
                Materialize.toast('a little louder now', 2000)
            }
        });
    };

    function onStationItem() {
        var station = this;
        var candStationId = station.dataset.stationId;
        if (candStationId == globalStationId)
            return;
        $.ajax({
            type: "POST",
            url: '/change_station/' + candStationId,
            beforeSend: function() {
                Materialize.toast('changing station', 2000);
            },
            success: function(res) {
                var song = JSON.parse(res);
                globalStationId = parseInt(candStationId);
                setActiveStation();
                pollThenSet(song);
            }
        });
    };

    function setActiveStation() {
        $('.station-item').each(function(index, stationEl) {
            $(stationEl).removeClass('active');
            if (index == globalStationId) {
                $(stationEl).addClass('active');
            }
        });
    };

    function setSongCard() {
        $('#songArtist').text(globalSong.artist);
        $('#songAlbum').text(globalSong.album);
        $('#songTitle').text(globalSong.title);
        $('#songCoverArt')[0].src = globalSong.coverArt;
        if ('colorz' in globalSong)
            colorz = globalSong.colorz;
        try {
            colorz = sortByGrayScale(colorz);
        }
        catch(err) {
            // currently sortByGrayScale only supports hex
        }
        setColorz();

    }

    function setColorz() {
        $('.color-me-back').css('background-color', colorz[0]);
        $('.card-content').css('background-color', colorz[0]);
        $('.ctrl-btn').css('color', colorz[0]);
        $('.color-me').css('color', colorz[0]);
        $('.stationSearchTag').css('color', colorz[0]);
        $('#addStationIcon').css('color', colorz[0]);

        $('.ctrl-btn').css('background-color', colorz[1]);
        $('#songTitle').css('color', colorz[1]);
        $('a.collection-item.station-item').css('color', colorz[1]);
        $('#addStation').attr('style', 'background-color:' + colorz[1] +' !important');

        $('#songArtist').css('border-color', colorz[2]);
        $('#songAlbum').css('border-color', colorz[2]);
        $('a.collection-item.station-item').css('background-color', colorz[2]);
        $('body').css('background-color', colorz[2]);
        $('.stationSearchTag').css('background-color', colorz[2]);
        $('.card-content').css('color', colorz[2]);

        // Move to general form soon
        $('.colorz-c-0').css('color', colorz[0]);
        $('.colorz-c-1').css('color', colorz[1]);
        $('.colorz-c-2').css('color', colorz[2]);
        $('.colorz-bc-0').css('background-color', colorz[0]);
        $('.colorz-bc-1').css('background-color', colorz[1]);
        $('.colorz-bc-2').css('background-color', colorz[2]);

        $('a.collection-item.station-item.active').css('background-color', colorz[0]);
        return colorz;
    }

    function onStationMouseEnter() {
        if (this.dataset.stationId == globalStationId)
            return;
        $(this).css('color',colorz[0]);
        $(this).css('background-color',colorz[1]);
    }

    function onStationMouseLeave() {
        if (this.dataset.stationId == globalStationId)
            return;
        $(this).css('color',colorz[1]);
        $(this).css('background-color',colorz[2]);
    }

    function pollThenSet(songObj) {
        $.ajax({
            type: "POST",
            url: '/get_info',
            success: function(res) {
                var newSongObj = JSON.parse(res);
                if (newSongObj.title == songObj.title) {
                    // Until a notification system is in place
                    // polling is the best option.
                    setTimeout(function() {
                        pollThenSet(newSongObj);
                    }, 300);
                }
                else {
                    update(newSongObj);
                }
            }
        });
    }

    function longPolling(songObj) {
        var waitingPeriod = 1000;
        $.ajax({
            type: "POST",
            url: '/get_info',
            success: function(res) {
                var newSongObj = JSON.parse(res);

                if (newSongObj.stationName != songObj.stationName) {
                  setTimeout(function() {
                    scrollToCurrentStation();
                  }, 500);
                }

                if (newSongObj.title == songObj.title) {
                    setTimeout(function() {
                        longPolling(newSongObj);
                    }, waitingPeriod);
                }
                else {
                    update(newSongObj);
                    setTimeout(function() {
                        longPolling(newSongObj);
                    }, waitingPeriod);
                }
            }
        });
    }

    function onCollectionHeaderClick() {
        $('#stationSearch').focus();
    }

    function onStationSearch(e) {
        var q = $('#stationSearch').val().toLocaleLowerCase();
        //q = q.replace(/ /g,'');
        var keyCode = (e === undefined ? false : e.keyCode);
        if (q === ' ') {
            $('#stationSearch').val('');
            return;
        }
        else if (keyCode && [13].indexOf(keyCode) != -1 && q.length > 0) {
            // Create a tag
            awesomplete.close();
            var tagHash = Math.random().toString();
            var searchTagHTML = '<div class="chip stationSearchTag" data-tag-hash="' + tagHash +'">' + q +
                                '<i class="fa fa-times"></i></div>';
            $('#searchTagContainer').append(searchTagHTML);
            $(".stationSearchTag i").off().click(onSearchTagClick);
            tags.push(q);
            $('#stationSearch').val('');
        }
        else if (q.length <= 0) {
            $('#stationSearch').val('');
        }
        stationSearch();
    }

    function stationSearch() {
        // In future hold more info, like history of song names, artists...
        var q = $('#stationSearch').val().toLocaleLowerCase();
        if (q === '' && tags.length === 0) {
            $('.station-item').each(function(index, stationEl) {
                $(stationEl).removeClass('stationHidden');
            });
            return;
        }
        $('.station-item').each(function(index, stationEl) {
            var stationText = stationEl.text.toLocaleLowerCase();
            var shouldStationBeHidden = true;
            for (var tagId=0;tagId<tags.length;tagId++) {
                var tag = tags[tagId];
                if (stationText.indexOf(tag) != -1) {
                    $(stationEl).removeClass('stationHidden');
                    shouldStationBeHidden = false;
                }
            }
            if (q.length > 0 && stationText.indexOf(q) != -1) {
                $(stationEl).removeClass('stationHidden');
                shouldStationBeHidden = false;
            }
            else if ($(stationEl).hasClass('active')) {
                $(stationEl).removeClass('stationHidden');
                shouldStationBeHidden = false;
            }
            else if (shouldStationBeHidden) {
                $(stationEl).addClass('stationHidden');
            }
        });
    }

    function onSearchTagClick() {
        var tag = $(this.parentElement);
        var tagId = -1;
        $('.stationSearchTag').each(function(index, otherTag) {
            otherTag = $(otherTag);
            if (tag.data()['tagHash'] === otherTag.data()['tagHash']) {
                tagId = index;
            }
        });
        tag.remove();
        tags.splice(tagId, 1);
        stationSearch();
        setTimeout(function() {
          scrollToCurrentStation();
        }, 300);
    }

    function hexToGray(hex) {
        // When ambitious, add function _toGray() for input not as hex
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return (parseInt(result[1], 16),parseInt(result[2], 16),parseInt(result[3], 16))/3
    }

    function sortByGrayScale(hexArr) {
        var mappedColors = hexArr.map(function(hex) {
            return {
                gray: hexToGray(hex),
                color: hex
            };
        });
        mappedColors.sort(function(a, b){return a.gray-b.gray});
        return mappedColors.map(function(x) {return x.color;});
    }

    function scrollToCurrentStation() {
        var container = $('#stationItems');
        var scrollTo = $('.active');
        container.animate({
              scrollTop: scrollTo.offset().top - container.offset().top + container.scrollTop()
        });
    }
}
