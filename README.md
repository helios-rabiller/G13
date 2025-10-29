# 👻 Pachorman - Horror Pac-Man Game

Un jeu d'horreur inspiré de Pac-Man avec une atmosphère sombre et des ennemis terrifiants.

## 🎮 Gameplay

- **Joueur** : Se déplace 1.25x plus vite que les ennemis
- **Objectif** : Manger toutes les pastilles tout en évitant les fantômes
- **Ennemis** : 4 fantômes avec IA comportementale
- **Niveaux** : Progressivement plus difficiles

## 📁 Structure du Projet

```
Pachorman/
├── src/
│   ├── game/          # Logique principale du jeu
│   ├── entities/      # Joueur, ennemis, éléments du monde
│   ├── utils/         # Utilitaires (pathfinding, collision, etc.)
│   └── ui/            # Interface utilisateur
├── assets/
│   ├── sprites/       # Images des entités
│   ├── sounds/        # Effets sonores et musique
│   └── fonts/         # Polices de caractères
├── docs/              # Documentation
├── tests/             # Tests unitaires
└── index.html         # Point d'entrée
```

## 🚀 Getting Started

### Installation
```bash
npm install
```

### Lancer le jeu
```bash
npm start
```

### Lancer les tests
```bash
npm test
```

## 📝 Mécaniques de Jeu

### Vitesses
- **Joueur** : 1.25x la vitesse des ennemis
- **Ennemis** : Vitesse de base paramétrable

### Ennemis (Fantômes)
1. **Red** - Poursuit directement le joueur
2. **Pink** - Anticipe les mouvements du joueur
3. **Blue** - Piège le joueur en triangulation
4. **Yellow** - Comportement aléatoire/chaotique

### Système de Points
- Pastille normale : 10 points
- Pastille Power-up : 50 points
- Fantôme mangé : 200-1600 points (augmente avec combo)

## 🎨 Atmosphère Horror

- Bruitages horrifiants
- Éclairage dynamique
- Visuels sinistres
- Musique d'ambiance oppressante

## 📚 Documentation

Voir le dossier `docs/` pour :
- Architecture détaillée
- Guide des entités
- Système de pathfinding
- Configuration des niveaux

## 🛠️ Technologies

- **Moteur** : Phaser 3 (ou similaire)
- **Langage** : JavaScript (ES6+)
- **Build** : Webpack/Vite

## 📄 License

MIT
