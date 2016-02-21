function main(stationId) {
    // Global variables
    var stationId = stationId;

    // Set initial state
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

    /*
     * Functions
     */

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

    // complement
    temprgb=thisrgb;
    temphsv=RGB2HSV(temprgb);
    temphsv.hue=HueShift(temphsv.hue,180.0);
    temprgb=HSV2RGB(temphsv);

    function RGB2HSV(rgb) {
        hsv = new Object();
        max=max3(rgb.r,rgb.g,rgb.b);
        dif=max-min3(rgb.r,rgb.g,rgb.b);
        hsv.saturation=(max==0.0)?0:(100*dif/max);
        if (hsv.saturation==0) hsv.hue=0;
        else if (rgb.r==max) hsv.hue=60.0*(rgb.g-rgb.b)/dif;
        else if (rgb.g==max) hsv.hue=120.0+60.0*(rgb.b-rgb.r)/dif;
        else if (rgb.b==max) hsv.hue=240.0+60.0*(rgb.r-rgb.g)/dif;
        if (hsv.hue<0.0) hsv.hue+=360.0;
        hsv.value=Math.round(max*100/255);
        hsv.hue=Math.round(hsv.hue);
        hsv.saturation=Math.round(hsv.saturation);
        return hsv;
    }

    // RGB2HSV and HSV2RGB are based on Color Match Remix [http://color.twysted.net/]
    // which is based on or copied from ColorMatch 5K [http://colormatch.dk/]
    function HSV2RGB(hsv) {
        var rgb=new Object();
        if (hsv.saturation==0) {
            rgb.r=rgb.g=rgb.b=Math.round(hsv.value*2.55);
        } else {
            hsv.hue/=60;
            hsv.saturation/=100;
            hsv.value/=100;
            i=Math.floor(hsv.hue);
            f=hsv.hue-i;
            p=hsv.value*(1-hsv.saturation);
            q=hsv.value*(1-hsv.saturation*f);
            t=hsv.value*(1-hsv.saturation*(1-f));
            switch(i) {
            case 0: rgb.r=hsv.value; rgb.g=t; rgb.b=p; break;
            case 1: rgb.r=q; rgb.g=hsv.value; rgb.b=p; break;
            case 2: rgb.r=p; rgb.g=hsv.value; rgb.b=t; break;
            case 3: rgb.r=p; rgb.g=q; rgb.b=hsv.value; break;
            case 4: rgb.r=t; rgb.g=p; rgb.b=hsv.value; break;
            default: rgb.r=hsv.value; rgb.g=p; rgb.b=q;
            }
            rgb.r=Math.round(rgb.r*255);
            rgb.g=Math.round(rgb.g*255);
            rgb.b=Math.round(rgb.b*255);
        }
        return rgb;
    }

    //Adding HueShift via Jacob (see comments)
    function HueShift(h,s) { 
        h+=s; while (h>=360.0) h-=360.0; while (h<0.0) h+=360.0; return h; 
    }

    //min max via Hairgami_Master (see comments)
    function min3(a,b,c) { 
        return (a<b)?((a<c)?a:c):((b<c)?b:c); 
    } 
    function max3(a,b,c) { 
        return (a>b)?((a>c)?a:c):((b>c)?b:c); 
    }
}
