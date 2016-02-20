function main(stationId) {
    setActiveStation(stationId);
    onPlayBtn();

    // Event delegation
    $('#stationSearch').on('keyup', onStationSearch);
    $('#play').click(onPlayBtn);
    $('#pause').click(onPauseBtn);
    $('#next').click(onNextBtn);
    $('#lowerVolume').click(onLowerVolumeBtn);
    $('#raiseVolume').click(onRaiseVolumeBtn);
    $('.station-item').click(function(e) {onStationItem(e);});
    $('.station-item:not(.active)').hover(function(e) {
        $(e.currentTarget).css('color',colorz[0]);
        $(e.currentTarget).css('background-color',colorz[1]);
    }, function(e) {
        $(e.currentTarget).css('color',colorz[1]);
        $(e.currentTarget).css('background-color',colorz[2]);
    });
}

function onPlayBtn() {
    $.ajax({
        type: "POST",
        url: '/play',
        success: function(res) {
            song = JSON.parse(res);
            Materialize.toast('playing', 2000);
            setSongCard(song);
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
            song = JSON.parse(res);
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

function onStationItem(e) {
    var station = e.currentTarget;
    if (station.dataset.stationId == stationId)
        return;
    stationId = station.dataset.stationId
    $.ajax({
        type: "POST",
        url: '/change_station/' + stationId,
        beforeSend: function() {
            Materialize.toast('changing station', 2000);
        },
        success: function(res) {
            song = JSON.parse(res);
            setActiveStation(stationId);
            pollThenSet(song);
        }
    });
};

function onStationSearch(e) {
    var q = e.currentTarget.value.toLocaleLowerCase();
    $('.station-item').each(function(index, stationEl) {
        var stationText = stationEl.text.toLocaleLowerCase();
        // In future hold more info, like history of song names, artists...
        if (stationText.indexOf(q) == -1) {
            $(stationEl).addClass('stationHidden');
        }
        else {
            $(stationEl).removeClass('stationHidden');
        }
    });
}

function setActiveStation(stationId) {
    $('.station-item').each(function(index, stationEl) {
        $(stationEl).removeClass('active');
        if (index == stationId) {
            $(stationEl).addClass('active');
        }
    });
};

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
                setSongCard(newSongObj);
            }
        }
    });
}

function setSongCard(songObj) {
    $('#songArtist').text(songObj.artist);
    $('#songAlbum').text(songObj.album);
    $('#songTitle').text(songObj.title);
    $('#songCoverArt')[0].src = songObj.coverArt;

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
}
