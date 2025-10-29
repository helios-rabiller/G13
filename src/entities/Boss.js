/**
 * Boss Entity - PACHORMAN (Corrupted Pac-Man)
 * Apparaît quand le joueur a 1 vie restante
 * Vitesse = Pac-Man (très stressant)
 */

import { WORLD_CONFIG, GAME_CONFIG } from '../config.js';

export class Boss {
  constructor(scene, maze) {
    this.scene = scene;
    this.maze = maze;
    this.tileSize = WORLD_CONFIG.tileSize;
    
    // Position EN TILES - Spawn en haut à gauche
    this.tileX = 2;
    this.tileY = 2;
    
    // Direction linéaire
    this.dirX = 0;
    this.dirY = 0;
    
    // Timing du mouvement - MÊME VITESSE QUE JOUEUR
    this.moveTimer = 0;
    this.moveDelay = 150;  // IDENTIQUE au joueur
    
    // IA agressive
    this.aiTimer = 0;
    this.aiDelay = 300;  // Décisions plus fréquentes
    this.targetX = this.tileX;
    this.targetY = this.tileY;
    
    this.create();
  }

  create() {
    // Cercle noir avec contour rouge = Pac-Man corrompu
    this.sprite = this.scene.add.circle(
      this.getPixelX(),
      this.getPixelY(),
      this.tileSize / 2 - 2,
      0x000000  // Noir (corrompu)
    );
    this.sprite.setStrokeStyle(2, 0xFF0000);  // Bordure rouge sanguin
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
    // Poursuite AGRESSIVE et DIRECTE du joueur
    const playerTile = {
      x: Math.floor(playerPos.x / this.tileSize),
      y: Math.floor(playerPos.y / this.tileSize)
    };

    this.targetX = playerTile.x;
    this.targetY = playerTile.y;
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
      }
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
