var socket,
    orientationListener,
    mozOrientationListener,
    power = 1;

(function() {
    var url = "http://172.20.2.126:8080";
    socket = io.connect(url);

    var gameDiv = document.getElementById('gameDiv');
    var canvas = document.getElementById('myCanvas');
    var ctx = canvas.getContext('2d');
    var instructionsDiv = document.getElementById('instructionsDiv');


    socket.on('playersReady', function (data) {
        if(data==1){
            instructionsDiv.innerHTML = "Wait for player nr. 2!";
        }
        if(data==2){
            instructionsDiv.innerHTML = "";
        }
    });

    socket.on('update', function (data) {
        ctx.clearRect(0, 0, 500, 400);
        ctx.beginPath();
        ctx.arc(data.nballX, data.nballY, 10, 0, Math.PI*2, true);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle="black";
        ctx.fillRect(data.nfirstX, data.nfirstY, 10, 40);
        ctx.fillRect(data.nsecondX, data.nsecondY, 10, 40);
    });
    socket.on('test', function (data) {
        console.log(data);
    });
    socket.on('setWon', function (data) {
        if (data) {
            ctx.clearRect(0, 0, 500, 400);
            $('#againButton').css('display', 'block');
            instructionsDiv.innerHTML = data[0]+"  :  "+data[1];
        }
        window.removeEventListener(orientationListener);
        window.removeEventListener(mozOrientationListener);
    });


    document.onkeydown = function(evt) {
        evt = evt || window.event;
        var charCode = evt.keyCode || evt.which;
        console.log(charCode);
        socket.emit('moved', charCode);
    };


    $('#againButton').on('click', function () {
        console.log("uuesti");
        socket.emit('again', 1);
        $('#againButton').css('display', 'none');
    });







    if (window.DeviceOrientationEvent) {
        orientationListener = window.addEventListener('deviceorientation', function(eventData) {
            var tiltFB = eventData.beta;
            tiltFB = -0.5*(Math.round(tiltFB));
            if (window.DeviceMotionEvent) {
                window.addEventListener('devicemotion', function (evtData) {
                    var acceleration = eventData.accelerationIncludingGravity;
                    power = Math.round(acceleration.x);
                }, false);
            }
            var mobileData = [tiltFB, power];

            socket.emit('mobileMoved', mobileData);
        }, false);
    } else if (window.OrientationEvent) {
        mozOrientationListener = window.addEventListener('MozOrientation', function(eventData) {
            var tiltFB = eventData.y * -90;
            tiltFB = -0.5*(Math.round(tiltFB));
            if (window.DeviceMotionEvent) {
                window.addEventListener('devicemotion', function (evtData) {
                    var acceleration = eventData.accelerationIncludingGravity;
                    power = Math.round(acceleration.x);
                }, false);
            }
            var mobileData = [tiltFB, power];
            socket.emit('mobileMoved', mobileData);
        }, false);
    }





})();