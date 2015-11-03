/*jslint browser: true */
"use strict";
var controls = {
    play: function () {
        return;
    },
    pause: function () {
        return;
    },
    load: function () {
        return;
    },
    currentTime: 0
};

var youtubePlayer = function () {
    return controls;
};


var onYouTubeIframeAPIReady = function () {
    var player,
        onPlayerStateChange;

    onPlayerStateChange = function (event) {
        if (event.data === YT.PlayerState.PLAYING) {
            console.log(event.target.getVideoUrl());
            document.getElementById('youtubeURL').value = event.target.getVideoUrl();
        }
    };
   
   /*global YT: false */
    player = new YT.Player('youtubeDIV', {
        height: '390',
        width: '640',
        videoId: '6NcNu7wvfbk',
        events: {
            'onStateChange': onPlayerStateChange
        }
    });

    controls.play = function () {
        var youtubeURL, videoID, ampersandPosition;

        youtubeURL = document.getElementById('youtubeURL').value;

        if (!youtubeURL || youtubeURL === player.getVideoUrl()) {
            return player.playVideo();
        }

        videoID = youtubeURL.split('v=')[1];

        ampersandPosition = videoID.indexOf('&');

        if (ampersandPosition !== -1) {
            videoID = videoID.substring(0, ampersandPosition);
        }

        player.loadVideoById(videoID);
    };

    controls.pause = function () {
        //player.pauseVideo();
    };

    controls.currentTime = 0;
};



