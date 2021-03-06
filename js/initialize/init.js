import * as THREE from 'three';
import initSphere from './sphere';
import {
  initWall,
  xCollidableList,
  yCollidableList,
  zCollidableList,
} from './walls';
import {
  initPaddle,
  playerPaddle1,
  playerPaddle2,
  computerPaddle1,
  computerPaddle2,
  demoPaddle1,
  demoPaddle2,
} from './paddles';
import {
  initOutline
} from './outline';
import {
  initLight,
} from './lights';
import Stats from 'stats-js';

export const scene = new THREE.Scene();
export const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  50
);
export const renderer = new THREE.WebGLRenderer();



export const init = () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  initSphere();
  initWall();
  initPaddle();
  initOutline();
  // initLight();
  // initNets();

  // STATS
  var stats = new Stats();
  stats.setMode(0); // 0: fps, 1: ms 

  // Align top-left 
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.bottom = '0px';

  document.body.appendChild(stats.domElement);

  setInterval(function () {

    stats.begin();

    // your code goes here 

    stats.end();

  }, 1000 / 60);
};