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
    
    // Parcourir la grille et placer les pièces
    for (let row = 1; row < this.maze.rows - 1; row++) {
      for (let col = 1; col < this.maze.cols - 1; col++) {
        // Placer une pièce si c'est un chemin
        if (this.maze.isWalkable(col, row)) {
          const x = col * this.tileSize + this.tileSize / 2;
          const y = row * this.tileSize + this.tileSize / 2;

          // 95% pièces normales, 5% power-ups
          const isPowerUp = Math.random() < 0.05;
          
          this.pellets.push({
            x,
            y,
            col,
            row,
            value: isPowerUp ? 50 : 10,
            radius: isPowerUp ? 4 : 2,
            active: true,
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

    // Pièces normales
    this.graphics.fillStyle(0xFFB897, 1); // Couleur pêche
    for (const pellet of this.pellets) {
      if (pellet.active && !pellet.isPowerUp) {
        this.graphics.fillCircle(pellet.x, pellet.y, pellet.radius);
      }
    }

    // Power-ups
    this.graphics.fillStyle(0xFF6B9D, 1); // Couleur rose/magenta
    for (const pellet of this.pellets) {
      if (pellet.active && pellet.isPowerUp) {
        this.graphics.fillCircle(pellet.x, pellet.y, pellet.radius);
      }
    }
  }

  eat(x, y, radius) {
    // Vérifier la collision avec les pièces
    for (const pellet of this.pellets) {
      if (!pellet.active) continue;

      const dx = pellet.x - x;
      const dy = pellet.y - y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < radius + pellet.radius) {
        pellet.active = false;
        this.count -= 1;
        return pellet.value;
      }
    }
    return 0;
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
