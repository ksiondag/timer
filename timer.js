/*jslint browser: true */
'use strict';
var zero_fill = function (length, number) {
    var number_string = String(number);
    while (number_string.length < length) {
        number_string = '0' + number_string;
    }
    return number_string;
};

var two_digit = function (number) {
    return zero_fill(2, number);
};

var secondsParse = function (seconds) {
    return {
        seconds: seconds % 60,
        minutes: Math.floor((seconds % 3600) / 60),
        hours: Math.floor(seconds / 3600)
    };
};

var inputParse = function (input) {
    var parse = zero_fill(6, input);

    return {
        seconds: Number(parse.slice(4, 6)),
        minutes: Number(parse.slice(2, 4)),
        hours: Number(parse.slice(0, 2))
    };
};

var hhmmssToSeconds = function (hhmmss) {
    var timer, seconds;

    timer = inputParse(hhmmss);

    seconds = timer.seconds;
    seconds += timer.minutes * 60;
    seconds += timer.hours * 3600;

    return seconds;
};

var currentTime = function () {
    return Math.floor(new Date().getTime() / 1000);
};

var displayTimer = function (timer) {
    var htmlHours, htmlMinutes, htmlSeconds;

    htmlHours = two_digit(timer.hours);
    document.getElementById('hours').innerHTML = htmlHours;
    document.title = htmlHours + ':';

    htmlMinutes = two_digit(timer.minutes);
    document.getElementById('minutes').innerHTML = htmlMinutes;
    document.title += htmlMinutes + ':';

    htmlSeconds = two_digit(timer.seconds);
    document.getElementById('seconds').innerHTML = htmlSeconds;
    document.title += htmlSeconds;
};

/*global Audio: false */
var audioAssets = function () {
    var audio, asset;

    audio = {
        allemande: new Audio('assets/Allemande.ogg'),
        //allemande: youtubePlayer(),
        tenMinutes: new Audio('assets/10m_remaining.ogg'),
        fiveMinutes: new Audio('assets/5m_remaining.ogg'),
        oneMinute: new Audio('assets/1m_remaining.ogg'),
        thirtySeconds: new Audio('assets/30s_remaining.ogg'),
        finalCountdown: new Audio('assets/final_countdown.ogg')
    };

    for (asset in audio) {
        if (audio.hasOwnProperty(asset)) {
            audio[asset].load();
        }
    }

    return audio;
};

var playAudioCue = function (audio, seconds, alarmAtSecond, id) {
    var checkbox = document.getElementById(id);

    if (checkbox.checked && seconds === alarmAtSecond) {
        audio[id].play();
    }
};

var setupAlarm = function () {
    var audio = audioAssets();

    return {
        play: function (seconds) {
            // Final alarm playing edge case logic
            if (seconds <= 0) {
                seconds = 0;
            } else {
                audio.allemande.pause();
                audio.allemande.currentTime = 0;
            }

            playAudioCue(audio, seconds, 0, 'allemande');
            playAudioCue(audio, seconds, 10, 'finalCountdown');
            playAudioCue(audio, seconds, 30, 'thirtySeconds');
            playAudioCue(audio, seconds, 60, 'oneMinute');
            playAudioCue(audio, seconds, 300, 'fiveMinutes');
            playAudioCue(audio, seconds, 600, 'tenMinutes');
        },
        stop: function () {
            var asset;
            for (asset in audio) {
                if (audio.hasOwnProperty(asset)) {
                    audio[asset].pause();
                    audio[asset].currentTime = 0;
                }
            }
        }
    };
};

var alarm = setupAlarm();

var stopTimer = function (timer) {
    alarm.stop();
    if (timer.countdownID !== -1) {
        clearInterval(timer.countdownID);
        timer.countdownID = -1;
    }
};

var countdown = function (timer) {
    var updateOnSecond = function () {
        var seconds;
        seconds = timer.expiresAt - Math.floor(new Date().getTime() / 1000);

        if (seconds <= 0) {
            seconds = 0;
            stopTimer(timer);
            setTimeout(stopTimer, 5000, timer);
        }

        alarm.play(seconds);
        displayTimer(secondsParse(seconds));
    };

    return updateOnSecond;
};

var startOrPause = function (timer) {
    if (timer.input) {
        timer.remaining = hhmmssToSeconds(timer.input);
        timer.expiresAt = -1;
        timer.input = '';
    }

    if (timer.expiresAt !== -1) {
        timer.remaining = timer.expiresAt - currentTime();
        timer.expiresAt = -1;

        stopTimer(timer);
    } else if (timer.remaining !== -1) {
        timer.expiresAt = currentTime() + timer.remaining;
        timer.remaining = -1;
        timer.countdownID = setInterval(countdown(timer), 1000);
    }
};

var timerInput = function (timer, keyInput) {
    stopTimer(timer);
    timer.input += keyInput;
    while (timer.input.length > 6) {
        timer.input = timer.input.slice(1, timer.input.length);
    }
    displayTimer(inputParse(timer.input));
};

window.onload = function () {

    // Timer functionality
    var timer = {
        remaining: 5 * 60,
        expiresAt: -1,
        countdownID: -1,
        input: ''
    };
    displayTimer(secondsParse(timer.remaining));
    document.addEventListener('keydown', function (e) {
        if (e.keyCode === 13 || e.keyCode === 32) {
            // Enter key has been pressed, start/pause countdown timer
            startOrPause(timer);
        } else if (e.keyCode === 8) {
            // Backspace key pressed, don't go back in browser history
            e.preventDefault();
            timer.input = timer.input.slice(0, timer.input.length - 1);
            displayTimer(inputParse(timer.input));
        } else if (e.keyCode >= 48 && e.keyCode <= 57) {
            // If top row number keys are pressed, start setting timer
            timerInput(timer, e.keyCode - 48);
        } else if (e.keyCode >= 96 && e.keyCode <= 105) {
            // If number pad keys are pressed, start setting timer
            timerInput(timer, e.keyCode - 96);
        }
    });

};

