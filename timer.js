
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

$(document).ready(function () {
    var audio = new Audio('assets/Allemande.ogg')
    var hours = 0
    var minutes = 0
    var seconds = 0
    var input = '500'

    var updateTimer = function () {
        if (input) {
            var parse = zero_fill(6,input)
            seconds = Number(parse.slice(4,6))
            minutes = Number(parse.slice(2,4))
            hours = Number(parse.slice(0,2))
        }

        $('#hours').html(two_digit(hours))
        $('#minutes').html(two_digit(minutes))
        $('#seconds').html(two_digit(seconds))
        $(document).attr('title', $('#hours').html()+':'+$('#minutes').html()+':'+$('#seconds').html())
    }

    setInterval(function() {
        if (!input) {
            if (seconds > 59) {
                seconds -= 60
                minutes += 1
            }
            if (minutes > 59) {
                minutes -= 60
                hours += 1
            }
            if (seconds > 0) {
                seconds -= 1
            }
            else if (minutes > 0) {
                seconds = 59
                minutes -= 1
            }
            else if (hours > 0) {
                seconds = 59
                minutes = 59
                hours -= 1
            }

            if (seconds === 0 && minutes === 0 && hours === 0) {
                audio.play()
            }
            else {
                audio.pause()
                audio.currentTime = 0
            }
        }
        else {
            audio.pause()
            audio.currentTime = 0
        }
        updateTimer()
    }, 1000)

    $(document).keydown(function (e) {
        //console.log(e.keyCode)
        if (e.keyCode === 13) {
            input = ''
        }
        else if (e.keyCode === 8) {
            e.preventDefault()
            input = input.slice(0,input.length-1)
        }
        else if (e.keyCode >= 48 && e.keyCode <= 57) {
            input += (e.keyCode - 48)
        }
        else if (e.keyCode >= 96 && e.keyCode <= 105) {
            input += (e.keyCode - 96)
        }

        updateTimer()

        console.log(e.keyCode)
    })
})

