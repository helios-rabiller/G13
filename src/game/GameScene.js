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

    // Initialiser le joueur (tile-based)
    this.player = new Player(this, this.maze);
    
    // Initialiser ennemis (tile-based)
    this.enemies = [];
    ENEMY_CONFIG.spawns.forEach(config => {
      this.enemies.push(new Enemy(this, config, this.maze));
    });

    // Gérer les pièces
    this.pelletManager = new PelletManager(this.maze, WORLD_CONFIG.tileSize);
    this.pelletManager.generate(this);

    // HUD
    this.hud = new HUD(this);
    this.hud.updateLevel(this.level);
    this.hud.updateLives(this.player.lives);

    // Input - curseurs et ZQSD (clavier AZERTY français)
    this.cursors = this.input.keyboard.createCursorKeys();
    this.zqsdKeys = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.Z,
      left: Phaser.Input.Keyboard.KeyCodes.Q,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });

    console.log('Game initialized - Tile-based movement');
  }

  update(time, delta) {
    if (!this.gameActive) return;

    // Update joueur
    const input = {
      left: this.cursors.left.isDown || this.zqsdKeys.left.isDown,
      right: this.cursors.right.isDown || this.zqsdKeys.right.isDown,
      up: this.cursors.up.isDown || this.zqsdKeys.up.isDown,
      down: this.cursors.down.isDown || this.zqsdKeys.down.isDown
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
      // Collision en tiles (plus simple et fiable)
      if (enemy.tileX === this.player.tileX && enemy.tileY === this.player.tileY) {
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
