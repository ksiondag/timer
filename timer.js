// TODO: Take jQuery out
// It's a thing I assumed I needed just cause, but I don't think I do
// Don't add libraries unless necessary!

function zero_fill(length, number) {
    var number_string = '' + number
    while (number_string.length < length) {
        number_string = '0' + number_string
    }
    return number_string
}

function two_digit(number) {
    return zero_fill(2,number)
}

function timerParse(input) {
    var parse = zero_fill(6,input)

    return {
        seconds: Number(parse.slice(4,6)),
        minutes: Number(parse.slice(2,4)),
        hours: Number(parse.slice(0,2))
    }
}

function audioAssets() {
    var audio = {
        allemande: new Audio('assets/Allemande.ogg'),
        tenMinutes: new Audio('assets/10m_remaining.ogg'),
        fiveMinutes: new Audio('assets/5m_remaining.ogg'),
        oneMinute: new Audio('assets/1m_remaining.ogg'),
        thirtySeconds: new Audio('assets/30s_remaining.ogg'),
        finalCountdown: new Audio('assets/final_countdown.ogg')
    }

    for (var asset in audio) {
        audio[asset].load()
    }

    return audio
}

window.onload = function () {
    var audio = audioAssets()

    var seconds = 0

    var input = '500'

    var updateTimer = function () {
        if (input) {
            var timer = timerParse(input)

            var htmlHours = two_digit(timer.hours)
            document.getElementById('hours').innerHTML = htmlHours
            document.title = htmlHours + ':'

            var htmlMinutes = two_digit(timer.minutes)
            document.getElementById('minutes').innerHTML = htmlMinutes
            document.title += htmlMinutes + ':'

            var htmlSeconds = two_digit(timer.seconds)
            document.getElementById('seconds').innerHTML = htmlSeconds
            document.title += htmlSeconds
        }

        else {
            var htmlHours = two_digit(Math.floor(seconds/3600))
            document.getElementById('hours').innerHTML = htmlHours
            document.title = htmlHours + ':'

            var htmlMinutes = two_digit(Math.floor((seconds%3600)/60))
            document.getElementById('minutes').innerHTML = htmlMinutes
            document.title += htmlMinutes + ':'

            var htmlSeconds = two_digit(seconds%60)
            document.getElementById('seconds').innerHTML = htmlSeconds
            document.title += htmlSeconds
        }
    }

    setInterval(function() {
        if (!input) {
            if (seconds <= 1) {
                audio.allemande.play()
                seconds = 1
            }
            // TODO: only excute if audio cues turned on
            /*
            else if (seconds === 10+1) {
                audio.finalCountdown.play()
            }
            else if (seconds === 30+1) {
                audio.thirtySeconds.play()
            }
            else if (seconds === 60+1) {
                audio.oneMinute.play()
            }
            else if (seconds === 5*60+1) {
                audio.fiveMinutes.play()
            }
            else if (seconds === 10*60+1) {
                audio.tenMinutes.play()
            }
            */
            else {
                audio.allemande.pause()
                audio.allemande.currentTime = 0
            }
            seconds -= 1
        }
        else {
            for (var asset in audio) {
                audio[asset].pause()
                audio[asset].currentTime = 0
            }
        }
        updateTimer()
    }, 1000)

    document.addEventListener("keydown", function (e) {
        //console.log(e.keyCode)

        // Enter key has been pressed, start countdown timer
        if (e.keyCode === 13) {
            var timer = timerParse(input)
            seconds = timer.seconds
            seconds += timer.minutes*60
            seconds += timer.hours*3600

            input = ''
        }
        // Backspace key pressed, don't go back in browser history
        else if (e.keyCode === 8) {
            e.preventDefault()
            input = input.slice(0,input.length-1)
        }
        // If top row number keys are pressed, start setting timer
        else if (e.keyCode >= 48 && e.keyCode <= 57) {
            input += (e.keyCode - 48)
        }
        // If number pad keys are pressed, start setting timer
        else if (e.keyCode >= 96 && e.keyCode <= 105) {
            input += (e.keyCode - 96)
        }

        // TODO: Too much state manipulation, more functional programming
        updateTimer()
    })
}

