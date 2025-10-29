/**
 * Main Application Entry Point
 */

import Phaser from 'phaser';
import { GAME_CONFIG } from './config.js';
import { GameScene } from './game/GameScene.js';

const config = {
  type: Phaser.AUTO,
  width: GAME_CONFIG.width,
  height: GAME_CONFIG.height,
  parent: 'game-container',
  physics: GAME_CONFIG.physics,
  render: GAME_CONFIG.render,
  scene: [GameScene]
};

const game = new Phaser.Game(config);
