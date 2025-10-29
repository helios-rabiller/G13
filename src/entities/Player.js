/**
 * Player Entity - TILE-BASED MOVEMENT
 * Contrôlé par le joueur avec mouvement bloc par bloc
 */

import { PLAYER_CONFIG, WORLD_CONFIG, GAME_CONFIG } from '../config.js';

export class Player {
  constructor(scene, maze) {
    this.scene = scene;
    this.maze = maze;
    this.tileSize = WORLD_CONFIG.tileSize;
    
    // Position EN TILES (pas pixels)
    this.tileX = Math.floor(GAME_CONFIG.width / this.tileSize / 2);
    this.tileY = Math.floor(GAME_CONFIG.height / this.tileSize - 3);
    
    // Direction actuelle
    this.dirX = 0;
    this.dirY = 0;
    
    // Direction demandée (input)
    this.nextDirX = 0;
    this.nextDirY = 0;
    
    // Timing du mouvement (bloc par bloc)
    this.moveTimer = 0;
    this.moveDelay = 150;  // ms par bloc (1.25x = 120px/s => ~150ms pour 32px)
    
    // Stats
    this.score = 0;
    this.lives = 3;
    this.invulnerable = false;
    this.invulnerableTimer = 0;
    
    // Power-up
    this.powered = false;
    this.poweredTimer = 0;
    this.poweredDuration = 8000;  // 8 secondes
    
    this.create();
  }

  create() {
    // Pac-Man: Cercle jaune avec "bouche"
    this.sprite = this.scene.add.circle(
      this.getPixelX(),
      this.getPixelY(),
      this.tileSize / 2 - 2,
      0xFFFF00  // Jaune
    );
    this.sprite.setOrigin(0.5);
    this.sprite.setDepth(2);
  }

  getPixelX() {
    return this.tileX * this.tileSize + this.tileSize / 2;
  }

  getPixelY() {
    return this.tileY * this.tileSize + this.tileSize / 2;
  }

  update(input, delta) {
    // Capturer input - DOIT être remis à zéro chaque frame
    if (input.left) {
      this.nextDirX = -1;
      this.nextDirY = 0;
    }
    if (input.right) {
      this.nextDirX = 1;
      this.nextDirY = 0;
    }
    if (input.up) {
      this.nextDirX = 0;
      this.nextDirY = -1;
    }
    if (input.down) {
      this.nextDirX = 0;
      this.nextDirY = 1;
    }

    // Avancer le timer
    this.moveTimer += delta;

    // Quand il est temps de bouger (bloc par bloc)
    if (this.moveTimer >= this.moveDelay) {
      this.moveTimer -= this.moveDelay;
      this.tryMove();
    }

    // Mettre à jour sprite position
    this.sprite.x = this.getPixelX();
    this.sprite.y = this.getPixelY();

    // Invulnérabilité
    if (this.invulnerable) {
      this.invulnerableTimer -= delta;
      if (this.invulnerableTimer <= 0) {
        this.invulnerable = false;
        this.sprite.setAlpha(1);
      }
    }

    // Power-up timer
    if (this.powered) {
      this.poweredTimer -= delta;
      if (this.poweredTimer <= 0) {
        this.powered = false;
        this.sprite.setFillStyle(0xFFFF00);  // Retour jaune
      } else {
        // Clignoter quand power-up actif
        const blink = Math.floor(this.poweredTimer / 200) % 2;
        this.sprite.setFillStyle(blink ? 0xFF00FF : 0xFFFF00);  // Magenta/Jaune
      }
    }
  }

  tryMove() {
    // Essayer direction demandée d'abord (changement de direction)
    if (this.nextDirX !== 0 || this.nextDirY !== 0) {
      if (this.canMove(this.nextDirX, this.nextDirY)) {
        this.dirX = this.nextDirX;
        this.dirY = this.nextDirY;
      }
    }

    // Puis bouger dans la direction actuelle
    if (this.dirX !== 0 || this.dirY !== 0) {
      if (this.canMove(this.dirX, this.dirY)) {
        this.tileX += this.dirX;
        this.tileY += this.dirY;
      }
    }
  }

  canMove(dirX, dirY) {
    const newX = this.tileX + dirX;
    const newY = this.tileY + dirY;
    return this.maze.isWalkable(newX, newY);
  }

  eatPellet(value) {
    this.score += value;
  }

  eatPowerUp() {
    this.powered = true;
    this.poweredTimer = this.poweredDuration;
  }

  hitByEnemy() {
    if (!this.invulnerable) {
      this.lives -= 1;
      this.invulnerable = true;
      this.invulnerableTimer = 2000;
      this.sprite.setAlpha(0.5);
      return this.lives > 0;
    }
    return true;
  }

  reset() {
    this.tileX = Math.floor(GAME_CONFIG.width / this.tileSize / 2);
    this.tileY = Math.floor(GAME_CONFIG.height / this.tileSize - 3);
    this.dirX = 0;
    this.dirY = 0;
    this.nextDirX = 0;
    this.nextDirY = 0;
    this.moveTimer = 0;
    this.invulnerable = false;
    this.powered = false;
    this.poweredTimer = 0;
    this.sprite.setAlpha(1);
    this.sprite.setFillStyle(0xFFFF00);
  }

  getPosition() {
    return { x: this.getPixelX(), y: this.getPixelY() };
  }

  getTilePosition() {
    return { x: this.tileX, y: this.tileY };
  }

  destroy() {
    this.sprite.destroy();
  }
}
