/**
 * Game Configuration
 * Paramètres centralisés pour le jeu
 */

export const GAME_CONFIG = {
  // Dimensions du jeu
  width: 800,
  height: 600,
  
  // Physics
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },

  // Render
  render: {
    pixelArt: true,
    antialias: false,
    smoothStep: false,
    backgroundColor: '#000000'
  }
};

export const PLAYER_CONFIG = {
  speed: 150,           // pixels per second (1.25x des ennemis)
  startX: 400,
  startY: 500,
  width: 32,
  height: 32,
  color: 0xFFFF00       // Jaune (reste pareil)
};

export const ENEMY_CONFIG = {
  baseSpeed: 120,       // pixels per second (joueur = 1.25x)
  width: 32,
  height: 32,
  spawns: [
    { x: 100, y: 100, name: 'red', color: 0xFF0000 },        // Rouge vif
    { x: 700, y: 100, name: 'pink', color: 0xFF1493 },       // Rose vif
    { x: 100, y: 500, name: 'blue', color: 0x0099FF },       // Bleu glacial
    { x: 700, y: 500, name: 'yellow', color: 0xFFDD00 }      // Jaune vif
  ]
};

export const WORLD_CONFIG = {
  tileSize: 32,
  pelletsValue: 10,
  powerUpValue: 50,
  powerUpDuration: 8000,  // ms
  wallColor: 0x8B0000     // Rouge sombre (horror theme)
};

export const LEVEL_CONFIG = {
  maxLevels: 5,
  speedIncrement: 1.05,   // 5% de vitesse en plus par niveau
  pelletsIncrement: 0.9   // 10% moins de pelletes par niveau
};

export const ENEMY_AI = {
  updateFrequency: 500,   // ms entre chaque décision
  chaseDistance: 300,
  scatterDistance: 100
};

export const UI_CONFIG = {
  fontSize: 24,
  fontFamily: 'Arial',
  scoreColor: 0xFFFFFF,
  lifeColor: 0xFF0000
};
