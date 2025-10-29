/**
 * HUD - Heads Up Display
 * Gère l'UI en dehors du canvas
 */

export class HUD {
  constructor(scene) {
    this.scene = scene;
    this.score = 0;
    this.level = 1;
    this.lives = 3;
    
    this.updateElements();
  }

  updateElements() {
    this.scoreDisplay = document.getElementById('score-display');
    this.levelDisplay = document.getElementById('level-display');
    this.livesDisplay = document.getElementById('lives-display');
  }

  updateScore(newScore) {
    this.score = newScore;
    if (this.scoreDisplay) {
      this.scoreDisplay.textContent = this.score;
    }
  }

  updateLevel(newLevel) {
    this.level = newLevel;
    if (this.levelDisplay) {
      this.levelDisplay.textContent = this.level;
    }
  }

  updateLives(newLives) {
    this.lives = newLives;
    if (this.livesDisplay) {
      this.livesDisplay.innerHTML = '';
      for (let i = 0; i < 3; i++) {
        const lifeIcon = document.createElement('div');
        lifeIcon.className = i < newLives ? 'life-icon' : 'life-icon dead';
        this.livesDisplay.appendChild(lifeIcon);
      }
    }
  }

  showGameOver(finalScore) {
    // Optionnel: afficher dans console pour l'instant
    console.log(`GAME OVER! Final Score: ${finalScore}`);
  }

  showLevelComplete(nextLevel) {
    console.log(`LEVEL COMPLETE! Next: ${nextLevel}`);
  }

  destroy() {
    // Pas besoin de détruire d'éléments HTML
  }
}
