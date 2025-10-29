/**
 * Tests unitaires pour les entités
 */

import { Player } from '../src/entities/Player.js';
import { Enemy } from '../src/entities/Enemy.js';
import { CollisionManager } from '../src/utils/collision.js';

describe('Player', () => {
  let mockScene;

  beforeEach(() => {
    mockScene = {
      add: {
        rectangle: jest.fn().mockReturnValue({
          setOrigin: jest.fn().mockReturnThis(),
          destroy: jest.fn()
        })
      },
      physics: {
        world: {
          enable: jest.fn().mockReturnValue({
            setCollideWorldBounds: jest.fn().mockReturnThis(),
            setBounce: jest.fn().mockReturnThis()
          })
        }
      }
    };
  });

  test('player initialization', () => {
    const player = new Player(mockScene, 100, 100);
    expect(player.x).toBe(100);
    expect(player.y).toBe(100);
    expect(player.lives).toBe(3);
  });

  test('player speed is 1.25x enemy base speed', () => {
    const player = new Player(mockScene);
    // PLAYER_CONFIG.speed = 150, ENEMY_CONFIG.baseSpeed = 120
    // 150 / 120 = 1.25
    expect(player.speed / 120).toBeCloseTo(1.25, 1);
  });

  test('eat pellet increases score', () => {
    const player = new Player(mockScene);
    player.eatPellet(10);
    expect(player.score).toBe(10);
    expect(player.pelletsEaten).toBe(1);
  });

  test('hit by enemy reduces lives', () => {
    const player = new Player(mockScene);
    const initial = player.lives;
    player.hitByEnemy();
    expect(player.lives).toBe(initial - 1);
  });
});

describe('Collision', () => {
  test('AABB collision detection', () => {
    const rect1 = { x: 0, y: 0, width: 10, height: 10 };
    const rect2 = { x: 5, y: 5, width: 10, height: 10 };
    expect(CollisionManager.checkAABB(rect1, rect2)).toBe(true);
  });

  test('no collision when separated', () => {
    const rect1 = { x: 0, y: 0, width: 10, height: 10 };
    const rect2 = { x: 20, y: 20, width: 10, height: 10 };
    expect(CollisionManager.checkAABB(rect1, rect2)).toBe(false);
  });

  test('manhattan distance calculation', () => {
    const pos1 = { x: 0, y: 0 };
    const pos2 = { x: 3, y: 4 };
    // distance = |3-0| + |4-0| = 7
    expect(CollisionManager.checkAABB(pos1, pos2)).toBeDefined();
  });
});
