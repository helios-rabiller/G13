/**
 * Player Entity
 * Contrôlé par le joueur
 */

import { PLAYER_CONFIG } from '../config.js';

export class Player {
  constructor(scene, x, y, maze) {
    this.scene = scene;
    this.maze = maze;
    this.x = x || PLAYER_CONFIG.startX;
    this.y = y || PLAYER_CONFIG.startY;
    this.width = PLAYER_CONFIG.width;
    this.height = PLAYER_CONFIG.height;
    this.speed = PLAYER_CONFIG.speed;
    this.radius = this.width / 2;
    
    this.velocityX = 0;
    this.velocityY = 0;
    this.nextDirectionX = 0;
    this.nextDirectionY = 0;
    
    this.pelletsEaten = 0;
    this.score = 0;
    this.lives = 3;
    this.invulnerable = false;
    this.invulnerableTimer = 0;
    
    this.create();
  }

  create() {
    // Créer le sprite du joueur
    this.sprite = this.scene.add.rectangle(
      this.x,
      this.y,
      this.width,
      this.height,
      PLAYER_CONFIG.color
    );
    this.sprite.setOrigin(0.5);
    this.sprite.setDepth(2);
  }

  update(input, delta) {
    this.handleInput(input);
    this.updateMovement(delta);
    this.updatePosition(delta);
    
    if (this.invulnerable) {
      this.invulnerableTimer -= delta;
      if (this.invulnerableTimer <= 0) {
        this.invulnerable = false;
      }
    }
  }

  handleInput(input) {
    // Permettre le buffering de direction
    if (input.left) {
      this.nextDirectionX = -1;
      this.nextDirectionY = 0;
    } else if (input.right) {
      this.nextDirectionX = 1;
      this.nextDirectionY = 0;
    } else if (input.up) {
      this.nextDirectionX = 0;
      this.nextDirectionY = -1;
    } else if (input.down) {
      this.nextDirectionX = 0;
      this.nextDirectionY = 1;
    }
  }

  updateMovement(delta) {
    // Essayer de changer de direction
    if (this.nextDirectionX !== 0 || this.nextDirectionY !== 0) {
      if (this.canMove(this.nextDirectionX, this.nextDirectionY)) {
        this.velocityX = this.nextDirectionX;
        this.velocityY = this.nextDirectionY;
      }
    }
  }

  updatePosition(delta) {
    const deltaSeconds = delta / 1000;
    
    // Calculer nouvelle position
    let newX = this.x + this.velocityX * this.speed * deltaSeconds;
    let newY = this.y + this.velocityY * this.speed * deltaSeconds;

    // Vérifier les collisions avec les murs
    if (!this.maze.checkCollision(newX - this.width / 2, newY - this.height / 2, this.width, this.height)) {
      this.x = newX;
      this.y = newY;
    }
    
    this.sprite.x = Math.round(this.x);
    this.sprite.y = Math.round(this.y);
  }

  canMove(dirX, dirY) {
    // Vérifier si on peut se déplacer dans cette direction
    const testX = this.x + dirX * 5;
    const testY = this.y + dirY * 5;
    return !this.maze.checkCollision(
      testX - this.width / 2,
      testY - this.height / 2,
      this.width,
      this.height
    );
  }

  eatPellet(value) {
    this.pelletsEaten += 1;
    this.score += value;
  }

  hitByEnemy() {
    if (!this.invulnerable) {
      this.lives -= 1;
      this.invulnerable = true;
      this.invulnerableTimer = 2000; // 2 secondes d'invulnérabilité
      
      // Animation de flash
      this.sprite.setAlpha(0.5);
      
      return this.lives > 0;
    }
    return true;
  }

  reset() {
    this.x = PLAYER_CONFIG.startX;
    this.y = PLAYER_CONFIG.startY;
    
    // Ajuster à une position valide
    const validPos = this.maze.findNearestWalkable(this.x, this.y);
    this.x = validPos.x;
    this.y = validPos.y;
    
    this.velocityX = 0;
    this.velocityY = 0;
    this.nextDirectionX = 0;
    this.nextDirectionY = 0;
    this.invulnerable = false;
    this.sprite.setAlpha(1);
    this.sprite.x = this.x;
    this.sprite.y = this.y;
  }

  getPosition() {
    return { x: this.x, y: this.y };
  }

  getBounds() {
    return {
      x: this.x - this.width / 2,
      y: this.y - this.height / 2,
      width: this.width,
      height: this.height
    };
  }

  destroy() {
    this.sprite.destroy();
  }
}
