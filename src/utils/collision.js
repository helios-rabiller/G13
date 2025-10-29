/**
 * Collision Detection & Physics Utilities
 */

export class CollisionManager {
  static checkAABB(bounds1, bounds2) {
    return (
      bounds1.x < bounds2.x + bounds2.width &&
      bounds1.x + bounds1.width > bounds2.x &&
      bounds1.y < bounds2.y + bounds2.height &&
      bounds1.y + bounds1.height > bounds2.y
    );
  }

  static checkCircle(pos1, radius1, pos2, radius2) {
    const dx = pos2.x - pos1.x;
    const dy = pos2.y - pos1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < radius1 + radius2;
  }

  static resolveCollision(obj1, obj2) {
    // Repousser les objets pour éviter la pénétration
    const dx = obj2.x - obj1.x;
    const dy = obj2.y - obj1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance === 0) return;

    const minDistance = (obj1.width + obj2.width) / 4;
    const overlap = minDistance - distance;

    if (overlap > 0) {
      const angle = Math.atan2(dy, dx);
      const moveX = Math.cos(angle) * overlap / 2;
      const moveY = Math.sin(angle) * overlap / 2;

      obj1.x -= moveX;
      obj1.y -= moveY;
      obj2.x += moveX;
      obj2.y += moveY;
    }
  }
}

export class Pathfinding {
  static manhattanDistance(pos1, pos2) {
    return Math.abs(pos2.x - pos1.x) + Math.abs(pos2.y - pos1.y);
  }

  static euclideanDistance(pos1, pos2) {
    const dx = pos2.x - pos1.x;
    const dy = pos2.y - pos1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  static getDirectionTowards(fromPos, toPos) {
    const dx = toPos.x - fromPos.x;
    const dy = toPos.y - fromPos.y;
    const angle = Math.atan2(dy, dx);
    
    return {
      x: Math.cos(angle),
      y: Math.sin(angle),
      angle: angle
    };
  }
}

export class WorldGrid {
  constructor(width, height, tileSize) {
    this.width = width;
    this.height = height;
    this.tileSize = tileSize;
    this.cols = Math.ceil(width / tileSize);
    this.rows = Math.ceil(height / tileSize);
    this.grid = Array(this.rows).fill(null).map(() => Array(this.cols).fill(0));
  }

  posToGrid(x, y) {
    return {
      col: Math.floor(x / this.tileSize),
      row: Math.floor(y / this.tileSize)
    };
  }

  gridToPos(col, row) {
    return {
      x: col * this.tileSize + this.tileSize / 2,
      y: row * this.tileSize + this.tileSize / 2
    };
  }

  setTile(col, row, value) {
    if (col >= 0 && col < this.cols && row >= 0 && row < this.rows) {
      this.grid[row][col] = value;
    }
  }

  getTile(col, row) {
    if (col >= 0 && col < this.cols && row >= 0 && row < this.rows) {
      return this.grid[row][col];
    }
    return -1; // Hors limites = mur
  }

  isWalkable(col, row) {
    return this.getTile(col, row) !== -1;
  }
}
