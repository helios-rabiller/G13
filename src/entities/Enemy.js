/**
 * Enemy Entity - TILE-BASED MOVEMENT
 * IA avec mouvement bloc par bloc linéaire
 */

import { ENEMY_CONFIG, WORLD_CONFIG, ENEMY_AI } from '../config.js';

export class Enemy {
  constructor(scene, config, maze) {
    this.scene = scene;
    this.maze = maze;
    this.tileSize = WORLD_CONFIG.tileSize;
    
    this.name = config.name;
    this.color = config.color;
    
    // Position EN TILES
    this.tileX = Math.floor(config.x / this.tileSize);
    this.tileY = Math.floor(config.y / this.tileSize);
    
    // Direction linéaire (une seule direction à la fois)
    this.dirX = 0;
    this.dirY = 0;
    
    // Timing du mouvement (bloc par bloc)
    this.moveTimer = 0;
    this.moveDelay = 200;  // Plus lent que le joueur (120px/s)
    
    // IA
    this.aiTimer = 0;
    this.aiDelay = ENEMY_AI.updateFrequency;  // 500ms
    this.targetX = this.tileX;
    this.targetY = this.tileY;
    this.mode = 'scatter';
    
    this.create();
  }

  create() {
    this.sprite = this.scene.add.rectangle(
      this.getPixelX(),
      this.getPixelY(),
      WORLD_CONFIG.tileSize - 4,
      WORLD_CONFIG.tileSize - 4,
      this.color
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

  update(playerPos, delta) {
    // Update IA decision
    this.aiTimer += delta;
    if (this.aiTimer >= this.aiDelay) {
      this.aiTimer -= this.aiDelay;
      this.updateAI(playerPos);
    }

    // Timer mouvement
    this.moveTimer += delta;
    if (this.moveTimer >= this.moveDelay) {
      this.moveTimer -= this.moveDelay;
      this.tryMove();
    }

    // Update sprite
    this.sprite.x = this.getPixelX();
    this.sprite.y = this.getPixelY();
  }

  updateAI(playerPos) {
    const playerTile = {
      x: Math.floor(playerPos.x / this.tileSize),
      y: Math.floor(playerPos.y / this.tileSize)
    };

    const distance = Math.abs(playerTile.x - this.tileX) + Math.abs(playerTile.y - this.tileY);

    // Décider mode
    if (distance < ENEMY_AI.chaseDistance / WORLD_CONFIG.tileSize) {
      this.mode = 'chase';
      this.chasePlayer(playerTile);
    } else {
      this.mode = 'scatter';
      this.scatter();
    }
  }

  chasePlayer(playerTile) {
    switch (this.name) {
      case 'red':
        this.targetX = playerTile.x;
        this.targetY = playerTile.y;
        break;
      case 'pink':
        this.targetX = playerTile.x + 2;
        this.targetY = playerTile.y - 2;
        break;
      case 'blue':
        this.targetX = playerTile.x - 3;
        this.targetY = playerTile.y + 3;
        break;
      case 'yellow':
        this.targetX = playerTile.x + (Math.random() > 0.5 ? 2 : -2);
        this.targetY = playerTile.y + (Math.random() > 0.5 ? 2 : -2);
        break;
    }
  }

  scatter() {
    // Coins aléatoires
    const corners = [
      { x: 2, y: 2 },
      { x: Math.floor(800 / WORLD_CONFIG.tileSize) - 2, y: 2 },
      { x: 2, y: Math.floor(600 / WORLD_CONFIG.tileSize) - 2 },
      { x: Math.floor(800 / WORLD_CONFIG.tileSize) - 2, y: Math.floor(600 / WORLD_CONFIG.tileSize) - 2 }
    ];
    const corner = corners[Math.floor(Math.random() * corners.length)];
    this.targetX = corner.x;
    this.targetY = corner.y;
  }

  tryMove() {
    const dx = this.targetX - this.tileX;
    const dy = this.targetY - this.tileY;

    // Choisir direction - AXE PRIORITAIRE UNIQUEMENT
    const distX = Math.abs(dx);
    const distY = Math.abs(dy);

    let newDirX = 0;
    let newDirY = 0;

    if (distX > distY && dx !== 0) {
      newDirX = dx > 0 ? 1 : -1;
      newDirY = 0;
    } else if (dy !== 0) {
      newDirX = 0;
      newDirY = dy > 0 ? 1 : -1;
    }

    // Essayer la direction
    if (newDirX !== 0 || newDirY !== 0) {
      if (this.canMove(newDirX, newDirY)) {
        this.dirX = newDirX;
        this.dirY = newDirY;
        this.tileX += this.dirX;
        this.tileY += this.dirY;
      } else {
        // Si collision, chercher nouvelle direction
        this.findNewDirection();
      }
    }
  }

  findNewDirection() {
    // Tester les 4 directions cardinales
    const directions = [
      { x: 1, y: 0 },
      { x: -1, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: -1 }
    ];

    const valid = directions.filter(dir => this.canMove(dir.x, dir.y));

    if (valid.length > 0) {
      const chosen = valid[Math.floor(Math.random() * valid.length)];
      this.dirX = chosen.x;
      this.dirY = chosen.y;
      this.tileX += this.dirX;
      this.tileY += this.dirY;
      
      // Set new target
      this.targetX = this.tileX + chosen.x * 5;
      this.targetY = this.tileY + chosen.y * 5;
    }
  }

  canMove(dirX, dirY) {
    const newX = this.tileX + dirX;
    const newY = this.tileY + dirY;
    return this.maze.isWalkable(newX, newY);
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
