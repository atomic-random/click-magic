// ============ СИСТЕМА МИНИ-ИГР ============
class MinigameManager {
    constructor() {
        this.modalElement = null;
    }

    static getExamGames() {
        return [
            { id: 'memory', nameKey: 'minigame_memory', descriptionKey: 'minigame_memory_desc', difficulty: 1 },
            { id: 'reaction', nameKey: 'minigame_reaction', descriptionKey: 'minigame_reaction_desc', difficulty: 1 },
            { id: 'math', nameKey: 'minigame_math', descriptionKey: 'minigame_math_desc', difficulty: 2 },
            { id: 'timing', nameKey: 'minigame_timing', descriptionKey: 'minigame_timing_desc', difficulty: 2 }
        ];
    }

    startExam(callback) {
        const games = MinigameManager.getExamGames();
        const randomGame = games[Math.floor(Math.random() * games.length)];

        this.showModal(`
            <div class="minigame">
                <h3>📝 ${I18N.t('exam')}: ${I18N.t(randomGame.nameKey)}</h3>
                <p>${I18N.t(randomGame.descriptionKey)}</p>
                <p style="color: #f59e0b; margin: 10px 0;">⚠️ ${I18N.t('examWarning')}</p>
                <button class="check-btn" id="startExamBtn">${I18N.t('startExam')}</button>
            </div>
        `);

        document.getElementById('startExamBtn').addEventListener('click', () => {
            this.closeModal();
            switch (randomGame.id) {
                case 'memory': this.playMemoryGame(callback); break;
                case 'reaction': this.playReactionGame(callback); break;
                case 'math': this.playMathGame(callback); break;
                case 'timing': this.playTimingGame(callback); break;
                default: this.playMathGame(callback);
            }
        });
    }

    playMemoryGame(callback) {
        const symbols = ['🔮', '⭐', '🌙', '☀️', '🌍', '💎'];
        const sequence = [];
        const sequenceLength = 4;

        for (let i = 0; i < sequenceLength; i++) {
            sequence.push(symbols[Math.floor(Math.random() * symbols.length)]);
        }

        this.showModal(`
            <div class="minigame">
                <h3>${I18N.t('rememberSequence')}</h3>
                <div class="sequence-display">${sequence.join(' ')}</div>
                <p>${I18N.t('sequenceHide')}</p>
                <div class="timer" style="font-size: 24px; margin: 10px;">3</div>
            </div>
        `);

        let timer = 3;
        const timerElement = document.querySelector('.timer');
        const timerInterval = setInterval(() => {
            timer--;
            if (timerElement) timerElement.textContent = timer;
            if (timer <= 0) clearInterval(timerInterval);
        }, 1000);

        setTimeout(() => {
            clearInterval(timerInterval);
            this.showModal(`
                <div class="minigame">
                    <h3>${I18N.t('enterSequence')}</h3>
                    <div class="symbols-grid">
                        ${symbols.map(s => `<button class="symbol-btn" data-symbol="${s}">${s}</button>`).join('')}
                    </div>
                    <div class="answer-display" style="font-size: 24px; margin: 20px 0; min-height: 30px;"></div>
                    <button class="check-btn" id="checkMemoryBtn">${I18N.t('check')}</button>
                    <button class="clear-btn" id="clearMemoryBtn" style="background: #6b7280; margin-left: 10px;">${I18N.t('clear')}</button>
                </div>
            `);

            let userAnswer = [];
            const answerDisplay = document.querySelector('.answer-display');

            document.querySelectorAll('.symbol-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    if (userAnswer.length < sequenceLength) {
                        userAnswer.push(btn.dataset.symbol);
                        answerDisplay.textContent = userAnswer.join(' ');
                    }
                });
            });

            document.getElementById('clearMemoryBtn').addEventListener('click', () => {
                userAnswer = [];
                answerDisplay.textContent = '';
            });

            document.getElementById('checkMemoryBtn').addEventListener('click', () => {
                const isCorrect = JSON.stringify(userAnswer) === JSON.stringify(sequence);
                this.closeModal();
                callback(isCorrect);
            });
        }, 3000);
    }

    playReactionGame(callback) {
        let gameActive = false;

        this.showModal(`
            <div class="minigame">
                <h3>${I18N.t('reactionTest')}</h3>
                <p>${I18N.t('reactionInstructions')}</p>
                <button class="reaction-btn" id="reactionBtn" 
                        style="background: #ef4444; padding: 50px; font-size: 24px; margin: 20px; border: none; border-radius: 10px; cursor: pointer;">
                    ${I18N.t('wait')}
                </button>
                <div class="reaction-result" style="font-size: 18px; margin: 10px;"></div>
            </div>
        `);

        const btn = document.getElementById('reactionBtn');
        const resultDiv = document.querySelector('.reaction-result');
        let startTime;

        const activateGame = () => {
            btn.style.background = '#10b981';
            btn.textContent = I18N.t('clickNow');
            startTime = Date.now();
            gameActive = true;

            setTimeout(() => {
                if (gameActive) {
                    gameActive = false;
                    resultDiv.textContent = '❌ ' + I18N.t('tooSlow');
                    setTimeout(() => {
                        this.closeModal();
                        callback(false);
                    }, 1000);
                }
            }, 2000);
        };

        btn.addEventListener('click', () => {
            if (gameActive) {
                gameActive = false;
                const reactionTime = Date.now() - startTime;
                resultDiv.textContent = `⚡ ${reactionTime}ms`;

                setTimeout(() => {
                    this.closeModal();
                    callback(true);
                }, 500);
            }
        });

        setTimeout(activateGame, 1000 + Math.random() * 2000);
    }

    playMathGame(callback) {
        const num1 = Math.floor(Math.random() * 15) + 1;
        const num2 = Math.floor(Math.random() * 15) + 1;
        const operations = ['+', '-', '*'];
        const operation = operations[Math.floor(Math.random() * operations.length)];
        let correctAnswer;
        let operationSymbol;

        if (operation === '-') {
            const max = Math.max(num1, num2);
            const min = Math.min(num1, num2);
            correctAnswer = max - min;
            operationSymbol = '-';
            this.showModal(`
                <div class="minigame">
                    <h3>${I18N.t('solveProblem')}</h3>
                    <div class="math-problem">${max} ${operationSymbol} ${min} = ?</div>
                    <input type="number" class="math-input" id="mathInput" placeholder="${I18N.t('yourAnswer')}">
                    <button class="check-btn" id="checkMathBtn">${I18N.t('check')}</button>
                </div>
            `);
        } else {
            correctAnswer = operation === '+' ? num1 + num2 : num1 * num2;
            operationSymbol = operation === '+' ? '+' : '×';
            this.showModal(`
                <div class="minigame">
                    <h3>${I18N.t('solveProblem')}</h3>
                    <div class="math-problem">${num1} ${operationSymbol} ${num2} = ?</div>
                    <input type="number" class="math-input" id="mathInput" placeholder="${I18N.t('yourAnswer')}">
                    <button class="check-btn" id="checkMathBtn">${I18N.t('check')}</button>
                </div>
            `);
        }

        const checkAnswer = () => {
            const userAnswer = parseInt(document.getElementById('mathInput').value);
            const isCorrect = userAnswer === correctAnswer;
            this.closeModal();
            callback(isCorrect);
        };

        document.getElementById('checkMathBtn').addEventListener('click', checkAnswer);
        document.getElementById('mathInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') checkAnswer();
        });
    }

    playTimingGame(callback) {
        this.showModal(`
            <div class="minigame">
                <h3>${I18N.t('stopZone')}</h3>
                <div class="timing-bar" style="position: relative; height: 30px; background: #1a0f2e; border-radius: 15px; margin: 20px 0; overflow: hidden;">
                    <div class="timing-indicator" style="position: absolute; width: 10px; height: 100%; background: #ffd700; border-radius: 5px; left: 0;"></div>
                    <div class="timing-zone" style="position: absolute; height: 100%; background: #10b981;"></div>
                </div>
                <button class="stop-btn" id="stopTimingBtn">${I18N.t('stop')}</button>
            </div>
        `);

        let position = 0;
        let direction = 1;
        let animationId;

        const indicator = document.querySelector('.timing-indicator');
        const zone = document.querySelector('.timing-zone');
        const zonePosition = 30 + Math.random() * 40;
        zone.style.left = zonePosition + '%';
        zone.style.width = '20%';

        const animate = () => {
            position += direction * 2;
            if (position >= 100 || position <= 0) direction *= -1;
            indicator.style.left = position + '%';
            animationId = requestAnimationFrame(animate);
        };

        animate();

        document.getElementById('stopTimingBtn').addEventListener('click', () => {
            cancelAnimationFrame(animationId);
            const isInZone = position >= zonePosition && position <= zonePosition + 20;
            this.closeModal();
            callback(isInZone);
        });
    }

    showModal(content) {
        this.closeModal();
        this.modalElement = document.createElement('div');
        this.modalElement.className = 'modal-overlay';
        this.modalElement.innerHTML = `<div class="modal-content">${content}</div>`;
        document.body.appendChild(this.modalElement);
    }

    closeModal() {
        if (this.modalElement) {
            this.modalElement.remove();
            this.modalElement = null;
        }
    }
}

// ============ СИСТЕМА МОНСТРОВ ============
class MonsterSystem {
    constructor(game) {
        this.game = game;
        this.fragments = this.loadFragments();
        this.isFightInProgress = false;
        this.currentLocation = 'forest';
        this.lastFightCost = 0;
    }

    getLocationMonsters() {
        const location = LOCATIONS_DATA.find(l => l.id === this.currentLocation);
        if (!location) return [];
        return location.monsters
            .map(id => MONSTERS_DATA.find(m => m.id === id))
            .filter(m => m !== undefined);
    }

    getRandomMonsterFromLocation() {
        const monsters = this.getLocationMonsters();
        if (monsters.length === 0) return MONSTERS_DATA[0];

        const regularMonsters = monsters.filter(m => !m.isChest);
        const chestMonsters = monsters.filter(m => m.isChest);

        if (chestMonsters.length > 0 && Math.random() < 0.05) {
            return chestMonsters[0];
        }

        const weights = regularMonsters.map(m => 100 / m.hp);
        const totalWeight = weights.reduce((sum, w) => sum + w, 0);
        let random = Math.random() * totalWeight;

        for (let i = 0; i < regularMonsters.length; i++) {
            random -= weights[i];
            if (random <= 0) return regularMonsters[i];
        }

        return regularMonsters[regularMonsters.length - 1];
    }

    changeLocation(locationId) {
        const location = LOCATIONS_DATA.find(l => l.id === locationId);
        if (!location) return false;

        if (locationId === this.currentLocation) {
            return true;
        }

        const isAlreadyUnlocked = this.game.unlockedLocations.has(locationId);

        console.log('changeLocation:', {
            locationId,
            isAlreadyUnlocked,
            unlockedLocations: Array.from(this.game.unlockedLocations),
            mana: this.game.mana,
            cost: location.unlockCost
        });

        if (!isAlreadyUnlocked && location.unlockCost > 0 && this.game.mana < location.unlockCost) {
            const missing = location.unlockCost - this.game.mana;
            this.game.ui.showNotification(
                `❌ ${I18N.t('notEnoughMana')}! ${I18N.t('needMana')}: ${Math.floor(missing).toLocaleString()} ${I18N.t('manaCost')}`,
                'error'
            );
            return false;
        }

        if (!isAlreadyUnlocked && location.unlockCost > 0) {
            this.game.mana -= location.unlockCost;
        }

        this.currentLocation = locationId;

        if (!isAlreadyUnlocked) {
            this.game.unlockedLocations.add(locationId);
            this.game.locationsUnlocked = this.game.unlockedLocations.size;

            this.game.checkAchievements();

            const locationName = I18N.t(location.nameKey);
            this.game.ui.showNotification(
                `🎉 ${I18N.t('newLocation')}: ${location.icon} ${locationName}!${location.unlockCost > 0 ? ` (-${location.unlockCost} ${I18N.t('manaCost')})` : ''}`,
                'success'
            );
        } else {
            const locationName = I18N.t(location.nameKey);
            this.game.ui.showNotification(
                `📍 ${location.icon} ${locationName}`,
                'info'
            );
        }

        this.game.saveGame();
        this.game.ui.update();
        this.game.updateLocationUI();

        return true;
    }

    fleeFromBattle(callback) {
        if (!this.isFightInProgress) return;

        const refund = Math.floor(this.lastFightCost * 0.5);
        this.game.mana += refund;

        this.closeModal();
        this.isFightInProgress = false;

        this.game.ui.showNotification(
            `🏃 ${I18N.t('fled')}! +${refund} ${I18N.t('manaCost')}`,
            'warning'
        );

        callback(false, null);
    }

    getFightCost(monster) {
        if (monster.isChest) {
            return 0;
        }

        const baseCost = monster.manaReward * 0.5;
        if (monster.dropChance > 0) {
            const fragmentValue = this.getFragmentValue(monster.dropType);
            const fragmentCost = fragmentValue * monster.dropChance;
            return Math.floor(baseCost + fragmentCost);
        }
        return Math.floor(baseCost);
    }

    getFragmentValue(fragmentType) {
        const values = { common: 25, uncommon: 75, rare: 200, epic: 500, legendary: 1000 };
        return values[fragmentType] || 25;
    }

    getFragmentSellPrice(fragmentId) {
        const fragmentData = FRAGMENTS_DATA[fragmentId];
        if (!fragmentData) return 0;
        const prices = { common: 10, uncommon: 25, rare: 50, epic: 100, legendary: 250 };
        return prices[fragmentData.rarity] || 10;
    }

    fightMonster(monster, callback) {
        if (this.isFightInProgress) return;

        const fightCost = this.getFightCost(monster);
        this.lastFightCost = fightCost;

        if (this.game.currentHP <= 0) {
            this.game.ui.showNotification('💀 ' + I18N.t('playerDied'), 'error');
            callback(false, null);
            return;
        }

        if (!monster.isChest && this.game.mana < fightCost) {
            this.game.ui.showNotification(
                `❌ ${I18N.t('notEnoughMana')}! ${I18N.t('fightCost')}: ${fightCost} ${I18N.t('manaCost')}`,
                'error'
            );
            callback(false, null);
            return;
        }

        if (!monster.isChest) {
            this.game.mana -= fightCost;
        }

        this.isFightInProgress = true;
        this.game.ui.update();

        let monsterHP = monster.hp;
        let isMonsterDefeated = false;
        let isPlayerDefeated = false;

        const monsterDamage = monster.damage || 0;
        const playerDefense = this.game.defense || 0;
        const damageReduction = Math.floor(playerDefense * 0.7);
        const actualMonsterDamage = monsterDamage > 0 ? Math.max(1, monsterDamage - damageReduction) : 0;

        this.showModal(`
            <div class="fight-modal">
                <h3>${monster.icon} ${I18N.t(monster.nameKey)}</h3>
                <div class="monster-info">
                    <div class="monster-hp">HP: <span class="monster-hp-value">${monsterHP}</span>/${monster.hp}</div>
                    <div class="monster-stats" style="margin: 10px 0; color: #c4b5fd;">
                        ${monster.isChest ? '📦 Сундук с сокровищами!' : `
                            ${I18N.t('reward')}: ${monster.manaReward} ${I18N.t('manaCost')}
                            ${monster.dropChance > 0 ? `| ${I18N.t('fragmentChance')}: ${Math.floor(monster.dropChance * 100)}%` : ''}
                            ${monsterDamage > 0 ? `| ${I18N.t('monsterDamage')}: ${monsterDamage} → ${actualMonsterDamage} ${I18N.t('afterDefense')}` : '| Не атакует'}
                        `}
                    </div>
                </div>
                <div class="player-hp-display" style="margin: 10px 0;">
                    ❤️ ${I18N.t('yourHP')}: <span class="player-hp-value">${this.game.currentHP}</span>/${this.game.maxHP}
                    | 🛡️ ${I18N.t('defense')}: ${playerDefense}
                </div>
                <div class="fight-actions">
                    <button class="attack-btn" id="attackBtn">⚔️ ${I18N.t('attack')}</button>
                    <button class="flee-btn" id="fleeBtn">🏃 ${I18N.t('flee')}</button>
                </div>
            </div>
        `);

        const hpValue = document.querySelector('.monster-hp-value');
        const playerHPValue = document.querySelector('.player-hp-value');
        const attackBtn = document.getElementById('attackBtn');
        const fleeBtn = document.getElementById('fleeBtn');

        const attackHandler = () => {
            if (isMonsterDefeated || isPlayerDefeated) return;

            if (this.game.currentHP <= 0) {
                isPlayerDefeated = true;
                attackBtn.disabled = true;
                fleeBtn.disabled = true;
                this.closeModal();
                this.isFightInProgress = false;
                this.game.ui.showNotification('💀 ' + I18N.t('playerDied'), 'error');
                callback(false, null);
                return;
            }

            const playerDamage = Math.max(1, Math.floor(this.game.clickPower / 2));
            monsterHP -= playerDamage;
            hpValue.textContent = Math.max(0, monsterHP);

            this.showDamageAnimation(playerDamage, '#10b981');

            if (monsterHP <= 0) {
                isMonsterDefeated = true;
                attackBtn.disabled = true;
                fleeBtn.disabled = true;
                attackBtn.style.opacity = '0.5';

                setTimeout(() => {
                    this.closeModal();
                    const rewards = this.calculateRewards(monster);
                    this.isFightInProgress = false;
                    callback(true, rewards);
                }, 500);
                return;
            }

            if (actualMonsterDamage > 0) {
                this.game.currentHP = Math.max(0, this.game.currentHP - actualMonsterDamage);
                playerHPValue.textContent = this.game.currentHP;
                this.game.updateHPDisplay();

                this.showPlayerDamageAnimation(actualMonsterDamage);

                if (this.game.currentHP <= 0) {
                    isPlayerDefeated = true;
                    attackBtn.disabled = true;
                    fleeBtn.disabled = true;
                    attackBtn.style.opacity = '0.5';

                    setTimeout(() => {
                        this.closeModal();
                        this.isFightInProgress = false;
                        this.game.ui.showNotification('💀 ' + I18N.t('playerDied'), 'error');
                        callback(false, null);
                    }, 1000);
                }
            }
        };

        attackBtn.addEventListener('click', attackHandler);
        fleeBtn.addEventListener('click', () => {
            if (!isMonsterDefeated && !isPlayerDefeated) {
                this.fleeFromBattle(callback);
            }
        });
    }

    calculateRewards(monster) {
        const rewards = { mana: monster.manaReward, fragments: [] };

        if (monster.isBoss && monster.bossReward) {
            rewards.fragments.push(monster.bossReward);
            this.addFragment(monster.bossReward);

            this.game.ui.showNotification(
                `🎉 ${I18N.t('bossDefeated')}! ${I18N.t('rebirthKeyObtained')}!`,
                'success'
            );

            return rewards;
        }

        if (monster.isChest && monster.guaranteedFragments) {
            const allFragments = Object.keys(FRAGMENTS_DATA).filter(f => f !== 'rebirth_key');
            const shuffled = allFragments.sort(() => Math.random() - 0.5);

            for (let i = 0; i < monster.guaranteedFragments && i < shuffled.length; i++) {
                const fragment = shuffled[i];
                rewards.fragments.push(fragment);
                this.addFragment(fragment);
            }

            return rewards;
        }

        if (Math.random() < monster.dropChance) {
            const fragment = this.getRandomFragment(monster.dropType);
            rewards.fragments.push(fragment);
            this.addFragment(fragment);
        }

        this.game.mana += rewards.mana;
        this.game.totalMana += rewards.mana;

        return rewards;
    }

    getRandomFragment(type) {
        const fragments = {
            common: ['wood', 'stone', 'bone', 'herbs'],
            uncommon: ['iron', 'crystal', 'feather'],
            rare: ['gold', 'ruby', 'scale'],
            epic: ['dragon_heart', 'phoenix_feather', 'ancient_rune'],
            legendary: ['dragon_scale', 'ancient_heart'],
            rebirth_key: ['rebirth_key']
        };
        const typeFragments = fragments[type] || fragments.common;
        return typeFragments[Math.floor(Math.random() * typeFragments.length)];
    }

    addFragment(fragmentId) {
        if (!this.fragments[fragmentId]) this.fragments[fragmentId] = 0;
        this.fragments[fragmentId]++;
        this.saveFragments();
    }

    sellFragment(fragmentId) {
        if (this.fragments[fragmentId] && this.fragments[fragmentId] > 0) {
            const sellPrice = this.getFragmentSellPrice(fragmentId);
            this.fragments[fragmentId]--;
            if (this.fragments[fragmentId] === 0) delete this.fragments[fragmentId];

            this.game.mana += sellPrice;
            this.game.totalMana += sellPrice;

            this.saveFragments();
            this.game.ui.update();
            this.game.updateFragmentsDisplay();
            this.game.saveGame();

            const fragmentData = FRAGMENTS_DATA[fragmentId];
            this.game.ui.showNotification(`💰 ${fragmentData.icon} ${I18N.t(fragmentData.nameKey)} +${sellPrice} ${I18N.t('manaCost')}`, 'success');
        }
    }

    loadFragments() {
        const saved = localStorage.getItem('magicFragments');
        return saved ? JSON.parse(saved) : {};
    }

    saveFragments() {
        localStorage.setItem('magicFragments', JSON.stringify(this.fragments));
    }

    showDamageAnimation(damage, color = '#ef4444') {
        const modal = document.querySelector('.fight-modal');
        if (modal) {
            const damageEl = document.createElement('div');
            damageEl.className = 'damage-float';
            damageEl.textContent = `-${damage} ⚔️`;
            damageEl.style.cssText = `
                position: absolute;
                top: 40%;
                left: 30%;
                transform: translate(-50%, -50%);
                animation: floatUp 0.8s ease-out forwards;
                color: ${color};
                font-weight: bold;
                font-size: 28px;
                pointer-events: none;
                z-index: 10;
            `;
            modal.appendChild(damageEl);
            setTimeout(() => damageEl.remove(), 800);
        }
    }

    showPlayerDamageAnimation(damage) {
        const modal = document.querySelector('.fight-modal');
        if (modal) {
            const damageEl = document.createElement('div');
            damageEl.className = 'damage-float';
            damageEl.textContent = `-${damage} 💥`;
            damageEl.style.cssText = `
                position: absolute;
                top: 50%;
                left: 70%;
                transform: translate(-50%, -50%);
                animation: floatUp 0.8s ease-out forwards;
                color: #ef4444;
                font-weight: bold;
                font-size: 28px;
                pointer-events: none;
                z-index: 10;
            `;
            modal.appendChild(damageEl);
            setTimeout(() => damageEl.remove(), 800);
        }
    }

    showModal(content) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `<div class="modal-content">${content}</div>`;
        document.body.appendChild(modal);
    }

    closeModal() {
        const modal = document.querySelector('.modal-overlay');
        if (modal) modal.remove();
    }
}