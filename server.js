var io = require('socket.io'),
	connect = require('connect');
var fs = require('fs');
var ballX = 100;
var ballY = 100;
var ballXVel = 2.5;
var ballYVel = 2.5;

var firstX = 0,
	firstY = 180,
	secondX = 490,
	secondY = 180,
	paddleSpeed = 5;
	p1_score = 0,
	p2_score = 0,
	power = 1;

var game,
	speedCheck,
	firstReadyAgain = false,
	secondReadyAgain = false;



var app = connect().use(connect.static('public')).listen(8080);
var repeating = io.listen(app);

var socketArray = [];

repeating.sockets.on('connection', function(socket){
    socketArray.push(socket);
    if (socketArray.length==2) {
    	socket.emit('playersReady', socketArray.length);
		game = setInterval(sendUpdate, 16);

		listenMovement();
		listenIfPlayAgain();

    } else{
    	socket.emit('playersReady', 1);
    };


});

function sendUpdate () {
	if (ballX+ballXVel>secondX)
        if (ballY+ballYVel>=secondY && ballY+ballYVel<secondY+40) {
            ballXVel = -ballXVel;
            changeVelocity();

    	}
    if (ballX+ballXVel<=firstX+10)
        if (ballY+ballYVel>firstY && ballY+ballYVel<firstY+40) {
            ballXVel = -ballXVel;
            changeVelocity();

        }

	ballX = ballX + ballXVel;
	ballY = ballY + ballYVel;
	if (ballY > 390){
		ballY = 390; 
		ballYVel = -ballYVel; 
	} else if (ballY < 8){
		ballY = 8; 
		ballYVel = -ballYVel; 
	}
	//if (ballX > 490){ ballX = 490; ballXVel = -ballXVel; } else if (ballX < 8){ ballX = 8; ballXVel = -ballXVel; }
	
	if (ballX + ballXVel > 500) {
        p1_score++;
        clearInterval(game);
        sendScore();
        return;
    }
    if (ballX - ballXVel < 0 ) {
        p2_score++;
        clearInterval(game);
        sendScore();
        return;
    }

	json = {
		type: 'update',
		nballX: ballX,
		nballY: ballY,
		nfirstX: firstX,
		nfirstY: firstY,
		nsecondX: secondX,
		nsecondY: secondY
            };
	
	repeating.sockets.emit('update', json);
}

function listenMovement () {
	keyboardMovement();
	mobileMovement();
}

function keyboardMovement () {
	socketArray[0].on("moved", function (keycode) {
			if(keycode=='38'){
				if (firstY-paddleSpeed<0) {
					firstY = 0;
				} else{
					firstY -= paddleSpeed;
				};

			}
			else if(keycode=='40'){
				if (firstY+paddleSpeed>360) {
					firstY = 360;
				} else{
					firstY += paddleSpeed;
				};
			}
		});
		socketArray[1].on("moved", function (keycode) {
			if(keycode=='38'){
				if (secondY-paddleSpeed<0) {
					secondY = 0;
				} else{
					secondY -= paddleSpeed;
				};
			}
			else if(keycode=='40'){
				if (secondY+paddleSpeed>360) {
					secondY = 360;
				} else{
					secondY += paddleSpeed;
				};
			}
		});
}

function mobileMovement () {
	socketArray[0].on("mobileMoved", function (value) {
		firstY += value[0];
		if (firstY < 0) {
			firstY = 0;
		}else if(firstY>360){
			firstY = 360;
		}
		power = value[1];

	});
	socketArray[1].on("mobileMoved", function (value) {
		secondY += value[0];
		if (secondY < 0) {
			secondY = 0;
		}else if(secondY>360){
			secondY = 360;
		}
		power = value[1];
	});


}

function sendScore () {
        var score = [p1_score, p2_score];
        repeating.sockets.emit('setWon', score);
}

function listenIfPlayAgain () {
	socketArray[0].on('again', function (data) {
    	firstReadyAgain = true;
    	console.log(firstReadyAgain);
    	if (firstReadyAgain==true && secondReadyAgain==true) {
	    	ballX = 100;
			ballY = 100;
			firstY = 180;
			secondY = 180;
			console.log("start again");
			firstReadyAgain=false;
			secondReadyAgain=false;
			game = setInterval(sendUpdate, 16);
			listenMovement();
	    };
    });
    socketArray[1].on('again', function (data) {
    	secondReadyAgain = true;
    	console.log(secondReadyAgain);
    	if (firstReadyAgain==true && secondReadyAgain==true) {
	    	ballX = 100;
			ballY = 100;
			firstY = 180;
			secondY = 180;
			console.log("start again");
			firstReadyAgain=false;
			secondReadyAgain=false;
			game = setInterval(sendUpdate, 16);
			listenMovement();
	    };
    });

}

function changeVelocity () {
	if (power<=1) {
		power = 1;
		
	} else {
		speedCheck = setInterval(changePowerBack, 1000);
	}

}

function changePowerBack () {
		if (power>1) {
			ballXVel = 0.5*power*ballXVel;
			ballYVel = 0.5*power*ballYVel;
			power = 0.8*power;
		} else{
			clearInterval(speedCheck);
		};
}