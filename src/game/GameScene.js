/**
 * Main Game Scene
 * Logique principale du jeu
 */

import { GAME_CONFIG, WORLD_CONFIG, LEVEL_CONFIG } from '../config.js';
import { Player } from '../entities/Player.js';
import { Enemy } from '../entities/Enemy.js';
import { Maze } from '../entities/Maze.js';
import { PelletManager } from '../entities/Pellets.js';
import { ENEMY_CONFIG } from '../config.js';
import { CollisionManager } from '../utils/collision.js';
import { HUD } from '../ui/HUD.js';

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    this.level = 1;
    this.gameActive = true;

    // Créer le labyrinthe
    this.maze = new Maze(GAME_CONFIG.width, GAME_CONFIG.height, WORLD_CONFIG.tileSize);
    this.maze.render(this);

    // Initialiser les entités
    const playerSpawn = this.findSpawnPoint(0.5, 0.9);
    this.player = new Player(this, playerSpawn.x, playerSpawn.y, this.maze);
    
    this.enemies = [];
    const spawns = [
      { ...ENEMY_CONFIG.spawns[0], y: 100 },
      { ...ENEMY_CONFIG.spawns[1], y: 100 },
      { ...ENEMY_CONFIG.spawns[2], y: GAME_CONFIG.height - 100 },
      { ...ENEMY_CONFIG.spawns[3], y: GAME_CONFIG.height - 100 }
    ];
    spawns.forEach(config => {
      const spawnPoint = this.findSpawnPoint(config.x / GAME_CONFIG.width, config.y / GAME_CONFIG.height);
      this.enemies.push(new Enemy(this, { ...config, x: spawnPoint.x, y: spawnPoint.y }, this.maze));
    });

    // Gérer les pièces
    this.pelletManager = new PelletManager(this.maze, WORLD_CONFIG.tileSize);
    this.pelletManager.generate(this);

    // HUD
    this.hud = new HUD(this);
    this.hud.updateLevel(this.level);
    this.hud.updateLives(this.player.lives);

    // Input
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasdKeys = this.input.keyboard.addKeys('W,A,S,D');
  }

  findSpawnPoint(ratioX, ratioY) {
    const x = GAME_CONFIG.width * ratioX;
    const y = GAME_CONFIG.height * ratioY;
    return this.maze.findNearestWalkable(x, y);
  }

  update(time, delta) {
    if (!this.gameActive) return;

    // Update joueur
    const input = {
      left: this.cursors.left.isDown || this.wasdKeys.A.isDown,
      right: this.cursors.right.isDown || this.wasdKeys.D.isDown,
      up: this.cursors.up.isDown || this.wasdKeys.W.isDown,
      down: this.cursors.down.isDown || this.wasdKeys.S.isDown
    };
    this.player.update(input, delta);

    // Update ennemis
    this.enemies.forEach(enemy => {
      enemy.update(this.player.getPosition(), delta);
    });

    // Collisions joueur - pièces
    const pelletValue = this.pelletManager.eat(
      this.player.x,
      this.player.y,
      this.player.radius
    );
    if (pelletValue > 0) {
      this.player.eatPellet(pelletValue);
      this.pelletManager.render(this);
    }

    // Collisions joueur - ennemis
    this.checkEnemyCollisions();

    // Mise à jour HUD
    this.hud.updateScore(this.player.score);
    this.hud.updateLives(this.player.lives);

    // Vérifier victoire
    if (this.pelletManager.getRemaining() === 0) {
      this.levelComplete();
    }

    // Vérifier défaite
    if (this.player.lives === 0) {
      this.gameOver();
    }
  }

  checkEnemyCollisions() {
    this.enemies.forEach(enemy => {
      const dx = enemy.x - this.player.x;
      const dy = enemy.y - this.player.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < this.player.radius + enemy.radius) {
        const alive = this.player.hitByEnemy();
        if (!alive) {
          this.gameActive = false;
        }
      }
    });
  }

  levelComplete() {
    this.gameActive = false;
    this.hud.showLevelComplete(this.level + 1);
    
    this.time.delayedCall(2000, () => {
      this.nextLevel();
    });
  }

  nextLevel() {
    this.level += 1;
    
    // Augmenter la difficulté
    const speedMultiplier = Math.pow(LEVEL_CONFIG.speedIncrement, this.level - 1);
    this.enemies.forEach(enemy => {
      enemy.speed *= speedMultiplier;
    });

    // Réinitialiser
    this.player.reset();
    this.pelletManager.reset(this);
    this.gameActive = true;
    this.hud.updateLevel(this.level);
  }

  gameOver() {
    this.gameActive = false;
    this.hud.showGameOver(this.player.score);
    
    this.time.delayedCall(3000, () => {
      this.scene.restart();
    });
  }

  shutdown() {
    this.player.destroy();
    this.enemies.forEach(enemy => enemy.destroy());
    this.maze.destroy();
    this.pelletManager.destroy();
    this.hud.destroy();
  }
}
