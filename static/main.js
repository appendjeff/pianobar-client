'use strict'

var globalStationId;
var colorz = ['cornflowerblue', 'gray', 'aquamarine'];
var tags = [];
var tagCount = 0;

function main(stationId) {
    // Set initial state
    $.ajax({
        type: "POST",
        url: '/get_info',
        success: function(res) {
            var song = JSON.parse(res);
            globalStationId = song['current_station_id'];
            setActiveStation();
            setSongCard(song);
            longPolling({});
        }
    });


    // Event delegation
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
        if (song.current_station_id != globalStationId) {
            globalStationId = song.current_station_id;
            setActiveStation();
        }
        setSongCard(song);
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


    function setSongCard(songObj) {
        $('#songArtist').text(songObj.artist);
        $('#songAlbum').text(songObj.album);
        $('#songTitle').text(songObj.title);
        $('#songCoverArt')[0].src = songObj.coverArt;

        if ('colorz' in songObj)
            colorz = songObj.colorz;
        $('.card-content').css('background-color', colorz[0]);
        $('.card-content').css('color', colorz[2]);
        $('.ctrl-btn').css('background-color', colorz[1]);
        $('.ctrl-btn').css('color', colorz[0]);
        $('#songArtist').css('border-color', colorz[2]);
        $('#songAlbum').css('border-color', colorz[2]);

        $('a.collection-item.station-item').css('background-color', colorz[2]);
        $('a.collection-item.station-item').css('color', colorz[1]);
        $('a.collection-item.station-item.active').css('background-color', colorz[0]);

        $('.color-me').css('color', colorz[0]);
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

        var keyCode = (e === undefined ? false : e.keyCode);
        if (keyCode && [13,32].indexOf(keyCode) != -1) {
            // check if this leads somewhere
            q = q.replace(/ /g,'');
            var tagHash = Math.random().toString();
            var searchTagHTML = '<div class="chip stationSearchTag" data-tag-hash="' + tagHash +'">' + q +
                                '<i class="fa fa-times"></i></div>';
            $('#searchTagContainer').append(searchTagHTML);
            $(".stationSearchTag i").off().click(onSearchTagClick);
            tags.push(q);
            $('#stationSearch').val('');
        }
        stationSearch();
    }
    function stationSearch() {
        var q = $('#stationSearch').val().toLocaleLowerCase();
        if (q === '' && tags.length === 0) {
            $('.station-item').each(function(index, stationEl) {
                $(stationEl).removeClass('stationHidden');
            });
            return;
        }

        $('.station-item').each(function(index, stationEl) {
            var stationText = stationEl.text.toLocaleLowerCase();
            // In future hold more info, like history of song names, artists...
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
    }
}
