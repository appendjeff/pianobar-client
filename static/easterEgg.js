'use strict';

$(function() {
    $('.card-image').click(function() {
        var showIpCnt = localStorage.getItem('showIpCnt');
        console.log(showIpCnt);
        if (showIpCnt > 4) {
            localStorage.setItem('showIpCnt', 0);
            // should make server call
            alert('LAN IP: 192.168.10.103');
        }
        else
            localStorage.setItem('showIpCnt', ++showIpCnt);
    });
});
