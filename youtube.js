
function youtubePlayer () {

    return {
        playing: false,
        play: function () {
            var youtubeDIV = document.getElementById('youtubeDIV')
            youtubeIframe = '<iframe id="youtubePLayer" width="560" height="315" src="//www.youtube.com/embed/6NcNu7wvfbk?enablejsapi=1&version=3&playerapiid=ytplayer&autoplay=1" frameborder="0" allowfullscreen></iframe>'
            if (!this.playing) {
                youtubeDIV.innerHTML = youtubeIframe
                this.playing = true
            }
        },
        pause: function () {
            var youtubeDIV = document.getElementById('youtubeDIV')
            youtubeDIV.innerHTML = ''
            this.playing = false
        },
        load: function () {
        },
        currentTime: 0
    }
}

