/**
 * Enemy (Ghost) Entity
 * IA des fantômes avec comportements différents
 */

import { ENEMY_CONFIG, ENEMY_AI } from '../config.js';

export class Enemy {
  constructor(scene, config) {
    this.scene = scene;
    this.name = config.name;
    this.color = config.color;
    this.x = config.x;
    this.y = config.y;
    this.width = ENEMY_CONFIG.width;
    this.height = ENEMY_CONFIG.height;
    this.speed = ENEMY_CONFIG.baseSpeed;
    
    this.velocityX = 0;
    this.velocityY = 0;
    this.direction = 'right';
    
    this.mode = 'scatter';  // 'scatter' ou 'chase'
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
    
    this.scene.physics.world.enable(this.sprite);
    this.sprite.body.setCollideWorldBounds(true);
    this.sprite.body.setBounce(0, 0);
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

    this.x += this.velocityX * deltaSeconds;
    this.y += this.velocityY * deltaSeconds;
    this.sprite.x = this.x;
    this.sprite.y = this.y;
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
