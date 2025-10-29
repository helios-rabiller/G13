/**
 * Pellets System
 * Gère les pièces/pastilles du jeu
 */

export class PelletManager {
  constructor(maze, tileSize) {
    this.maze = maze;
    this.tileSize = tileSize;
    this.pellets = [];
    this.graphics = null;
    this.count = 0;
  }

  generate(scene) {
    this.pellets = [];
    const specialRate = this.difficulty?.specialPellets ?? 1.0;
    
    // Parcourir la grille et placer les pièces
    for (let row = 1; row < this.maze.rows - 1; row++) {
      for (let col = 1; col < this.maze.cols - 1; col++) {
        // Placer une pièce si c'est un chemin
        if (this.maze.isWalkable(col, row)) {
          const x = col * this.tileSize + this.tileSize / 2;
          const y = row * this.tileSize + this.tileSize / 2;

          let type = 'normal';
          let value = 10;
          let radius = 2;
          let isPowerUp = false;
          
          const rand = Math.random();
          
          // Appliquer le multiplicateur de difficulté
          if (rand < (0.05 * specialRate)) {
            type = 'red';
            value = 100;
            radius = 3;
            isPowerUp = true;
          } else if (rand < (0.10 * specialRate)) {
            type = 'pink';
            value = 50;
            radius = 2;
            isPowerUp = true;
          }
          
          this.pellets.push({
            x,
            y,
            col,
            row,
            value,
            radius,
            active: true,
            type,
            isPowerUp
          });
        }
      }
    }

    this.count = this.pellets.length;
    this.render(scene);
  }

  render(scene) {
    if (this.graphics) {
      this.graphics.destroy();
    }

    this.graphics = scene.make.graphics({ x: 0, y: 0, add: true });
    this.graphics.setDepth(1);

    // Pièces normales - pêche
    this.graphics.fillStyle(0xFFB897, 1);
    for (const pellet of this.pellets) {
      if (pellet.active && pellet.type === 'normal') {
        this.graphics.fillCircle(pellet.x, pellet.y, pellet.radius);
      }
    }

    // Pièces roses - power-up temporaire
    this.graphics.fillStyle(0xFF1493, 1);
    for (const pellet of this.pellets) {
      if (pellet.active && pellet.type === 'pink') {
        this.graphics.fillCircle(pellet.x, pellet.y, pellet.radius);
      }
    }

    // Pièces rouges - invincibilité (rare!)
    this.graphics.fillStyle(0xFF0000, 1);
    for (const pellet of this.pellets) {
      if (pellet.active && pellet.type === 'red') {
        this.graphics.fillCircle(pellet.x, pellet.y, pellet.radius);
      }
    }
  }

  updateRender(scene) {
    // Redessiner après collecte (plus efficace que destroy/create)
    this.render(scene);
  }

  eat(playerTileX, playerTileY) {
    // Vérifier pièce au même tile
    for (const pellet of this.pellets) {
      if (!pellet.active) continue;

      if (pellet.col === playerTileX && pellet.row === playerTileY) {
        pellet.active = false;
        this.count -= 1;
        return {
          value: pellet.value,
          isPowerUp: pellet.isPowerUp
        };
      }
    }
    return null;
  }

  getRemaining() {
    return this.pellets.filter(p => p.active).length;
  }

  reset(scene) {
    this.generate(scene);
  }

  destroy() {
    if (this.graphics) {
      this.graphics.destroy();
    }
  }
}
