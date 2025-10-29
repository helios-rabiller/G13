/**
 * Enemy (Ghost) Entity
 * IA des fantômes avec comportements différents
 */

import { ENEMY_CONFIG, ENEMY_AI } from '../config.js';

export class Enemy {
  constructor(scene, config, maze) {
    this.scene = scene;
    this.maze = maze;
    this.name = config.name;
    this.color = config.color;
    this.x = config.x;
    this.y = config.y;
    this.width = ENEMY_CONFIG.width;
    this.height = ENEMY_CONFIG.height;
    this.speed = ENEMY_CONFIG.baseSpeed;
    this.radius = this.width / 2;
    
    this.velocityX = 0;
    this.velocityY = 0;
    this.direction = 'right';
    
    this.mode = 'scatter';
    this.lastDecisionTime = 0;
    this.targetX = config.x;
    this.targetY = config.y;
    
    this.create();
  }

  create() {
    this.sprite = this.scene.add.rectangle(
      this.x,
      this.y,
      this.width,
      this.height,
      this.color
    );
    this.sprite.setOrigin(0.5);
    this.sprite.setDepth(2);
  }

  update(playerPos, delta) {
    // Mettre à jour la décision d'IA
    this.lastDecisionTime += delta;
    if (this.lastDecisionTime >= ENEMY_AI.updateFrequency) {
      this.lastDecisionTime = 0;
      this.updateAI(playerPos);
    }

    this.updateMovement(delta);
  }

  updateAI(playerPos) {
    const distance = this.distanceTo(playerPos);
    
    // Décider le mode
    if (distance < ENEMY_AI.chaseDistance) {
      this.mode = 'chase';
    } else {
      this.mode = 'scatter';
    }

    // Calculer la cible selon le type d'ennemi et le mode
    if (this.mode === 'chase') {
      this.chasePlayer(playerPos);
    } else {
      this.scatter();
    }
  }

  chasePlayer(playerPos) {
    switch (this.name) {
      case 'red':
        // Poursuite directe
        this.targetX = playerPos.x;
        this.targetY = playerPos.y;
        break;
      
      case 'pink':
        // Anticipe la position du joueur
        this.targetX = playerPos.x + 50;
        this.targetY = playerPos.y - 50;
        break;
      
      case 'blue':
        // Triangulation complexe
        this.targetX = playerPos.x - 100;
        this.targetY = playerPos.y + 100;
        break;
      
      case 'yellow':
        // Aléatoire / chaotique
        this.targetX = playerPos.x + (Math.random() - 0.5) * 200;
        this.targetY = playerPos.y + (Math.random() - 0.5) * 200;
        break;
    }
  }

  scatter() {
    // Patrouiller dans un coin aléatoire
    const corners = [
      { x: 50, y: 50 },
      { x: 750, y: 50 },
      { x: 50, y: 550 },
      { x: 750, y: 550 }
    ];
    const corner = corners[Math.floor(Math.random() * corners.length)];
    this.targetX = corner.x;
    this.targetY = corner.y;
  }

  updateMovement(delta) {
    const deltaSeconds = delta / 1000;
    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 5) {
      this.velocityX = (dx / distance) * this.speed;
      this.velocityY = (dy / distance) * this.speed;
    } else {
      this.velocityX = 0;
      this.velocityY = 0;
    }

    // Calculer nouvelle position
    let newX = this.x + this.velocityX * deltaSeconds;
    let newY = this.y + this.velocityY * deltaSeconds;

    // Vérifier les collisions
    if (!this.maze.checkCollision(newX - this.width / 2, newY - this.height / 2, this.width, this.height)) {
      this.x = newX;
      this.y = newY;
    } else {
      // Si collision, changer de direction
      this.findNewTarget();
    }

    this.sprite.x = Math.round(this.x);
    this.sprite.y = Math.round(this.y);
  }

  findNewTarget() {
    // Trouver une nouvelle direction valide
    const directions = [
      { x: this.x + 50, y: this.y },
      { x: this.x - 50, y: this.y },
      { x: this.x, y: this.y + 50 },
      { x: this.x, y: this.y - 50 }
    ];

    const validDirs = directions.filter(
      dir => !this.maze.checkCollision(dir.x - this.width / 2, dir.y - this.height / 2, this.width, this.height)
    );

    if (validDirs.length > 0) {
      const random = validDirs[Math.floor(Math.random() * validDirs.length)];
      this.targetX = random.x;
      this.targetY = random.y;
    }
  }

  distanceTo(pos) {
    const dx = pos.x - this.x;
    const dy = pos.y - this.y;
    return Math.sqrt(dx * dx + dy * dy);
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
