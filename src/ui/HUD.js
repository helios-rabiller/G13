/**
 * HUD - Heads Up Display
 * Affiche le score, les vies, le niveau
 */

import { UI_CONFIG } from '../config.js';

export class HUD {
  constructor(scene) {
    this.scene = scene;
    this.score = 0;
    this.level = 1;
    this.lives = 3;
    
    this.create();
  }

  create() {
    // Score text
    this.scoreText = this.scene.add.text(
      10, 10,
      `Score: ${this.score}`,
      {
        fontSize: `${UI_CONFIG.fontSize}px`,
        fontFamily: UI_CONFIG.fontFamily,
        fill: '#' + UI_CONFIG.scoreColor.toString(16)
      }
    );

    // Level text
    this.levelText = this.scene.add.text(
      this.scene.game.canvas.width - 150, 10,
      `Level: ${this.level}`,
      {
        fontSize: `${UI_CONFIG.fontSize}px`,
        fontFamily: UI_CONFIG.fontFamily,
        fill: '#' + UI_CONFIG.scoreColor.toString(16)
      }
    );

    // Lives text
    this.livesText = this.scene.add.text(
      10, this.scene.game.canvas.height - 40,
      `Lives: ${this.lives}`,
      {
        fontSize: `${UI_CONFIG.fontSize}px`,
        fontFamily: UI_CONFIG.fontFamily,
        fill: '#' + UI_CONFIG.lifeColor.toString(16)
      }
    );
  }

  updateScore(newScore) {
    this.score = newScore;
    this.scoreText.setText(`Score: ${this.score}`);
  }

  updateLevel(newLevel) {
    this.level = newLevel;
    this.levelText.setText(`Level: ${this.level}`);
  }

  updateLives(newLives) {
    this.lives = newLives;
    this.livesText.setText(`Lives: ${this.lives}`);
  }

  showGameOver(finalScore) {
    const gameOverText = this.scene.add.text(
      this.scene.game.canvas.width / 2,
      this.scene.game.canvas.height / 2,
      'GAME OVER',
      {
        fontSize: '64px',
        fontFamily: UI_CONFIG.fontFamily,
        fill: '#FF0000'
      }
    );
    gameOverText.setOrigin(0.5);

    const scoreText = this.scene.add.text(
      this.scene.game.canvas.width / 2,
      this.scene.game.canvas.height / 2 + 80,
      `Final Score: ${finalScore}`,
      {
        fontSize: `${UI_CONFIG.fontSize}px`,
        fontFamily: UI_CONFIG.fontFamily,
        fill: '#FFFFFF'
      }
    );
    scoreText.setOrigin(0.5);
  }

  showLevelComplete(nextLevel) {
    const completeText = this.scene.add.text(
      this.scene.game.canvas.width / 2,
      this.scene.game.canvas.height / 2,
      'LEVEL COMPLETE',
      {
        fontSize: '48px',
        fontFamily: UI_CONFIG.fontFamily,
        fill: '#00FF00'
      }
    );
    completeText.setOrigin(0.5);

    setTimeout(() => {
      completeText.destroy();
    }, 2000);
  }

  destroy() {
    this.scoreText.destroy();
    this.levelText.destroy();
    this.livesText.destroy();
  }
}
