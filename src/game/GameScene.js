/**
 * Main Game Scene
 * Logique principale du jeu
 */

import { GAME_CONFIG, WORLD_CONFIG, LEVEL_CONFIG, DIFFICULTY_CONFIG } from '../config.js';
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

    // Récupérer la difficulté depuis le menu
    const difficulty = window.GAME_DIFFICULTY || 'normal';
    this.difficulty = DIFFICULTY_CONFIG[difficulty];

    console.log(`Game started - Difficulty: ${difficulty}`, this.difficulty);

    // Créer le labyrinthe
    this.maze = new Maze(GAME_CONFIG.width, GAME_CONFIG.height, WORLD_CONFIG.tileSize);
    this.maze.render(this);

    // Initialiser le joueur avec paramètres de difficulté
    this.player = new Player(this, this.maze);
    this.player.lives = this.difficulty.lives;
    this.player.moveDelay = 150 / this.difficulty.playerSpeed;  // Ajuster vitesse
    
    // Initialiser ennemis (nb selon difficulté)
    this.enemies = [];
    const spawnsToUse = ENEMY_CONFIG.spawns.slice(0, this.difficulty.enemies);
    spawnsToUse.forEach(config => {
      this.enemies.push(new Enemy(this, config, this.maze));
    });

    // Boss (création conditionnelle)
    this.boss = null;
    this.bossShouldSpawn = this.difficulty.boss;

    // Gérer les pièces
    this.pelletManager = new PelletManager(this.maze, WORLD_CONFIG.tileSize);
    this.pelletManager.difficulty = this.difficulty;
    this.pelletManager.generate(this);

    // HUD
    this.hud = new HUD(this);
    this.hud.updateLevel(this.level);
    this.hud.updateLives(this.player.lives);

    // Input
    this.cursors = this.input.keyboard.createCursorKeys();
    this.zqsdKeys = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.Z,
      left: Phaser.Input.Keyboard.KeyCodes.Q,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });
  }

  activatePowerUp() {
    this.player.eatPowerUp();
    
    // Ralentir les ennemis
    this.enemies.forEach(enemy => {
      enemy.moveDelay *= 1.5;
    });

    if (this.boss) {
      this.boss.moveDelay *= 1.5;
    }

    this.time.delayedCall(this.player.poweredDuration, () => {
      this.enemies.forEach(enemy => {
        enemy.moveDelay /= 1.5;
      });
      
      if (this.boss) {
        this.boss.moveDelay /= 1.5;
      }
    });
  }

  activateInvincibility() {
    this.player.eatInvincibility();
    console.log('🔴 INVINCIBILITY ACTIVATED!');
  }

  checkBossSpawn() {
    // Spawn boss quand joueur a 1 vie (et si difficulté le permet)
    if (this.bossShouldSpawn && this.player.lives === 1 && !this.bossActive && this.boss === null) {
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
      
      // Différents types de pièces
      if (pelletResult.type === 'pink') {
        this.activatePowerUp();
      } else if (pelletResult.type === 'red') {
        this.activateInvincibility();
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
      if (enemy.tileX === this.player.tileX && enemy.tileY === this.player.tileY) {
        if (this.player.invincible) {
          // Détruire l'ennemi quand joueur est invincible
          enemy.destroy();
          this.enemies = this.enemies.filter(e => e !== enemy);
          this.player.score += 500;
          console.log('👻 Ghost destroyed! +500 points');
        } else {
          const alive = this.player.hitByEnemy();
          if (!alive) {
            this.gameActive = false;
          }
        }
      }
    });
  }

  checkBossCollision() {
    if (this.boss.tileX === this.player.tileX && this.boss.tileY === this.player.tileY) {
      if (this.player.invincible) {
        // Boss ne peut pas être détruit par invincibilité
        this.player.score += 1000;
      } else {
        const alive = this.player.hitByEnemy();
        if (!alive) {
          this.gameActive = false;
        }
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

