// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game state
let gameState = 'playing'; // 'playing', 'gameOver', or 'upgradeSelection'
let level = 1;
let multiplier = 1;

// Upgrades system
const upgrades = {
    shield: {
        name: 'Shield',
        description: 'Reflects missed balls (50s cooldown)',
        icon: '🛡️',
        count: 0,
        active: 0,
        cooldown: 50000,
        lastUsed: []
    },
    speed: {
        name: 'Speed Boost',
        description: '+2 movement speed',
        icon: '⚡',
        count: 0,
        bonus: 2
    },
    paddleSize: {
        name: 'Bigger Paddle',
        description: '+20 width (max 2)',
        icon: '📏',
        count: 0,
        maxCount: 2,
        bonus: 20
    },
    dashCooldown: {
        name: 'Dash Cooldown',
        description: '-1s cooldown (min 0.5s)',
        icon: '💨',
        count: 0,
        bonus: 1000
    },
    powerHit: {
        name: 'Power Hit',
        description: '+15% ball speed on hit',
        icon: '💥',
        count: 0,
        bonus: 0.15
    }
};

let currentUpgradeChoices = [];

// Player paddle (bottom)
const player = {
    x: canvas.width / 2 - 60,
    y: canvas.height - 30,
    width: 120,
    baseWidth: 120,
    height: 15,
    speed: 8,
    baseSpeed: 8,
    dx: 0,
    color: '#FFD700'
};

// Enemy paddle (top - AI)
const enemy = {
    x: canvas.width / 2 - 60,
    y: 15,
    width: 120,
    height: 15,
    speed: 3,
    color: '#ff6b6b'
};

// Ball
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 8,
    baseSpeed: 4,
    speed: 4,
    dx: 4,
    dy: -4,
    color: '#ffffff'
};

// Dash ability
const dash = {
    available: true,
    cooldown: 5000,
    baseCooldown: 5000,
    minCooldown: 500,
    speed: 25,
    duration: 150,
    active: false,
    startTime: 0
};

// Fast return ability (20% chance)
const fastReturnChance = 0.2;

// Keyboard state
const keys = {
    ArrowLeft: false,
    ArrowRight: false,
    Space: false
};

// Event listeners
document.addEventListener('keydown', (e) => {
    if (e.code in keys) {
        keys[e.code] = true;
        
        // Dash ability
        if (e.code === 'Space' && dash.available && gameState === 'playing') {
            activateDash();
        }
    }
    
    // Restart game on Enter key after game over
    if (e.code === 'Enter' && gameState === 'gameOver') {
        resetGame();
    }
    
    // Upgrade selection (1, 2, 3 keys)
    if (gameState === 'upgradeSelection') {
        if (e.code === 'Digit1' && currentUpgradeChoices[0]) {
            selectUpgrade(0);
        } else if (e.code === 'Digit2' && currentUpgradeChoices[1]) {
            selectUpgrade(1);
        } else if (e.code === 'Digit3' && currentUpgradeChoices[2]) {
            selectUpgrade(2);
        }
    }
});

document.addEventListener('keyup', (e) => {
    if (e.code in keys) {
        keys[e.code] = false;
    }
});

// Activate dash ability
function activateDash() {
    dash.active = true;
    dash.available = false;
    dash.startTime = Date.now();
    
    updateDashStatus();
    
    // Cooldown
    setTimeout(() => {
        dash.available = true;
        updateDashStatus();
    }, dash.cooldown);
}

// Update dash status display
function updateDashStatus() {
    const dashStatus = document.getElementById('dashStatus');
    if (dash.available) {
        dashStatus.textContent = 'Ready';
        dashStatus.classList.remove('cooldown');
    } else {
        dashStatus.textContent = 'Cooldown';
        dashStatus.classList.add('cooldown');
    }
}

// Move player paddle
function movePlayer() {
    // Check if dash is still active
    if (dash.active && Date.now() - dash.startTime > dash.duration) {
        dash.active = false;
    }
    
    const currentSpeed = dash.active ? dash.speed : player.speed;
    
    // Keyboard controls only
    if (keys.ArrowLeft) {
        player.dx = -currentSpeed;
    } else if (keys.ArrowRight) {
        player.dx = currentSpeed;
    } else {
        player.dx = 0;
    }
    
    player.x += player.dx;
    
    // Wall collision
    if (player.x < 0) {
        player.x = 0;
    }
    if (player.x + player.width > canvas.width) {
        player.x = canvas.width - player.width;
    }
}

// Check and regenerate shields
function updateShields() {
    const currentTime = Date.now();
    
    // Count how many shields should be regenerated
    for (let i = upgrades.shield.lastUsed.length - 1; i >= 0; i--) {
        if (currentTime - upgrades.shield.lastUsed[i] >= upgrades.shield.cooldown) {
            upgrades.shield.lastUsed.splice(i, 1);
            upgrades.shield.active++;
        }
    }
    
    // Cap active shields at total count
    if (upgrades.shield.active > upgrades.shield.count) {
        upgrades.shield.active = upgrades.shield.count;
    }
}

// Move enemy paddle (AI)
function moveEnemy() {
    const enemyCenter = enemy.x + enemy.width / 2;
    const ballX = ball.x;
    
    // AI follows the ball with current speed
    if (ballX < enemyCenter - 10) {
        enemy.x -= enemy.speed;
    } else if (ballX > enemyCenter + 10) {
        enemy.x += enemy.speed;
    }
    
    // Wall collision
    if (enemy.x < 0) {
        enemy.x = 0;
    }
    if (enemy.x + enemy.width > canvas.width) {
        enemy.x = canvas.width - enemy.width;
    }
}

// Move ball
function moveBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;
    
    // Wall collision (left and right)
    if (ball.x - ball.radius < 0 || ball.x + ball.radius > canvas.width) {
        ball.dx = -ball.dx;
    }
    
    // Player paddle collision
    if (
        ball.y + ball.radius > player.y &&
        ball.y - ball.radius < player.y + player.height &&
        ball.x > player.x &&
        ball.x < player.x + player.width
    ) {
        // Calculate hit position for angle
        const hitPos = (ball.x - player.x) / player.width;
        const angle = (hitPos - 0.5) * Math.PI / 3;
        
        let speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
        
        // Fast return ability (20% chance)
        const isFastReturn = Math.random() < fastReturnChance;
        let speedMultiplier = isFastReturn ? 1.5 : 1;
        
        // Power hit upgrade
        if (upgrades.powerHit.count > 0) {
            speedMultiplier += upgrades.powerHit.count * upgrades.powerHit.bonus;
        }
        
        ball.dx = speed * Math.sin(angle) * speedMultiplier;
        ball.dy = -speed * Math.cos(angle) * speedMultiplier;
        
        ball.y = player.y - ball.radius;
    }
    
    // Enemy paddle collision
    if (
        ball.y - ball.radius < enemy.y + enemy.height &&
        ball.y + ball.radius > enemy.y &&
        ball.x > enemy.x &&
        ball.x < enemy.x + enemy.width
    ) {
        // Random return angle from enemy (roguelike element)
        const randomFactor = 0.3 + (level * 0.05);
        const randomAngle = (Math.random() - 0.5) * Math.PI * randomFactor;
        
        const speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
        
        ball.dx = speed * Math.sin(randomAngle);
        ball.dy = speed * Math.cos(randomAngle);
        
        ball.y = enemy.y + enemy.height + ball.radius;
    }
    
    // Score detection
    // Enemy scores (ball passes player)
    if (ball.y - ball.radius > canvas.height) {
        // Check shield - only activate if ball didn't touch the paddle
        if (upgrades.shield.active > 0) {
            upgrades.shield.active--;
            upgrades.shield.lastUsed.push(Date.now());
            
            // Shield reflects the ball back (as if player hit it)
            ball.y = player.y - ball.radius;
            ball.dy = -Math.abs(ball.dy); // Reverse direction upward
            
            // Apply power hit if available (same as player hit)
            if (upgrades.powerHit.count > 0) {
                const currentSpeed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
                const speedMultiplier = 1 + (upgrades.powerHit.count * upgrades.powerHit.bonus);
                ball.dx *= speedMultiplier;
                ball.dy *= speedMultiplier;
            }
        } else {
            gameOver();
        }
    }
    
    // Player scores (ball passes enemy)
    if (ball.y + ball.radius < 0) {
        levelUp();
    }
}

// Level up
function levelUp() {
    level++;
    
    // Update UI
    document.getElementById('level').textContent = level;
    
    // Show upgrade selection
    showUpgradeSelection();
}

// Generate random upgrade choices
function showUpgradeSelection() {
    gameState = 'upgradeSelection';
    
    const availableUpgrades = [];
    
    for (let key in upgrades) {
        const upgrade = upgrades[key];
        // Check if upgrade can still be taken
        if (!upgrade.maxCount || upgrade.count < upgrade.maxCount) {
            availableUpgrades.push(key);
        }
    }
    
    // Select 3 random upgrades
    currentUpgradeChoices = [];
    const shuffled = availableUpgrades.sort(() => Math.random() - 0.5);
    currentUpgradeChoices = shuffled.slice(0, Math.min(3, shuffled.length));
}

// Select an upgrade
function selectUpgrade(index) {
    const upgradeKey = currentUpgradeChoices[index];
    const upgrade = upgrades[upgradeKey];
    
    upgrade.count++;
    
    // Apply upgrade effects
    switch(upgradeKey) {
        case 'shield':
            upgrades.shield.active++;
            break;
        case 'speed':
            player.speed = player.baseSpeed + (upgrades.speed.count * upgrades.speed.bonus);
            break;
        case 'paddleSize':
            player.width = player.baseWidth + (upgrades.paddleSize.count * upgrades.paddleSize.bonus);
            break;
        case 'dashCooldown':
            dash.cooldown = Math.max(dash.minCooldown, dash.baseCooldown - (upgrades.dashCooldown.count * upgrades.dashCooldown.bonus));
            break;
    }
    
    // Continue game
    gameState = 'playing';
    currentUpgradeChoices = [];
    
    // Increase enemy speed
    enemy.speed += 0.4;
    
    // Increase ball base speed
    ball.baseSpeed += 0.2;
    ball.speed = ball.baseSpeed;
    
    // Set ball direction with new speed
    const angle = (Math.random() - 0.5) * Math.PI / 4;
    ball.dx = ball.speed * Math.sin(angle);
    ball.dy = Math.random() > 0.5 ? ball.speed : -ball.speed;
    
    // Reset ball position
    resetBall();
}

// Game over
function gameOver() {
    gameState = 'gameOver';
    document.getElementById('gameOverText').style.display = 'block';
}

// Reset game
function resetGame() {
    gameState = 'playing';
    level = 1;
    multiplier = 1;
    
    // Reset upgrades
    for (let key in upgrades) {
        upgrades[key].count = 0;
        if (key === 'shield') {
            upgrades[key].active = 0;
            upgrades[key].lastUsed = [];
        }
    }
    currentUpgradeChoices = [];
    
    // Reset enemy speed
    enemy.speed = 3;
    enemy.x = canvas.width / 2 - 60;
    
    // Reset player
    player.x = canvas.width / 2 - 60;
    player.width = player.baseWidth;
    player.speed = player.baseSpeed;
    
    // Reset ball to initial values
    ball.baseSpeed = 4;
    ball.speed = 4;
    ball.dx = 4;
    ball.dy = -4;
    resetBall();
    
    // Reset dash
    dash.available = true;
    dash.active = false;
    dash.cooldown = dash.baseCooldown;
    
    // Update UI
    document.getElementById('level').textContent = level;
    document.getElementById('multiplier').textContent = 'x' + multiplier;
    document.getElementById('gameOverText').style.display = 'none';
    updateDashStatus();
}

// Reset ball position
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
}

// Draw player paddle
function drawPlayer() {
    ctx.fillStyle = player.color;
    ctx.shadowBlur = 15;
    ctx.shadowColor = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
    ctx.shadowBlur = 0;
    
    // Draw shields
    if (upgrades.shield.active > 0) {
        ctx.strokeStyle = '#00CED1';
        ctx.lineWidth = 3;
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#00CED1';
        for (let i = 0; i < upgrades.shield.active; i++) {
            ctx.strokeRect(player.x - 5 - (i * 3), player.y - 5 - (i * 3), player.width + 10 + (i * 6), player.height + 10 + (i * 6));
        }
        ctx.shadowBlur = 0;
    }
}

// Draw enemy paddle
function drawEnemy() {
    ctx.fillStyle = enemy.color;
    ctx.shadowBlur = 15;
    ctx.shadowColor = enemy.color;
    ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    ctx.shadowBlur = 0;
}

// Draw ball
function drawBall() {
    ctx.fillStyle = ball.color;
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#00CED1';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
}

// Draw center line
function drawCenterLine() {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
    ctx.setLineDash([]);
}

// Draw upgrade selection
function drawUpgradeSelection() {
    // Dark overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Title
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('LEVEL UP!', canvas.width / 2, 80);
    
    ctx.fillStyle = '#00CED1';
    ctx.font = '20px Arial';
    ctx.fillText('Choose your upgrade:', canvas.width / 2, 120);
    
    // Draw upgrade cards
    const cardWidth = 220;
    const cardHeight = 280;
    const spacing = 20;
    const startX = (canvas.width - (cardWidth * 3 + spacing * 2)) / 2;
    const startY = 160;
    
    currentUpgradeChoices.forEach((upgradeKey, index) => {
        const upgrade = upgrades[upgradeKey];
        const x = startX + (cardWidth + spacing) * index;
        const y = startY;
        
        // Card background
        ctx.fillStyle = 'rgba(20, 20, 20, 0.9)';
        ctx.fillRect(x, y, cardWidth, cardHeight);
        
        // Card border
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, cardWidth, cardHeight);
        
        // Icon
        ctx.font = '60px Arial';
        ctx.fillText(upgrade.icon, x + cardWidth / 2, y + 80);
        
        // Name
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 22px Arial';
        ctx.fillText(upgrade.name, x + cardWidth / 2, y + 130);
        
        // Description
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px Arial';
        const words = upgrade.description.split(' ');
        let line = '';
        let lineY = y + 170;
        
        words.forEach(word => {
            const testLine = line + word + ' ';
            const metrics = ctx.measureText(testLine);
            if (metrics.width > cardWidth - 20 && line !== '') {
                ctx.fillText(line, x + cardWidth / 2, lineY);
                line = word + ' ';
                lineY += 22;
            } else {
                line = testLine;
            }
        });
        ctx.fillText(line, x + cardWidth / 2, lineY);
        
        // Current count
        if (upgrade.count > 0) {
            ctx.fillStyle = '#00CED1';
            ctx.font = 'bold 16px Arial';
            ctx.fillText(`Current: ${upgrade.count}${upgrade.maxCount ? '/' + upgrade.maxCount : ''}`, x + cardWidth / 2, y + 220);
        }
        
        // Key hint
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 24px Arial';
        ctx.fillText(`[${index + 1}]`, x + cardWidth / 2, y + 260);
    });
    
    ctx.textAlign = 'left';
}

// Draw everything
function draw() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw field elements
    drawCenterLine();
    
    // Draw game objects
    drawPlayer();
    drawEnemy();
    drawBall();
    
    // Draw dash effect
    if (dash.active) {
        ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
        ctx.fillRect(player.x - 10, player.y - 10, player.width + 20, player.height + 20);
    }
    
    // Draw upgrade selection if needed
    if (gameState === 'upgradeSelection') {
        drawUpgradeSelection();
    }
}

// Update game
function update() {
    if (gameState === 'playing') {
        movePlayer();
        moveEnemy();
        moveBall();
        updateShields();
    }
    
    draw();
    requestAnimationFrame(update);
}

// Start game
update();
