/**
 * Main Game Scene
 * Logique principale du jeu
 */

import { GAME_CONFIG, WORLD_CONFIG, LEVEL_CONFIG } from '../config.js';
import { Player } from '../entities/Player.js';
import { Enemy } from '../entities/Enemy.js';
import { Boss } from '../entities/Boss.js';
import { Maze } from '../entities/Maze.js';
import { PelletManager } from '../entities/Pellets.js';
import { ENEMY_CONFIG } from '../config.js';
import { HUD } from '../ui/HUD.js';

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    this.level = 1;
    this.gameActive = true;
    this.bossActive = false;

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

    // Boss (pas créé au départ)
    this.boss = null;

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

  activatePowerUp() {
    this.player.eatPowerUp();
    
    // Ralentir les ennemis
    this.enemies.forEach(enemy => {
      enemy.moveDelay *= 1.5;  // 1.5x plus lent
    });

    // Ralentir le boss aussi
    if (this.boss) {
      this.boss.moveDelay *= 1.5;
    }

    // Remettre à vitesse normale après expiration
    this.time.delayedCall(this.player.poweredDuration, () => {
      this.enemies.forEach(enemy => {
        enemy.moveDelay /= 1.5;  // Retour vitesse normale
      });
      
      if (this.boss) {
        this.boss.moveDelay /= 1.5;
      }
    });
  }

  checkBossSpawn() {
    // Spawn boss quand joueur a 1 vie
    if (this.player.lives === 1 && !this.bossActive && this.boss === null) {
      this.bossActive = true;
      this.boss = new Boss(this, this.maze);
      console.log('⚠️ BOSS SPAWNED - PACHORMAN APPEARS!');
    }
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

    // Vérifier spawn boss
    this.checkBossSpawn();

    // Update ennemis
    this.enemies.forEach(enemy => {
      enemy.update(this.player.getPosition(), delta);
    });

    // Update boss
    if (this.boss) {
      this.boss.update(this.player.getPosition(), delta);
    }

    // Collisions joueur - pièces
    const pelletResult = this.pelletManager.eat(
      this.player.tileX,
      this.player.tileY
    );
    if (pelletResult) {
      this.player.eatPellet(pelletResult.value);
      
      // Si power-up
      if (pelletResult.isPowerUp) {
        this.activatePowerUp();
      }
      
      this.pelletManager.updateRender(this);
    }

    // Collisions joueur - ennemis
    this.checkEnemyCollisions();

    // Collisions joueur - boss
    if (this.boss) {
      this.checkBossCollision();
    }

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

  checkBossCollision() {
    // Boss collision - pareil que ennemis
    if (this.boss.tileX === this.player.tileX && this.boss.tileY === this.player.tileY) {
      const alive = this.player.hitByEnemy();
      if (!alive) {
        this.gameActive = false;
      }
    }
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

    // Récompense: Gagner une vie si pas à 3
    if (this.player.lives < 3) {
      this.player.lives += 1;
    }

    // Détruire boss si existant
    if (this.boss) {
      this.boss.destroy();
      this.boss = null;
      this.bossActive = false;
    }

    // Réinitialiser
    this.player.reset();
    this.pelletManager.reset(this);
    this.gameActive = true;
    this.hud.updateLevel(this.level);
    this.hud.updateLives(this.player.lives);
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
    if (this.boss) {
      this.boss.destroy();
    }
    this.maze.destroy();
    this.pelletManager.destroy();
    this.hud.destroy();
  }
}

