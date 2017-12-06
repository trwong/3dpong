import * as THREE from 'three';
import {
  init,
  scene,
  camera,
  renderer,
} from './../initialize/init';
import {
  sphere,
} from './../initialize/sphere';
import {
  xCollidableList,
  yCollidableList,
  zCollidableList,
} from './../initialize/walls';
import {
  playerPaddle1,
  playerPaddle2,
  computerPaddle1,
  computerPaddle2,
  demoPaddle1,
  demoPaddle2,
} from './../initialize/paddles';
import {
  userControls,
} from './userControls';
import {
  demoPaddleSpeed,
  moveComputerPaddle
} from './computerPaddle';
import {
  initCamera,
  resetCamera,
  demoCameraPivot,
} from './camera';
import { setTimeout } from 'timers';

export let gameMode;

export const renderContainer = () => {
  userControls();
  initCamera();
  


  // demo ball speed
  var baseBallSpeed = 0.3;
  var xBallVelocity = 0.25;
  var yBallVelocity = 0.25;
  var zBallVelocity = -0.25;

  // let pauseGame = false;

  // function pauseGameOn() {
  //   pauseGame = true;
  // }

  // function pauseGameOff() {
  //   pauseGame = false;
  //   requestAnimationFrame(render);
  // }

  function checkPastNet() {
    if (sphere.position.z < -10) {
      if (gameMode === "play") {
        decrementLife("computer");
      }
      resetBall("player");
    } else if (sphere.position.z > 10) {
      if (gameMode === "play") {
        decrementLife("player");
      }
      resetBall("computer");
      // setTimeout(() => gameOverBool = true, 1);
      // setTimeout(() => gameOverBool = false, 1);
      // setTimeout(() => resetBall("computer"), 1000);
      // setTimeout()
    }
  }

  document.getElementById("play-button").onclick = () => {
    startGame();
    resetCamera();
  };

  

  let playerLives = 3;
  let computerLives = 3;

  function decrementLife(player) {
    if (player === "computer") {
      computerLives = computerLives - 1;
      document.getElementById('comp-score').innerHTML = computerLives;
    } else if (player === "player") {
      if (playerLives > 0) {
        playerLives = playerLives - 1;
      }
      document.getElementById('player-score').innerHTML = playerLives;
    }
    if (playerLives <= 0) {
      gameOver();
    } else if (computerLives <= 0) {
      nextLevel();
    }
  }
  let computerPaddleSpeed;
  function nextLevel() {
    computerLives = 3;
    computerPaddleSpeed *= 1.08;
    baseBallSpeed *= 1.07;
    xBallVelocity *= 1.07;
    yBallVelocity *= 1.07;
    zBallVelocity *= 1.07;
    level += 1;
    document.getElementById("game-level").innerHTML = `Level ${level}`;
  }

  let gameOverBool = false;
  function gameOver() {
    gameOverBool = true;
    // cancelAnimationFrame(id);
    document.getElementById("game-over-message").classList.remove("hide");
  }
  
  let level = 1;
  gameMode = "demo";
  function startGame() {
    document.getElementById("game-over-message").classList.add("hide");
    document.getElementById("game-level").innerHTML = `Level ${level}`;
    resetGame();
    gameMode = "play";
    scene.remove(demoPaddle1);
    scene.remove(demoPaddle2);
    requestAnimationFrame(render);
  }

  function resetGame() {
    gameOverBool = false;
    playerLives = 3;
    computerLives = 3;
    computerPaddleSpeed = 0.165;
    baseBallSpeed = 0.2;
    xBallVelocity = 0.2;
    yBallVelocity = 0.2;
    zBallVelocity = -0.2;
    level = 1;
    sphere.position.set(0, 0, 9.5);
    document.getElementById('comp-score').innerHTML = computerLives;
    document.getElementById('player-score').innerHTML = playerLives;
    document.getElementById("game-level").innerHTML = `Level ${level}`;
  }

  function resetBall(side) {
    // setTimeout(() => {
      if (side === "computer") {
        sphere.position.set(0, 0, -9);
        zBallVelocity = Math.abs(zBallVelocity);
      } else if (side === "player") {
        sphere.position.set(0, 0, 9);
        zBallVelocity = -Math.abs(zBallVelocity);
      }
      xBallVelocity = baseBallSpeed;
      yBallVelocity = baseBallSpeed;
      // zBallVelocity = -baseBallSpeed;
    // }, 1000);
    // pauseGameOn();
    // setTimeout(pauseGameOff, 1000);
  }


  
  
  let id;
  let xDirection;
  let yDirection;
  let xPaddleBallDiff;
  let yPaddleBallDiff;

  function animate() {

    id = requestAnimationFrame(animate);
    render();
    // update();

    // camera pivot
    demoCameraPivot();

    moveComputerPaddle(computerPaddleSpeed);
    checkPastNet();

    var originPoint = sphere.position.clone();
    for (var vertexIndex = 0; vertexIndex < sphere.geometry.vertices.length; vertexIndex++) {
      var localVertex = sphere.geometry.vertices[vertexIndex].clone();
      var globalVertex = localVertex.applyMatrix4(sphere.matrix);
      var directionVector = globalVertex.sub(sphere.position);

      var ray = new THREE.Raycaster(originPoint, directionVector.clone().normalize());
      var xCollisionResults = ray.intersectObjects(xCollidableList);
      if (xCollisionResults.length > 0 && xCollisionResults[0].distance < directionVector.length()) {
        yBallVelocity = -yBallVelocity;
      }

      var ray = new THREE.Raycaster(originPoint, directionVector.clone().normalize());
      var yCollisionResults = ray.intersectObjects(yCollidableList);
      if (yCollisionResults.length > 0 && yCollisionResults[0].distance < directionVector.length()) {
        xBallVelocity = -xBallVelocity;
      }

      var ray = new THREE.Raycaster(originPoint, directionVector.clone().normalize());
      var zCollisionResults = ray.intersectObjects(zCollidableList);
      if (zCollisionResults.length > 0 && zCollisionResults[0].distance < directionVector.length()) {
        zBallVelocity = -zBallVelocity;
        if (sphere.position.z > 0) {
          // player side
          // BUG look here for sticky ball issues
          sphere.position.z = 8.7;
          if (gameMode === "demo") {
            // sphere.position.z = demoPaddle1.position.z - (2 * sphere.position.z) - (sphere.radius * 2);
            xDirection = xBallVelocity / Math.abs(xBallVelocity);
            xPaddleBallDiff = (demoPaddle1.position.x - sphere.position.x) / 1.5;
            xBallVelocity = xDirection * Math.abs(xPaddleBallDiff) * baseBallSpeed * 1;
            
            yDirection = yBallVelocity / Math.abs(yBallVelocity);
            yPaddleBallDiff = (demoPaddle1.position.y - sphere.position.y);
            yBallVelocity = yDirection * Math.abs(yPaddleBallDiff) * baseBallSpeed * 1;
          }
          if (gameMode === "play") {
            // sphere.position.z -= playerPaddle1.position.z - sphere.position.z - (sphere.radius * 2)
            xDirection = xBallVelocity / Math.abs(xBallVelocity);
            xPaddleBallDiff = (playerPaddle1.position.x - sphere.position.x) / 1.5;
            xBallVelocity = xDirection * Math.abs(xPaddleBallDiff) * baseBallSpeed * 1;
            
            yDirection = yBallVelocity / Math.abs(yBallVelocity);
            yPaddleBallDiff = (playerPaddle1.position.y - sphere.position.y);
            yBallVelocity = yDirection * Math.abs(yPaddleBallDiff) * baseBallSpeed * 1;
          }
        } else if (sphere.position.z < 0) {
          // comp side
          // sphere.position.z += computerPaddle1.position.z - sphere.position.z + (sphere.radius * 2);
          xDirection = xBallVelocity / Math.abs(xBallVelocity);
          xPaddleBallDiff = computerPaddle1.position.x - sphere.position.x;
          xBallVelocity = xDirection * Math.abs(xPaddleBallDiff) * baseBallSpeed * 1.1;
          
          yDirection = yBallVelocity / Math.abs(yBallVelocity);
          yPaddleBallDiff = computerPaddle1.position.y - sphere.position.y;
          yBallVelocity = yDirection * Math.abs(yPaddleBallDiff) * baseBallSpeed * 1.1;
          
          // BUG look here for sticky ball issues
          
          sphere.position.z = -8.7;
        }
      }

      // var ray = new THREE.Raycaster(originPoint, directionVector.clone().normalize());
      // var netCollisionResults = ray.intersectObjects(netCollidableList);
      // if (netCollisionResults.length > 0 && netCollisionResults[0].distance < directionVector.length()) {
      //   zBallVelocity = -zBallVelocity;
      //   // scene.remove( sphere );
      //   sphere.position.set(0, 0, 0)
      //   // sphere.translateX(0);
      //   // sphere.translateY(0);
      //   // sphere.translateZ(0);
      //   // scene.add( sphere );
      // }
    }

    sphere.translateX(xBallVelocity);
    sphere.translateY(yBallVelocity);
    sphere.translateZ(zBallVelocity);
  }

  function render() {
    if (gameOverBool) return;
    renderer.render(scene, camera);
  }

  // function update() {

  // }

  animate();
};