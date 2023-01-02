var c = document.getElementById("myCanvas");
var ctx = c.getContext("2d");

let lastTime = 0;
let snakeSize = 20;
let snakeSpeed = 5;
let snakeLenght = 1;

let snakeX = 300;
let snakeY = 200;
let snake = [[300 + snakeSize/2, 200 + snakeSize/2, 1]]

let rightPressed = false;
let leftPressed = false;
let upPressed = true;
let downPressed = false;

let appleExists = false;
let appleX = NaN;
let appleY = NaN;

let gameOver = true;
let pause = false;

let reward = 0;
let state = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

let step1 = true;

let gameMode = 0;

function changeGameMode() {
    gameMode++;
    if (gameMode > 2) {
        gameMode = 0;
    }

    switch (gameMode) {
        case 0:
            document.getElementById("gameModeButton").innerHTML = "MODE: PLAY";
            break;
        case 1:
            document.getElementById("gameModeButton").innerHTML = "MODE: AI PLAY";
            break;
        case 2:
            document.getElementById("gameModeButton").innerHTML = "MODE: AI TRAIN";
            break;
        default:
            document.getElementById("gameModeButton").innerHTML = "MODE: PLAY";
            break;
    }

    snake = [[300 + snakeSize/2, 200 + snakeSize/2, 1]];
    snakeLenght = 1;
    rightPressed = false;
    leftPressed = false;
    upPressed = true;
    downPressed = false;

    appleExists = false;
    appleX = NaN;
    appleY = NaN;

    gameOver = true;

    render();
}

function evaluate_state(state) {
    if (rightPressed) {
        state[4] = 1;
        if (snake[0][0] + snakeSize > c.width) {
            state[0] = 1;
        }
        if (snake[0][1] + snakeSize > c.height) {
            state[1] = 1;
        }
        if (snake[0][1] - snakeSize < 0) {
            state[2] = 1;
        }
        for (var i = 1; i < snakeLenght; i++) {
            if (snake[0][0] == snake[i][0] - snakeSize && snake[0][1] == snake[i][1]) {
                state[0] = 1;
            } else if (snake[0][1] == snake[i][1] - snakeSize && snake[0][0] == snake[i][0]) {
                state[2] = 1;
            } else if (snake[0][1] == snake[i][1] + snakeSize && snake[0][0] == snake[i][0]) {
                state[1] = 1
            }
        }
    }
    else if (leftPressed) {
        state[3] = 1;
        if (snake[0][0] - snakeSize < 0) {
            state[0] = 1;
        }
        if (snake[0][1] + snakeSize > c.height) {
            state[2] = 1;
        }
        if (snake[0][1] - snakeSize < 0) {
            state[1] = 1;
        }
        for (var i = 1; i < snakeLenght; i++) {
            if (snake[0][0] == snake[i][0] + snakeSize && snake[0][1] == snake[i][1]) {
                state[0] = 1;
            } else if (snake[0][1] == snake[i][1] - snakeSize && snake[0][0] == snake[i][0]) {
                state[2] = 1;
            } else if (snake[0][1] == snake[i][1] + snakeSize && snake[0][0] == snake[i][0]) {
                state[1] = 1
            }
        }
    }
    else if (upPressed) {
        state[5] = 1;
        if (snake[0][1] - snakeSize < 0) {
            state[0] = 1;
        }
        if (snake[0][0] - snakeSize < 0) {
            state[2] = 1;
        }
        if (snake[0][0] + snakeSize > c.width) {
            state[1] = 1;
        }
        for (var i = 1; i < snakeLenght; i++) {
            if (snake[0][1] == snake[i][1] + snakeSize && snake[0][0] == snake[i][0]) {
                state[0] = 1;
            } else if (snake[0][0] == snake[i][0] + snakeSize && snake[0][1] == snake[i][1]) {
                state[2] = 1;
            } else if (snake[0][0] == snake[i][0] - snakeSize && snake[0][1] == snake[i][1]) {
                state[1] = 1
            }
        }
    }
    else if (downPressed) {
        state[6] = 1;
        if (snake[0][1] + snakeSize > c.height) {
            state[0] = 1;
        }
        if (snake[0][0] - snakeSize < 0) {
            state[1] = 1;
        }
        if (snake[0][0] + snakeSize > c.width) {
            state[2] = 1;
        }
        for (var i = 1; i < snakeLenght; i++) {
            if (snake[0][1] == snake[i][1] - snakeSize && snake[0][0] == snake[i][0]) {
                state[0] = 1;
            } else if (snake[0][0] == snake[i][0] - snakeSize && snake[0][1] == snake[i][1]) {
                state[2] = 1;
            } else if (snake[0][0] == snake[i][0] + snakeSize && snake[0][1] == snake[i][1]) {
                state[1] = 1
            }
        }
    }

    if (snake[0][0] > appleX) {
        state[7] = 1;
    }
    else if (snake[0][0] < appleX) {
        state[8] = 1;
    }
    if (snake[0][1] > appleY) {
        state[9] = 1;
    }
    else if (snake[0][1] < appleY) {
        state[10] = 1;
    }

    return state;
}

function ai_play() {
    state = evaluate_state(state);

    $.ajax({
        type: "POST",
        url: "http://127.0.0.1:8000/play",  
        data: JSON.stringify({reward: reward, score: snakeLenght - 1, state: state, done: gameOver}),
        contentType: "application/json",
    }).done(function( o ) {
        reward = 0;
        state = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

        if (rightPressed) {
            if (o.move[1] == 1) {
                rightPressed = false;
                leftPressed = false;
                upPressed = false;
                downPressed = true;
            } else if (o.move[2] == 1) {
                rightPressed = false;
                leftPressed = false;
                upPressed = true;
                downPressed = false;
            }
        }
        else if (leftPressed) {
            if (o.move[1] == 1) {
                rightPressed = false;
                leftPressed = false;
                upPressed = true;
                downPressed = false;
            } else if (o.move[2] == 1) {
                rightPressed = false;
                leftPressed = false;
                upPressed = false;
                downPressed = true;
            }
        }
        else if (upPressed) {
            if (o.move[1] == 1) {
                rightPressed = true;
                leftPressed = false;
                upPressed = false;
                downPressed = false;
            } else if (o.move[2] == 1) {
                rightPressed = false;
                leftPressed = true;
                upPressed = false;
                downPressed = false;
            }
        }
        else if (downPressed) {
            if (o.move[1] == 1) {
                rightPressed = false;
                leftPressed = true;
                upPressed = false;
                downPressed = false;
            } else if (o.move[2] == 1) {
                rightPressed = true;
                leftPressed = false;
                upPressed = false;
                downPressed = false;
            }
        }

        updateGameState();
        render();

        requestAnimationFrame(gameLoop);
    });
}

function ai_train() {
    state = evaluate_state(state);

    $.ajax({
        type: "POST",
        url: "http://127.0.0.1:8000/make_move",  
        data: JSON.stringify({reward: reward, score: snakeLenght - 1, state: state, done: gameOver}),
        contentType: "application/json",
    }).done(function( o ) {
        reward = 0;
        state = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

        if (rightPressed) {
            if (o.move[1] == 1) {
                rightPressed = false;
                leftPressed = false;
                upPressed = false;
                downPressed = true;
            } else if (o.move[2] == 1) {
                rightPressed = false;
                leftPressed = false;
                upPressed = true;
                downPressed = false;
            }
        }
        else if (leftPressed) {
            if (o.move[1] == 1) {
                rightPressed = false;
                leftPressed = false;
                upPressed = true;
                downPressed = false;
            } else if (o.move[2] == 1) {
                rightPressed = false;
                leftPressed = false;
                upPressed = false;
                downPressed = true;
            }
        }
        else if (upPressed) {
            if (o.move[1] == 1) {
                rightPressed = true;
                leftPressed = false;
                upPressed = false;
                downPressed = false;
            } else if (o.move[2] == 1) {
                rightPressed = false;
                leftPressed = true;
                upPressed = false;
                downPressed = false;
            }
        }
        else if (downPressed) {
            if (o.move[1] == 1) {
                rightPressed = false;
                leftPressed = true;
                upPressed = false;
                downPressed = false;
            } else if (o.move[2] == 1) {
                rightPressed = true;
                leftPressed = false;
                upPressed = false;
                downPressed = false;
            }
        }

        updateGameState();
        render();
        
        state = evaluate_state(state);

        $.ajax({
            type: "POST",
            url: "http://127.0.0.1:8000/train",  
            data: JSON.stringify({reward: reward, score: snakeLenght - 1, state: state, done: gameOver}),
            contentType: "application/json",
            }).done(function( o ) {
                if (gameOver) {
                    snake = [[300 + snakeSize/2, 200 + snakeSize/2, 1]];
                    snakeLenght = 1;
                    rightPressed = false;
                    leftPressed = false;
                    upPressed = true;
                    downPressed = false;

                    appleExists = false;
                    appleX = NaN;
                    appleY = NaN;

                    gameOver = false;
                }
                requestAnimationFrame(gameLoop);
            });
    });
}

function bounds() {
    for (var i = 0; i < snakeLenght; i++) {
        if (snake[i][0] > c.width) {
            gameOver = true;
            reward = -10;
        }
        else if (snake[i][0] < 0) {
            gameOver = true;
            reward = -10;
        }
        else if (snake[i][1] > c.height) {
            gameOver = true;
            reward = -10;
        }
        else if (snake[i][1] < 0) {
            gameOver = true;
            reward = -10;
        }
    }
}

function spawnApple() {
    top:
    while (!appleExists) {
        appleX = Math.floor(Math.random() * ((c.width - 20) - 20 + 1) + 20);
        appleY = Math.floor(Math.random() * ((c.height - 20) - 20 + 1) + 20);
        appleX = appleX - appleX % snakeSize + snakeSize/2;
        appleY = appleY - appleY % snakeSize + snakeSize/2;
        for (var i = 0; i < snakeLenght; i++) {
            if (appleX == snake[i][0] && appleY == snake[i][1]) {
                break top;
            }
        }
        appleExists = true;
    }
}

function collisionSnake() {
    for (var i = 1; i < snakeLenght; i++) {
        if (snake[0][0] + snakeSize > snake[i][0] && snake[0][0] < snake[i][0] + snakeSize && snake[0][1] + snakeSize > snake[i][1] && snake[0][1] < snake[i][1] + snakeSize) {
            gameOver = true;
            reward = -10;
            break;
        }
    }
}

function collisionApple() {
    if (appleExists) {
        if (snake[0][0] + snakeSize > appleX && snake[0][0] < appleX + snakeSize && snake[0][1] + snakeSize > appleY && snake[0][1] < appleY + snakeSize) {
            appleExists = false;
            if (snake[snakeLenght-1][2] == 1) {
                snake.push([snake[snakeLenght-1][0], snake[snakeLenght-1][1] + snakeSize, 1]);
                reward = 10;
            }
            else if (snake[snakeLenght-1][2] == 2) {
                snake.push([snake[snakeLenght-1][0], snake[snakeLenght-1][1] - snakeSize, 2]);
                reward = 10;
            }
            else if (snake[snakeLenght-1][2] == 3) {
                snake.push([snake[snakeLenght-1][0] + snakeSize, snake[snakeLenght-1][1], 3]);
                reward = 10;
            }
            else if (snake[snakeLenght-1][2] == 4) {
                snake.push([snake[snakeLenght-1][0] - snakeSize, snake[snakeLenght-1][1], 4]);
                reward = 10;
            }
            snakeLenght += 1;
        }
    }
}

function updateGameState() {
    var snakeCopy = snake.map(function(arr) {
        return arr.slice();
    });

    if (rightPressed) {
        snake[0][0] += snakeSize
        snake[0][2] = 4;
    }
    else if (leftPressed) {
        snake[0][0] -= snakeSize
        snake[0][2] = 3;
    }
    else if (upPressed) {
        snake[0][1] -= snakeSize
        snake[0][2] = 1;
    }
    else if (downPressed) {
        snake[0][1] += snakeSize
        snake[0][2] = 2;
    }

    collisionSnake();

    for (var i = 1; i < snakeLenght; i ++) {
        if (snakeCopy[i][2] != snakeCopy[i-1][2]) {
            if (snakeCopy[i-1][2] == 1) {
                snake[i][1] -= snakeSize
                snake[i][2] = 1;
            }
            else if (snakeCopy[i-1][2] == 2) {
                snake[i][1] += snakeSize
                snake[i][2] = 2;
            }
            else if (snakeCopy[i-1][2] == 3) {
                snake[i][0] -= snakeSize
                snake[i][2] = 3;
            }
            else if (snakeCopy[i-1][2] == 4) {
                snake[i][0] += snakeSize
                snake[i][2] = 4;
            }
        }
        else {
            if (snakeCopy[i][2] == 1) {
                snake[i][1] -= snakeSize
                snake[i][2] = 1;
            }
            else if (snakeCopy[i][2] == 2) {
                snake[i][1] += snakeSize
                snake[i][2] = 2;
            }
            else if (snakeCopy[i][2] == 3) {
                snake[i][0] -= snakeSize
                snake[i][2] = 3;
            }
            else if (snakeCopy[i][2] == 4) {
                snake[i][0] += snakeSize
                snake[i][2] = 4;
            }
        }
    }

    bounds();
    if (!appleExists) spawnApple();
    collisionApple();
}

function render() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, c.width, c.height);

    ctx.fillStyle = "red";
    ctx.strokeStyle = "yellow"
    if (appleExists) {
        ctx.fillRect(appleX - snakeSize/2, appleY - snakeSize/2, snakeSize, snakeSize);
        ctx.strokeRect(appleX - snakeSize/2, appleY - snakeSize/2, snakeSize, snakeSize);
    }

    ctx.fillStyle = "green";
    for (var i = 0; i < snakeLenght; i++) {
        ctx.fillRect(snake[i][0] - snakeSize/2, snake[i][1] - snakeSize/2, snakeSize, snakeSize);
        ctx.strokeRect(snake[i][0] - snakeSize/2, snake[i][1] - snakeSize/2, snakeSize, snakeSize);
    }

    ctx.font = "30px Arial";
    ctx.fillStyle = "white";
    ctx.fillText("Score: " + (snakeLenght - 1), 10, 50);
}

document.addEventListener('keydown', function(event) {
    if(event.keyCode == 65) {
        rightPressed = false;
        leftPressed = true;
        upPressed = false;
        downPressed = false;
    }
    else if(event.keyCode == 68) {
        rightPressed = true;
        leftPressed = false;
        upPressed = false;
        downPressed = false;
    }
    else if(event.keyCode == 87) {
        rightPressed = false;
        leftPressed = false;
        upPressed = true;
        downPressed = false;
    }
    else if(event.keyCode == 83) {
        rightPressed = false;
        leftPressed = false;
        upPressed = false;
        downPressed = true;
    }

    if(gameOver && event.keyCode == 82) {
        snake = [[300 + snakeSize/2, 200 + snakeSize/2, 1]];
        snakeLenght = 1;
        rightPressed = false;
        leftPressed = false;
        upPressed = true;
        downPressed = false;

        appleExists = false;
        appleX = NaN;
        appleY = NaN;

        gameOver = false;
    }

    if(event.keyCode == 80) {
        pause = !pause;
    }
});

async function gameLoop(timestamp) {
    const deltaTime = timestamp - lastTime;
    switch (gameMode) {
        case 0:
            if (deltaTime > 100) {
                lastTime = timestamp;
                if (!gameOver && !pause) {
                    updateGameState();
                    render();
                }    
            }
            requestAnimationFrame(gameLoop);
            break;
        case 1:
            if (deltaTime > 100) {
                lastTime = timestamp;
                if (!gameOver && !pause) {
                    ai_play();
                } else {
                    requestAnimationFrame(gameLoop);
                }
                
            } else {
                requestAnimationFrame(gameLoop);
            }
            break;
        case 2:
            if (deltaTime > 10) {
                lastTime = timestamp;
                if (!gameOver && !pause) {
                    ai_train();
                } else {
                    requestAnimationFrame(gameLoop);
                }
                
            } else {
                requestAnimationFrame(gameLoop);
            }
            break;
        default:
            if (deltaTime > 100) {
                lastTime = timestamp;
                if (!gameOver && !pause) {
                    updateGameState();
                    render();
                }    
            }
            requestAnimationFrame(gameLoop);
            break;
    }
}

render();
requestAnimationFrame(gameLoop);