'use strict'

/*
 * Globals
 *
 */
var globalStationId;
var globalSong;
var colorz = ['#000000', '#e7e7e7', '#ffffff'];
var tags = [];
var isPaused = false;
var isHistoryShown = false;
var lastArtistLookup = 'Not Bob Dylan'
var oldBorder = {};
var historyPageIndex = 0;
var isAppendHistoryFinished = false;
var blurbs = {};


function main(stationId) {
    /*
     * Set initial state
     */
    $.ajax({
        type: "GET",
        url: '/info',
        success: function(songObj) {
            globalSong = songObj;
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
            eventDelegation();
        }
    });


    /*
     * Event delegation
     */
    function eventDelegation() {
      $('body').keyup(onBodyKeyPressUp);
      $('.wikipediaActionBtn').click(onCardContent)
      $('.changeColorBtn').click(shuffleColorTheme)
      $('#play').click(onPlay);
      $('#pause').click(onPause);
      $('#next').click(onNext);
      $('#lowerVolume').click(onLowerVolume);
      $('#raiseVolume').click(onRaiseVolume);
      $('.station-item').click(onStationItem);
      $('.station-item:not(.active)').mouseenter(onStationMouseEnter);
      $('.station-item:not(.active)').mouseleave(onStationMouseLeave);
      $('.collection-header').click(onCollectionHeaderClick);
      $('#stationSearch').on('keyup', onStationSearch);
      $('.stationSearchTag i').keyup(onSearchTagClick);
      $('#currentSongContainer').mouseenter(scrollToCurrentStation);
      $('#dumpImage').click(onDumpImage);
      $('#coverArtContainer').hover(onCoverArtIn, onCoverArtOut);

      $('.card-content').hover(onCardContentIn, onCardContentOut);

      $('#navStations').click(tearDownHistory);
      $('#navHistory').click(setHistory);
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

    function onBodyKeyPressUp(el) {
      if (event.target.tagName === 'INPUT') {
        return false;
      }
      if (el.keyCode == 75) { // Play/Pause on K
          (isPaused ? onPlay() : onPause());
          isPaused = !isPaused
      }
      if (el.keyCode == 76) // Next Song on L
          onNext();
    }

    function shuffleColorTheme() {
        /*
         * Try only one (speed) attempt at random shuffle. If it
         * fails, then just rotate array.
         * Set colorz on finish.
         */
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
        var colorzAreSame = false;
        for (var i=0;i<colorz.length;i++) {
            if (colorz[i] == oldColorz[i])
                colorzAreSame = true;
        }
        if (colorzAreSame)
            colorz.unshift(colorz.pop())
        setColorz();
    }

    function onPlay() {
        $.ajax({
            type: "POST",
            url: '/action',
            data: {actionType: 'play'},
            success: function(res) {
                isPaused = false;
                Materialize.toast('playing', 2000);
            }
        });
    };

    function onPause() {
        $.ajax({
            type: "POST",
            url: '/action',
            data: {actionType: 'pause'},
            success: function(res) {
                isPaused = true;
                Materialize.toast('paused', 2000)
            }
        });
    };

    function onNext() {
        $.ajax({
            type: "POST",
            url: '/action',
            data: {actionType: 'next'},
            success: function(song) {
                pollThenSet(song);
                Materialize.toast('next', 2000)
            }
        });
    };

    function onLowerVolume() {
        $.ajax({
            type: "POST",
            url: '/action',
            data: {actionType: 'lower_volume'},
            success: function(song) {
                Materialize.toast('a little softer now', 2000)
            }
        });
    };

    function onRaiseVolume() {
        $.ajax({
            type: "POST",
            url: '/action',
            data: {actionType: 'raise_volume'},
            success: function(song) {
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
            url: '/action',
            data: {
                'actionType': 'change_station',
                'actionArg': candStationId
            },
            beforeSend: function() {
                Materialize.toast('changing station', 2000);
            },
            success: function(song) {
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
        $('.card .card-content').css('background-color', colorz[0]);
        $('.ctrl-btn').css('color', colorz[0]);
        $('.color-me').css('color', colorz[0]);
        $('.stationSearchTag').css('color', colorz[0]);
        $('#addStationIcon').css('color', colorz[0]);
        $('.navTab i').css('color', colorz[0]);

        $('.ctrl-btn').css('background-color', colorz[1]);
        $('#songTitle').css('color', colorz[1]);
        $('a.collection-item.station-item').css('color', colorz[1]);
        $('#addStation').attr('style', 'background-color:' + colorz[1] +' !important');
        $('.navTab').attr('style', 'background-color:' + colorz[1] +' !important');


        $('.cardContentBorder').css('border-color', colorz[2]);
        $('a.collection-item.station-item').css('background-color', colorz[2]);
        $('body').css('background-color', colorz[2]);
        $('.stationSearchTag').css('background-color', colorz[2]);
        $('.card .card-content').css('color', colorz[2]);

        // Move to general form soon
        $('.colorz-c-0').css('color', colorz[0]);
        $('.colorz-c-1').css('color', colorz[1]);
        $('.colorz-c-2').css('color', colorz[2]);
        $('.colorz-bc-0').css('background-color', colorz[0]);
        $('.colorz-bc-1').css('background-color', colorz[1]);
        $('.colorz-bc-2').css('background-color', colorz[2]);

        $('.navTabActive').attr('style', 'background-color:' + colorz[0] +' !important');
        $('.navTabActive i').css('color', colorz[1]);

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
            type: "GET",
            url: '/info',
            success: function(newSongObj) {
                if (isHistoryShown) {
                    setTimeout(setHistory, 100);
                }
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
            type: "GET",
            url: '/info',
            success: function(newSongObj) {
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
        else if (q === 'history') {
            return setHistory();
        }
        else if (keyCode && [13].indexOf(keyCode) != -1 && q.length > 0) {
            // Create a tag
            var tagHash = Math.random().toString();
            var searchTagHTML = '<div class="chip stationSearchTag" data-tag-hash="' + tagHash +'">' + q +
                                '<i class="fa fa-times"></i></div>';
            $('#searchTagContainer #minorTags').append(searchTagHTML);
            $(".stationSearchTag i").off().click(onSearchTagClick);
            tags.push(q);
            $('#stationSearch').val('');
        }
        else if (q.length <= 0) {
            $('#stationSearch').val('');
        }
        stationSearch();
    }

    function appendHistory() {
        /*
         * Infinite scrolling for history. Uses global historyPageIndex
         *
         * Todo - cache values
         */
        isAppendHistoryFinished = false;
        $.get('/history?historyPageIndex='+historyPageIndex, function(res) {
			var $historyList = $("ul.historyList");
			var $historyListItem;
			var historyValues = res['history'];
			for (var i=0; i<historyValues.length; i++) {
				$historyListItem = $("<li>", {class: "history colorz-c-0 colorz-bc-1"});
				$historyListItem.text(historyValues[i].song);
				$historyListItem.attr('data-artist', historyValues[i].artist);
				$historyListItem.attr('data-play-count', historyValues[i].play_count);
				$historyListItem.attr('data-song', historyValues[i].song);
                $historyListItem.hover(function() {
                        $(this).text($(this).attr('data-artist'));
                    }, function() {
                        $(this).text($(this).attr('data-song'));
                });
				$historyList.append($historyListItem);
			}
            historyPageIndex += 1;
            setColorz();
            isAppendHistoryFinished = true;
        });
    }

    function onHistoryScroll() {
        var two = $(this).prop('scrollHeight') - $(this).innerHeight();
        var one = $(this).scrollTop();
        if (two - one < 50 && isAppendHistoryFinished) {
            appendHistory();
        }
    }

    function setHistory() {
        $('.navTab').removeClass('navTabActive');
        $('#navHistory').addClass('navTabActive');
        setColorz();
        isHistoryShown = true;
        $('#addStation').addClass('hidden');
        $('#stationItems').addClass('hidden');
        $('#majorTagContainer').removeClass('hidden');

        //$('#stationSearch').prop('disabled', true)
        $('#searchTagContainer #minorTags').addClass('majorTagVisible');
        $('#stationItems').height(0)

		var $historyList = $("<ul>", {'class': 'historyList'});
        $('#tagItemContainer').on('scroll', onHistoryScroll);
		$('#majorTagContainer').html($historyList);
        appendHistory()
    }

    function tearDownHistory() {
        isHistoryShown = false;
        historyPageIndex = 0;
        $('#tagItemContainer').off('scroll');
        $('.navTab').removeClass('navTabActive');
        $('#navStations').addClass('navTabActive');
        $('#stationItems').height(400)
        $('#majorTagContainer').empty();
        $('#stationItems').removeClass('hidden');
        $('#addStation').removeClass('hidden');

        $('#stationSearch').val('')
        setColorz();
        stationSearch();
        $('#stationSearch').prop('disabled', false)
        $('#stationSearch').prop('disabled', false)
        $('#searchTagContainer #majorTags').empty();
        $('#searchTagContainer #minorTags').removeClass('majorTagVisible');
        setTimeout(scrollToCurrentStation, 300);
    }

    function stationSearch() {
        var q = $('#stationSearch').val();

        var matchedStationIds = _.map(window.fuse.search(q), function(x) {
          return x.id;
        })

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
                // Tags are exact searches for now - should prob move to fuse
                if (stationText.indexOf(tag) != -1) {
                    $(stationEl).removeClass('stationHidden');
                    shouldStationBeHidden = false;
                }
            }
            //if (q.length > 0 && stationText.indexOf(q) != -1) {
            if (q.length > 0 && matchedStationIds.indexOf(index)!= -1) {
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
        setColorz();
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

    function getNewImgUrl() {
      var staticImages = [
        'http://img0.ndsstatic.com/wallpapers/04dbf37c754695d278e606de4849d1a7_large.jpeg',
        //'http://richestcelebrities.org/wp-content/uploads/2014/09/Bob-Dylan-Net-Worth.jpg',
        'http://wordsinthebucket.com/wp-content/uploads/2015/02/Bob-Dylan-Like-a-Rolling-Stone.jpg',
        'http://cps-static.rovicorp.com/3/JPG_400/MI0003/995/MI0003995354.jpg?partner=allrovi.com',
        'http://www.mybeatlescollection.com/images/asknat/beatles69.jpg',
        'http://images5.fanpop.com/image/photos/30100000/CCR-creedence-clearwater-revival-30167437-464-472.jpg',
        'http://www.blogcdn.com/www.joystiq.com/media/2009/03/ccr4whowillstoprain.jpg'
      ];
      return staticImages[Math.floor(Math.random() * staticImages.length)];
    }

    function onDumpImage() {
      // Set height of container
      var height = $('#coverArtContainer').height();
      $('#coverArtContainer').css('min-height', height + 'px');
      var secondCleanup = 0;
      function cleanUp() {
        secondCleanup++;
        if (secondCleanup === 2) {
          $('#coverArtContainer').css('min-height', '0px');
        }
      }

      var initialWidth = $('#songCoverArt').width()
      var dmpImgPos = $('#dumpImage').position();

      var newImgUrl = getNewImgUrl();
      $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: "/colors",
        data: JSON.stringify({imgUrl: newImgUrl}),
        success: function (data) {
          colorz = data.colorz;
          setColorz();
        },
        dataType: "json"
      });

      var img = new Image();
      img.onload = function() {
        cleanUp();
      }
      img.src = newImgUrl;

      $("#songCoverArt").animate({
          top: dmpImgPos.top + "px",
          left: dmpImgPos.left + "px",
          width: "3px",
          opacity: .1
      }, 1000, function() {
        $("#songCoverArt").attr("src", '');
        $("#songCoverArt").attr("src", newImgUrl);
        $("#songCoverArt").animate({
            top: "0px",
            left: "9px",
            width: "97%",
            opacity: .2
        }, 50, function() {
          cleanUp();
          $("#songCoverArt").animate({
            left: "0px",
            opacity: 1,
            width: "100%",
          }, 800);
        });
      });
    }

    function onCoverArtIn() {
      $('#dumpImage').removeClass('hidden');
    }

    function onCoverArtOut() {
      $('#dumpImage').addClass('hidden');
    }

    function onCardContentIn() {
        // Follow colors from
        if (!oldBorder.padding) {
            oldBorder.padding = $('.cardContentBorder').css('padding');
            oldBorder.borderWidth= $('.cardContentBorder').css('border-top-width');
        }
        var newPadding = parseInt(oldBorder.padding) - parseInt(oldBorder.borderWidth);
        $('.cardContentBorder').animate({
            'padding': newPadding + 'px',
            'border-width': 0
        }, 300);
        $('.card .card-content').css('color', colorz[0]);
    }

    function onCardContentOut() {
        $('.cardContentBorder').animate({
            'padding': oldBorder.paddding,
            'border-width': oldBorder.borderWidth
        }, 300);
        $('.card .card-content').css('color', colorz[2]);
    }

    function onCardContent() {
      function onArtistInfo() {
          var artistInfoLength = $('#artistInfoText').html().length;
          if (artistInfoLength < 150) {
            Materialize.toast('Wikipedia article not found', 2000);
            return false;
          }
          $('#artistInfoModal').openModal({
            dismissible: true,
            complete: function() {
                for (var blurbTitle in blurbs) {
                    blurbs[blurbTitle].remove();
                }
            }
          });
      }
      if (lastArtistLookup !== globalSong.artist) {
          $.get('/artistShit', function(artistInfo) {
              $('#artistInfoText').html(artistInfo.p_tag);
              $('#artistInfoName').html(artistInfo.artist + ' is cool');
              onArtistInfo();
              lastArtistLookup = globalSong.artist;
              setWikiHover($('#artistInfoText a'));
          });
      }
      else {
          onArtistInfo();
      }
    }

    function setWikiHover(wiki_a_tag_els) {
        /*
         * For each wikipedia link this function adds snippet hover info.
         *
         *
         *
         * TODO : Header
         *      - Add sitemap for header this --- Artha Franklin -> Billboard (truncate where needed)
         *      - Add close button
         *
         * TODO : Blurb
         *      - Make blurb persitent. Allow for multiple blurbs open at once. (Windows!!!)
         *      - Make the blurbs draggable.
         *
         */
        blurbs = {};
        var wiki_a_el;
        var destroyTooltips = {};
        var baseWikiAPIUrl = 'https://en.wikipedia.org/w/api.php?action=query' +
            '&prop=extracts&format=json&exintro=&callback=?&titles=';


        function setBlurb(blurbTitle, blurbText, topVal, leftVal) {
            /*
             * Set Blurb text and other onEvents
             */
            if (!blurbText || blurbText.length < 10)
                return;

            var blurbHeader = $('<div class="blurb-header">This is the header. Pin to keep.</div>');
            var blurbContent = $(document.createElement('div'));
            blurbContent.addClass('blurb-content');
            blurbContent.html(blurbText);

            blurbs[blurbTitle] = $(document.createElement('div'));
            blurbs[blurbTitle].css({top: topVal, left: leftVal});
            blurbs[blurbTitle].addClass('blurb');
            blurbs[blurbTitle].html(blurbHeader);


            blurbs[blurbTitle].append(blurbContent);
            blurbs[blurbTitle].mouseleave(function() {
                blurbs[blurbTitle].fadeOut(function() {
                    blurbs[blurbTitle].remove();
                });
            });
            $('#blurbContainer').html(blurbs[blurbTitle].fadeIn());
            setTimeout(function() {
                if (destroyTooltips[blurbTitle] === true) {
                    destroyTooltips[blurbTitle] = false;
                }
            }, 300);
        }

        function wikiHoverOn() {
            var blurbTitle = this.href.split('/').slice(-1)[0];
            destroyTooltips[blurbTitle] = true;
            var topVal = $(this).offset().top + 17;
            var leftVal = $(this).offset().left;
            var candBlurbText = localStorage.getItem(
                    'wikiText' + blurbTitle);
            if (!candBlurbText) {
                $.getJSON(baseWikiAPIUrl + blurbTitle, function(res) {
                    var blurbText;
                    for (var first in res.query.pages) {
                        blurbText = res.query.pages[first].extract;
                        break;
                    }
                    // Save the wikipedia API some bandwidth
                    localStorage.setItem(
                            'wikiText' + blurbTitle, blurbText);
                    setBlurb(blurbTitle, blurbText, topVal, leftVal);
                });
            }
            else {
                setBlurb(blurbTitle, candBlurbText, topVal, leftVal);
            }
        }

        for (var i=0;i<wiki_a_tag_els.length;i++) {

            // Since we are adding custom alt text, remove title
            wiki_a_tag_els[i].removeAttribute('title');
            wiki_a_el = $(wiki_a_tag_els[i]);
            if (wiki_a_el.attr('href').indexOf('wikipedia') !== -1) {

                // Add the hover handler to each wiki tag
                $(wiki_a_el).hover(wikiHoverOn, function() {

                    var blurbTitle = this.href.split('/').slice(-1)[0];
                    if (destroyTooltips[blurbTitle]) {
                        if (blurbs[blurbTitle]) {
                            blurbs[blurbTitle].remove();
                        }
                        delete destroyTooltips[blurbTitle];
                    }
                });
            }
        }
    }
}
