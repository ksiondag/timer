
function zero_fill (length, number) {
    var number_string = '' + number
    while (number_string.length < length) {
        number_string = '0' + number_string
    }
    return number_string
}

function two_digit (number) {
    return zero_fill(2,number)
}

function secondsParse (seconds) {
    return {
        seconds: seconds%60,
        minutes: Math.floor((seconds%3600)/60),
        hours: Math.floor(seconds/3600)
    }
}

function inputParse (input) {
    var parse = zero_fill(6,input)

    return {
        seconds: Number(parse.slice(4,6)),
        minutes: Number(parse.slice(2,4)),
        hours: Number(parse.slice(0,2))
    }
}

function hhmmssToSeconds (hhmmss) {
    var timer = inputParse(hhmmss)
    seconds = timer.seconds
    seconds += timer.minutes*60
    seconds += timer.hours*3600

    return seconds
}

function currentTime () {
    return Math.floor(new Date().getTime()/1000)
}

function displayTimer (timer) {
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

function countdown (expiresAt) {
    var updateOnSecond = function () {
        var seconds = expiresAt - Math.floor(new Date().getTime()/1000)

        if (seconds < 0) {
            seconds = 0
        }

        alarm.play(seconds)
        displayTimer(secondsParse(seconds))
    }

    return updateOnSecond
}

function stopTimer (timer) {
    if (timer.countdownID !== -1) {
        alarm.stop()
        clearInterval(timer.countdownID)
        timer.countdownID = -1
    }
}

function startOrPause (timer) {
    if (timer.input) {
        timer.remaining = hhmmssToSeconds(timer.input)
        timer.expiresAt = -1
        timer.input = ''
    }

    if (timer.expiresAt != -1) {
        timer.remaining = timer.expiresAt - currentTime()
        timer.expiresAt = -1

        stopTimer(timer)
    }
    else if (timer.remaining != -1) {
        timer.expiresAt = currentTime() + timer.remaining
        timer.remaining = -1
        timer.countdownID = setInterval(countdown(timer.expiresAt), 1000)
    }
}

function timerInput (timer, keyInput) {
    stopTimer(timer)
    timer.input += keyInput
    displayTimer(inputParse(timer.input))
}

function audioAssets () {
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

function playAudioCue (audio, seconds, alarmAtSecond, id) {
    var checkbox = document.getElementById(id)

    if (checkbox.checked && seconds === alarmAtSecond) {
        audio[id].play()
    }
}

function setupAlarm () {
    var audio = audioAssets()

    return {
        play: function (seconds) {
            // Final alarm playing edge case logic
            if (seconds <= 0) {
                seconds = 0
            }
            else {
                audio.allemande.pause()
                audio.allemande.currentTime = 0
            }

            playAudioCue(audio, seconds, 0, 'allemande')
            playAudioCue(audio, seconds, 10, 'finalCountdown')
            playAudioCue(audio, seconds, 30, 'thirtySeconds')
            playAudioCue(audio, seconds, 60, 'oneMinute')
            playAudioCue(audio, seconds, 300, 'fiveMinutes')
            playAudioCue(audio, seconds, 600, 'tenMinutes')
        },
        stop: function () {
            for (var asset in audio) {
                audio[asset].pause()
                audio[asset].currentTime = 0
            }
        }
    }
}

var alarm = setupAlarm()

window.onload = function () {
    
    // Timer functionality
    var timer = {
        remaining: 5*60,
        expiresAt: -1,
        countdownID: -1,
        input: ''
    }
    displayTimer(secondsParse(timer.remaining))
    document.addEventListener('keydown', function (e) {
        // Enter key has been pressed, start/pause countdown timer
        if (e.keyCode === 13 || e.keyCode === 32) {
            startOrPause(timer)
        }

        // Backspace key pressed, don't go back in browser history
        else if (e.keyCode === 8) {
            e.preventDefault()
            timer.input = timer.input.slice(0,timer.input.length-1)
        }

        // If top row number keys are pressed, start setting timer
        else if (e.keyCode >= 48 && e.keyCode <= 57) {
            timerInput(timer, e.keyCode - 48)
        }
        // If number pad keys are pressed, start setting timer
        else if (e.keyCode >= 96 && e.keyCode <= 105) {
            timerInput(timer, e.keyCode - 96)
        }
    })

}

