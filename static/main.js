'use strict'

var globalStationId;
var globalSong;
var colorz = ['#000000', '#e7e7e7', '#ffffff'];
var tags = [];

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
        }
    });

    /*
     * Event delegation
     */
    $('#play').click(onPlayBtn);
    $('#pause').click(onPauseBtn);
    $('#next').click(onNextBtn);
    $('#lowerVolume').click(onLowerVolumeBtn);
    $('#raiseVolume').click(onRaiseVolumeBtn);
    $('.station-item').click(onStationItem);
    $('.station-item:not(.active)').mouseenter(onStationMouseEnter) 
    $('.station-item:not(.active)').mouseleave(onStationMouseLeave);
    $('.collection-header').click(onCollectionHeaderClick);
    $('#stationSearch').on('keyup', onStationSearch);
    $('.stationSearchTag i').keyup(onSearchTagClick);

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

    function onPlayBtn() {
        $.ajax({
            type: "POST",
            url: '/play',
            success: function(res) {
                update(JSON.parse(res))
                Materialize.toast('playing', 2000);
            }
        });
    };

    function onPauseBtn() {
        $.ajax({
            type: "POST",
            url: '/pause',
            success: function(res) {
                Materialize.toast('paused', 2000)
            }
        });
    };

    function onNextBtn() {
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

    function onLowerVolumeBtn() {
        $.ajax({
            type: "POST",
            url: '/lower_volume',
            success: function(res) {
                Materialize.toast('a little softer now', 2000)
            }
        });
    };

    function onRaiseVolumeBtn() {
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
        $('.card-content').css('background-color', colorz[0]);
        $('.card-content').css('color', colorz[2]);
        $('.ctrl-btn').css('background-color', colorz[1]);
        $('.ctrl-btn').css('color', colorz[0]);
        $('#songArtist').css('border-color', colorz[2]);
        $('#songAlbum').css('border-color', colorz[2]);
        $('#songTitle').css('color', colorz[1]);
        $('a.collection-item.station-item').css('background-color', colorz[2]);
        $('a.collection-item.station-item').css('color', colorz[1]);
        $('a.collection-item.station-item.active').css('background-color', colorz[0]);
        $('.color-me').css('color', colorz[0]);
        $('.color-me-back').css('background-color', colorz[0]);
        $('body').css('background-color', colorz[2]);
        $('.stationSearchTag').css('background-color', colorz[2]);
        $('.stationSearchTag').css('color', colorz[0]);
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
            setSongCard();
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
        setSongCard();
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
}
