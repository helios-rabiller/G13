/**
 * Maze System
 * Gère la grille du labyrinthe et les collisions
 */

export class Maze {
  constructor(width, height, tileSize) {
    this.width = width;
    this.height = height;
    this.tileSize = tileSize;
    this.cols = Math.floor(width / tileSize);
    this.rows = Math.floor(height / tileSize);
    
    // 0 = chemin, 1 = mur, 2 = spawn point
    this.grid = this.generateMaze();
    this.wallGraphics = null;
  }

  generateMaze() {
    const grid = Array(this.rows).fill(null).map(() => Array(this.cols).fill(0));
    
    // Créer les bordures
    for (let x = 0; x < this.cols; x++) {
      grid[0][x] = 1;
      grid[this.rows - 1][x] = 1;
    }
    for (let y = 0; y < this.rows; y++) {
      grid[y][0] = 1;
      grid[y][this.cols - 1] = 1;
    }

    // Créer des sections avec murs
    this.createMazePatterns(grid);
    
    return grid;
  }

  createMazePatterns(grid) {
    const midCol = Math.floor(this.cols / 2);
    const midRow = Math.floor(this.rows / 2);

    // Murs verticaux au centre
    for (let y = 2; y < this.rows - 2; y++) {
      if (y % 3 === 0) {
        grid[y][midCol] = 1;
        grid[y][midCol - 5] = 1;
        grid[y][midCol + 5] = 1;
      }
    }

    // Murs horizontaux
    for (let x = 2; x < this.cols - 2; x++) {
      if (x % 4 === 0) {
        grid[3][x] = 1;
        grid[midRow][x] = 1;
        grid[this.rows - 4][x] = 1;
      }
    }

    // Zone de spawn ennemis (au centre, pas de murs)
    const spawnLeft = midCol - 3;
    const spawnRight = midCol + 3;
    const spawnTop = midRow - 2;
    const spawnBottom = midRow + 2;

    for (let y = spawnTop; y <= spawnBottom; y++) {
      for (let x = spawnLeft; x <= spawnRight; x++) {
        if (y >= 0 && y < this.rows && x >= 0 && x < this.cols) {
          grid[y][x] = 0;
        }
      }
    }
  }

  render(scene) {
    this.wallGraphics = scene.make.graphics({ x: 0, y: 0, add: true });
    this.wallGraphics.fillStyle(0x0033FF, 1);

    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        if (this.grid[y][x] === 1) {
          this.wallGraphics.fillRect(
            x * this.tileSize,
            y * this.tileSize,
            this.tileSize,
            this.tileSize
          );
        }
      }
    }

    this.wallGraphics.setDepth(0);
  }

  getTile(col, row) {
    if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) {
      return 1; // Hors limites = mur
    }
    return this.grid[row][col];
  }

  setTile(col, row, value) {
    if (col >= 0 && col < this.cols && row >= 0 && row < this.rows) {
      this.grid[row][col] = value;
    }
  }

  isWalkable(col, row) {
    return this.getTile(col, row) === 0;
  }

  // Vérifier collision avec murs (AABB)
  checkCollision(x, y, width, height) {
    const leftCol = Math.floor(x / this.tileSize);
    const rightCol = Math.floor((x + width) / this.tileSize);
    const topRow = Math.floor(y / this.tileSize);
    const bottomRow = Math.floor((y + height) / this.tileSize);

    for (let col = leftCol; col <= rightCol; col++) {
      for (let row = topRow; row <= bottomRow; row++) {
        if (!this.isWalkable(col, row)) {
          return true; // Collision détectée
        }
      }
    }
    return false;
  }

  // Trouver un chemin valide
  findNearestWalkable(x, y) {
    const col = Math.floor(x / this.tileSize);
    const row = Math.floor(y / this.tileSize);

    const directions = [
      { dc: 0, dr: 0 },
      { dc: 1, dr: 0 },
      { dc: -1, dr: 0 },
      { dc: 0, dr: 1 },
      { dc: 0, dr: -1 }
    ];

    for (const dir of directions) {
      const newCol = col + dir.dc;
      const newRow = row + dir.dr;
      if (this.isWalkable(newCol, newRow)) {
        return {
          x: newCol * this.tileSize + this.tileSize / 2,
          y: newRow * this.tileSize + this.tileSize / 2
        };
      }
    }

    return { x, y };
  }

  destroy() {
    if (this.wallGraphics) {
      this.wallGraphics.destroy();
    }
  }
}
