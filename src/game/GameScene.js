/**
 * Main Game Scene
 * Logique principale du jeu
 */

import { GAME_CONFIG, WORLD_CONFIG, LEVEL_CONFIG } from '../config.js';
import { Player } from '../entities/Player.js';
import { Enemy } from '../entities/Enemy.js';
import { ENEMY_CONFIG } from '../config.js';
import { CollisionManager } from '../utils/collision.js';
import { HUD } from '../ui/HUD.js';

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    this.level = 1;
    this.pelletsRemaining = 200;
    this.gameActive = true;

    // Initialiser les entités
    this.player = new Player(this, GAME_CONFIG.width / 2, GAME_CONFIG.height - 50);
    
    this.enemies = [];
    ENEMY_CONFIG.spawns.forEach(config => {
      this.enemies.push(new Enemy(this, config));
    });

    // HUD
    this.hud = new HUD(this);
    this.hud.updateLevel(this.level);
    this.hud.updateLives(this.player.lives);

    // Générer les pelletes
    this.pellets = [];
    this.generatePellets();

    // Input
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasdKeys = this.input.keyboard.addKeys('W,A,S,D');
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

    // Collisions joueur - pelletes
    this.checkPelletCollisions();

    // Collisions joueur - ennemis
    this.checkEnemyCollisions();

    // Mise à jour HUD
    this.hud.updateScore(this.player.score);
    this.hud.updateLives(this.player.lives);

    // Vérifier victoire
    if (this.pelletsRemaining === 0) {
      this.levelComplete();
    }

    // Vérifier défaite
    if (this.player.lives === 0) {
      this.gameOver();
    }
  }

  generatePellets() {
    this.pellets = [];
    const gridWidth = Math.floor(GAME_CONFIG.width / WORLD_CONFIG.tileSize);
    const gridHeight = Math.floor(GAME_CONFIG.height / WORLD_CONFIG.tileSize);
    
    for (let x = 0; x < gridWidth; x++) {
      for (let y = 0; y < gridHeight; y++) {
        if (Math.random() > 0.1) { // 90% de chance d'avoir une pellete
          const pellet = {
            x: x * WORLD_CONFIG.tileSize + WORLD_CONFIG.tileSize / 2,
            y: y * WORLD_CONFIG.tileSize + WORLD_CONFIG.tileSize / 2,
            value: Math.random() > 0.95 ? WORLD_CONFIG.powerUpValue : WORLD_CONFIG.pelletsValue,
            active: true
          };
          this.pellets.push(pellet);
        }
      }
    }
    this.pelletsRemaining = this.pellets.length;
  }

  checkPelletCollisions() {
    const playerBounds = this.player.getBounds();
    
    this.pellets.forEach(pellet => {
      if (!pellet.active) return;
      
      const dx = pellet.x - playerBounds.x;
      const dy = pellet.y - playerBounds.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < WORLD_CONFIG.tileSize) {
        this.player.eatPellet(pellet.value);
        pellet.active = false;
        this.pelletsRemaining -= 1;
      }
    });
  }

  checkEnemyCollisions() {
    const playerBounds = this.player.getBounds();
    
    this.enemies.forEach(enemy => {
      const enemyBounds = enemy.getBounds();
      
      if (CollisionManager.checkAABB(playerBounds, enemyBounds)) {
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
    this.generatePellets();
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
    this.hud.destroy();
  }
}
