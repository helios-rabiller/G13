# Guide de Développement - Pachorman

## 🎯 Objectif du Projet

Créer un jeu Pac-Man d'horreur en JavaScript avec:
- Joueur contrôlé 1.25x plus rapide que les ennemis
- 4 fantômes avec IA comportementale distincte
- Système de niveaux progressif
- Interface horreur (visuels sombres, bruitages sinistres)

## 🚀 Quick Start

### 1. Installation des dépendances
```bash
npm install
```

### 2. Développement local
```bash
npm start
# Ouvre http://localhost:8080
```

### 3. Build production
```bash
npm run build
```

### 4. Tests
```bash
npm test
npm run test:watch
```

## 📦 Structure des Fichiers

```
src/
├── config.js              # Configuration centralisée
├── index.js               # Point d'entrée
├── game/
│   └── GameScene.js       # Scène principale du jeu
├── entities/
│   ├── Player.js          # Classe Joueur
│   └── Enemy.js           # Classe Ennemi
├── ui/
│   └── HUD.js             # Interface utilisateur
└── utils/
    └── collision.js       # Outils physiques
```

## 🎮 Paramètres Clés

Tous dans `src/config.js` :

| Paramètre | Valeur | Effet |
|-----------|--------|-------|
| `PLAYER_CONFIG.speed` | 150 px/s | Vitesse du joueur |
| `ENEMY_CONFIG.baseSpeed` | 120 px/s | Vitesse de base ennemis |
| `ENEMY_AI.updateFrequency` | 500ms | Fréquence décision IA |
| `ENEMY_AI.chaseDistance` | 300px | Distance avant poursuite |
| `LEVEL_CONFIG.speedIncrement` | 1.05 | +5% vitesse par niveau |

## 🔧 Développement

### Ajouter une nouvelle entité

1. Créer fichier dans `src/entities/`
2. Implémenter `create()`, `update()`, `destroy()`
3. Importer dans `GameScene.js`

Exemple:
```javascript
export class NewEntity {
  constructor(scene) {
    this.scene = scene;
    this.create();
  }
  
  create() {
    // Initialiser sprites/physics
  }
  
  update(delta) {
    // Logique chaque frame
  }
  
  destroy() {
    // Nettoyer ressources
  }
}
```

### Modifier la difficulté

Dans `src/config.js`:
- `PLAYER_CONFIG.speed` : Rendre le joueur plus rapide/lent
- `ENEMY_CONFIG.baseSpeed` : Ajuster IA ennemis
- `ENEMY_AI.updateFrequency` : Ennemis réagissent plus vite
- `LEVEL_CONFIG.speedIncrement` : Progression entre niveaux

### Ajouter un nouvel ennemi

1. Ajouter spawn dans `ENEMY_CONFIG.spawns`:
```javascript
{ x: 400, y: 300, name: 'cyan', color: 0x00FFFF }
```

2. Ajouter cas dans `Enemy.chasePlayer()`:
```javascript
case 'cyan':
  // Logique IA unique
  break;
```

## 🧪 Tests

```bash
# Lancer tous les tests
npm test

# Mode watch (développement)
npm run test:watch

# Coverage rapport
npm test -- --coverage
```

Tests fournis pour:
- Initialisation Player
- Ratio vitesse (1.25x)
- Collision detection (AABB)
- Système de points

## 🎨 Customization

### Changer les couleurs

Dans `src/config.js`:
```javascript
PLAYER_CONFIG.color: 0x00FF00  // Vert
ENEMY_CONFIG.spawns[0].color: 0xFF00FF  // Magenta
```

### Ajouter des niveaux

1. Augmenter `LEVEL_CONFIG.maxLevels`
2. Modifier génération pelletes dans `GameScene.generatePellets()`

### Ajouter des obstacles

Créer `src/entities/Wall.js` et intégrer dans collision detection

## 📚 Documentation

- `ARCHITECTURE.md` : Vue d'ensemble technique
- `README.md` : Description du jeu
- `DEVELOPMENT.md` : Ce fichier

## ⚠️ Problèmes Courants

### Le jeu n'affiche rien
- Vérifier `npm install` complété
- Vérifier `div#game-container` dans `index.html`
- Ouvrir console (F12) pour erreurs

### Collisions ne fonctionnent pas
- Vérifier `getBounds()` retourne les bonnes dimensions
- Vérifier `WORLD_CONFIG.tileSize` cohérent

### Ennemis trop rapides
- Diminuer `ENEMY_CONFIG.baseSpeed`
- Diminuer `LEVEL_CONFIG.speedIncrement`

## 🤝 Contribution

1. Créer feature branch: `git checkout -b feature/nouvelle-feature`
2. Commit changements: `git commit -m "Add nouvelle-feature"`
3. Push: `git push origin feature/nouvelle-feature`
4. Ouvrir Pull Request

## 📝 Code Style

- ESLint configuré (voir `.eslintrc.json`)
- Lancer: `npm run lint:fix`
- Utiliser `const`/`let`, pas `var`
- Ajouter commentaires JSDoc pour fonctions publiques

## 🔮 Futures Améliorations

- [ ] Système de power-ups
- [ ] Obstacles dans le monde
- [ ] Menus de pause/options
- [ ] Effets sonores
- [ ] Animations sprites
- [ ] Sauvegarde high scores
- [ ] Modes de jeu alternatifs
- [ ] Multijoueur local
