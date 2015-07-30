/*jslint browser: true */
'use strict';
var zeroFill = function (length, number) {
    var numberString = String(number);
    while (numberString.length < length) {
        numberString = '0' + numberString;
    }
    return numberString;
};

var twoDigit = function (number) {
    return zeroFill(2, number);
};

var secondsParse = function (seconds) {
    return {
        seconds: seconds % 60,
        minutes: Math.floor((seconds % 3600) / 60),
        hours: Math.floor(seconds / 3600)
    };
};

var inputParse = function (input) {
    var parse = zeroFill(6, input);

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

    htmlHours = twoDigit(timer.hours);
    document.getElementById('hours').innerHTML = htmlHours;
    document.title = htmlHours + ':';

    htmlMinutes = twoDigit(timer.minutes);
    document.getElementById('minutes').innerHTML = htmlMinutes;
    document.title += htmlMinutes + ':';

    htmlSeconds = twoDigit(timer.seconds);
    document.getElementById('seconds').innerHTML = htmlSeconds;
    document.title += htmlSeconds;
};

/*global Audio: false */
var audioAssets = function () {
    var audio, asset;

    /*global youtubePlayer: false */
    audio = {
        //expiredTimer: new Audio('assets/expiredTimer.ogg'),
        expiredTimer: youtubePlayer(),
        tenMinutes: new Audio('assets/10mRemaining.ogg'),
        fiveMinutes: new Audio('assets/5mRemaining.ogg'),
        oneMinute: new Audio('assets/1mRemaining.ogg'),
        thirtySeconds: new Audio('assets/30sRemaining.ogg'),
        finalCountdown: new Audio('assets/finalCountdown.ogg')
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
        audio[id].currentTime = 0;
        audio[id].play();
    }
};

var setupAlarm = function () {
    var audio = audioAssets();

    return {
        play: function (seconds) {
            playAudioCue(audio, seconds, 0, 'expiredTimer');
            playAudioCue(audio, seconds, 10, 'finalCountdown');
            playAudioCue(audio, seconds, 30, 'thirtySeconds');
            playAudioCue(audio, seconds, 60, 'oneMinute');
            playAudioCue(audio, seconds, 300, 'fiveMinutes');
            playAudioCue(audio, seconds, 600, 'tenMinutes');
        },
        stop: function (audioName) {
            var asset;
            if (audio.hasOwnProperty(audioName)) {
                audio[audioName].pause();
            } else if (audioName === undefined) {
                for (asset in audio) {
                    if (audio.hasOwnProperty(asset)) {
                        audio[asset].pause();
                    }
                }
            }
        }
    };
};

var alarm = setupAlarm();

var stopTimer = function (timer) {
    clearInterval(timer.countdownID);
    timer.countdownID = -1;
};

var repeatTimer = function (timer) {
    timer.expiresAt = currentTime() + timer.originalValue;
};

var stopOrRepeatTimer = function (timer) {
    var checkbox = document.getElementById('repeat');

    if (checkbox.checked) {
        repeatTimer(timer);
        setTimeout(alarm.stop, 5000, 'expiredTimer');
    } else {
        stopTimer(timer);
    }
};

var countdown = function (timer) {
    var updateOnSecond = function () {
        var seconds;
        seconds = timer.expiresAt - Math.floor(new Date().getTime() / 1000);

        if (seconds <= 0) {
            seconds = 0;
            stopOrRepeatTimer(timer);
        }

        alarm.play(seconds);
        displayTimer(secondsParse(seconds));
    };

    return updateOnSecond;
};

var startOrPause = function (timer) {
    if (timer.input) {
        timer.originalValue = hhmmssToSeconds(timer.input);
        timer.remaining = timer.originalValue;
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
        originalValue: 5 * 60,
        remaining: 5 * 60,
        expiresAt: -1,
        countdownID: -1,
        input: ''
    };
    displayTimer(secondsParse(timer.remaining));
    document.addEventListener('keydown', function (e) {
        if (e.keyCode === 13 || e.keyCode === 32) {
            // Enter/space key has been pressed, start/pause countdown timer
            alarm.stop();
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

