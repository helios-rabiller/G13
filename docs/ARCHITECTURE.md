# Architecture de Pachorman

## Vue d'ensemble

Pachorman est un jeu d'horreur basé sur Pac-Man, implémenté en JavaScript avec le moteur Phaser 3.

```
┌─────────────────────┐
│   Main Game Loop    │
│   (Phaser Scene)    │
└──────────┬──────────┘
           │
     ┌─────┼─────┐
     │     │     │
     ▼     ▼     ▼
  Player Enemy  HUD
   │      │      │
   └──┬───┼──────┘
      │   │
   Collision
   Manager
```

## Composants Principaux

### 1. Player (`src/entities/Player.js`)
- Contrôlé par le joueur (curseurs ou ZQSD)
- Vitesse : **150 px/s** (1.25x plus rapide que les ennemis)
- Invulnérabilité temporaire après contact ennemi
- Gestion des vies et du score

**Vitesses:**
- Joueur: 150 px/s
- Ennemis: 120 px/s
- Ratio: 1.25x

### 2. Enemy (`src/entities/Enemy.js`)
4 fantômes avec IA distincte:

| Nom | Couleur | Comportement |
|-----|---------|-------------|
| **Red** | 🔴 Rouge | Poursuite directe du joueur |
| **Pink** | 🩷 Rose | Anticipe la position future |
| **Blue** | 🔵 Bleu | Triangulation complexe |
| **Yellow** | 💛 Jaune | Mouvement chaotique/aléatoire |

**Modes d'IA:**
- **Chase** : Activé quand joueur < 300px de distance
- **Scatter** : Patrouille aléatoire dans les coins

### 3. World (`src/game/GameScene.js`)
- Grille de 800x600 pixels
- Pelletes dispersées (~200 par niveau)
- Murs implicites (limites de l'écran)
- Système de niveaux avec augmentation progressive de difficulté

### 4. UI (`src/ui/HUD.js`)
- Score en temps réel
- Niveau actuel
- Compteur de vies
- Écrans de victoire/défaite

### 5. Utilitaires (`src/utils/`)
- **collision.js** : Détection AABB, distance euclidienne
- **pathfinding.js** : Calculs de distance (Manhattan, Euclidienne)
- **WorldGrid** : Gestion de la grille du monde

## Flux de Jeu

```
1. Initialization
   └─> Créer joueur, ennemis, pelletes

2. Game Loop (chaque frame)
   ├─> Update Player
   │   └─> Lire input, calculer nouveau mouvement
   ├─> Update Enemies
   │   ├─> Décider IA (500ms)
   │   └─> Calculer mouvement vers cible
   ├─> Check Collisions
   │   ├─> Joueur - Pelletes → Augmenter score
   │   └─> Joueur - Ennemis → Réduire vies
   └─> Update HUD

3. Conditions de fin
   ├─> Pelletes = 0 → Level Complete
   ├─> Vies = 0 → Game Over
   └─> Préparer niveau suivant
```

## Système de Niveaux

- **Vitesse** : +5% par niveau (multiplicateur 1.05^n)
- **Pelletes** : -10% par niveau
- **Difficulté** : Augmente progressivement jusqu'au niveau 5

## Configuration Centralisée

Tous les paramètres du jeu sont dans `src/config.js`:
- Dimensions du monde
- Vitesses
- Positions de spawn
- Valeurs des pelletes
- Couleurs et UI

**Modifiez ces valeurs pour ajuster la difficulté !**

## Extensibilité

### Ajouter un nouvel ennemi
1. Ajouter config dans `ENEMY_CONFIG.spawns`
2. Implémenter logique IA dans `Enemy.chasePlayer()`

### Ajouter des niveaux
1. Augmenter `LEVEL_CONFIG.maxLevels`
2. Ajouter spawn obstacles dans `generatePellets()`

### Ajouter power-ups
1. Créer classe `PowerUp` extends Enemy behavior
2. Ajouter logique dans `checkPelletCollisions()`

## Technologies

- **Phaser 3.55** : Moteur de jeu
- **JavaScript ES6+** : Langage
- **Webpack** : Build tool
- **Jest** : Framework de test
