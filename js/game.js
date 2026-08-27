class Game {
    constructor() {
        I18N.loadLanguage();

        this.mana = 0;
        this.totalMana = 0;
        this.baseClickPower = 1;
        this.clickPower = 1;
        this.passiveIncome = 0;
        this.baseMaxHP = 100;
        this.maxHP = 100;
        this.currentHP = 100;
        this.defense = 0;
        this.ranks = RANKS_DATA.map(r => ({...r, purchased: false}));
        this.artifacts = ARTIFACTS_DATA.map(a => ({...a, purchased: false}));
        this.unlockedAchievements = new Set();

        this.monstersKilled = 0;
        this.bossesKilled = 0;
        this.chestsOpened = 0;

        this.unlockedLocations = new Set(['forest']);
        this.locationsUnlocked = 1;

        this.ui = new UI(this);
        this.minigameManager = new MinigameManager();
        this.monsterSystem = new MonsterSystem(this);
        this.prestigeSystem = new PrestigeSystem(this);

        this.loadGame();
        this.startGameLoop();
        this.startAutoSave();
        this.updateClickPower();
        this.updatePlayerStats();
        this.ui.update();
        this.updateFragmentsDisplay();
        this.updatePrestigeUI();
        this.updateHPDisplay();
        this.updateLocationUI();
    }

    handleClick(event) {
        const gainedMana = this.clickPower;
        this.mana += gainedMana;
        this.totalMana += gainedMana;

        this.ui.showFloatingNumber(event, gainedMana);
        this.ui.update();
        this.checkAchievements();
        this.saveGame();
    }

    buyRank(index) {
        const rank = this.ranks[index];
        if (this.canBuy(rank)) {
            this.mana -= rank.cost;
            this.ui.update();
            this.saveGame();

            this.minigameManager.startExam((success) => {
                if (success) {
                    rank.purchased = true;
                    this.passiveIncome += rank.income;
                    this.updatePlayerStats();
                    this.ui.update();
                    this.updatePrestigeUI();
                    this.checkAchievements();
                    this.saveGame();

                    const rankName = I18N.t(rank.nameKey);
                    this.ui.showNotification(`✅ ${rank.icon} ${rankName} ${I18N.t('rankLearned')}`, 'success');
                } else {
                    this.ui.showNotification('❌ Экзамен провален! Мана потеряна.', 'error');
                }
            });
        }
    }

    buyArtifact(index) {
        const artifact = this.artifacts[index];
        const requirements = artifact.requiredFragments;

        if (!requirements || artifact.purchased) return;

        let hasAllFragments = true;
        let missingFragments = [];

        for (const [fragmentId, count] of Object.entries(requirements)) {
            if (!this.monsterSystem.fragments[fragmentId] ||
                this.monsterSystem.fragments[fragmentId] < count) {
                hasAllFragments = false;
                const fragmentData = FRAGMENTS_DATA[fragmentId];
                const currentCount = this.monsterSystem.fragments[fragmentId] || 0;
                missingFragments.push(`${fragmentData.icon} ${I18N.t(fragmentData.nameKey)}: ${currentCount}/${count}`);
            }
        }

        if (!hasAllFragments) {
            this.ui.showNotification(`❌ ${I18N.t('notEnoughFragments')}: ${missingFragments.join(', ')}`, 'error');
            return;
        }

        if (this.mana < artifact.cost) {
            this.ui.showNotification(`❌ ${I18N.t('notEnoughMana')}: ${artifact.cost} ${I18N.t('manaCost')}`, 'error');
            return;
        }

        for (const [fragmentId, count] of Object.entries(requirements)) {
            this.monsterSystem.fragments[fragmentId] -= count;
        }
        this.mana -= artifact.cost;

        artifact.purchased = true;
        const damageBonus = Math.max(1, Math.round(artifact.multiplier));
        this.baseClickPower += damageBonus;
        this.updatePlayerStats();

        this.monsterSystem.saveFragments();
        this.updateClickPower();
        this.ui.update();
        this.updateFragmentsDisplay();
        this.updatePrestigeUI();
        this.checkAchievements();
        this.saveGame();

        const artifactName = I18N.t(artifact.nameKey);
        this.ui.showNotification(`${artifact.icon} ${artifactName} ${I18N.t('artifactReceived')}`, 'success');
    }

    startMonsterFight() {
        if (this.currentHP <= 0) {
            this.ui.showNotification('💀 ' + I18N.t('playerDied'), 'error');
            return;
        }

        if (this.currentHP < this.maxHP) {
            this.ui.showNotification('❤️ ' + I18N.t('needFullHP'), 'warning');
            return;
        }

        const monster = this.monsterSystem.getRandomMonsterFromLocation();

        this.monsterSystem.fightMonster(monster, (success, rewards) => {
            if (success && rewards) {
                let rewardText = `⚔️ ${I18N.t('victory')}! ${I18N.t('received')}: ${rewards.mana} ${I18N.t('manaCost')}`;
                if (rewards.fragments.length > 0) {
                    rewards.fragments.forEach(f => {
                        rewardText += `, ${FRAGMENTS_DATA[f].icon} ${I18N.t(FRAGMENTS_DATA[f].nameKey)}`;
                    });
                } else {
                    rewardText += ` (${I18N.t('noFragment')})`;
                }
                this.ui.showNotification(rewardText, 'success');
                this.updateFragmentsDisplay();
                this.ui.update();

                this.monstersKilled++;

                if (monster.isBoss) {
                    this.bossesKilled++;
                }

                if (monster.isChest) {
                    this.chestsOpened++;
                }
                this.checkAchievements();
            }



            this.saveGame();
        });
    }

    healPlayer() {
        if (this.currentHP >= this.maxHP) {
            this.ui.showNotification('❤️ HP уже полное!', 'info');
            return;
        }

        const missingHP = this.maxHP - this.currentHP;
        const healCost = Math.ceil(missingHP * 0.5);

        if (this.mana < healCost) {
            this.ui.showNotification(`❌ ${I18N.t('notEnoughMana')}! ${I18N.t('needMana')}: ${healCost} ${I18N.t('manaCost')}`, 'error');
            return;
        }

        this.mana -= healCost;
        this.currentHP = this.maxHP;
        this.updateHPDisplay();
        this.ui.update();
        this.saveGame();

        this.ui.showNotification(`❤️ HP +${missingHP} (${healCost} ${I18N.t('manaCost')})`, 'success');
    }

    updateHPDisplay() {
        const hpDisplay = document.getElementById('playerHP');
        if (hpDisplay) hpDisplay.textContent = `${this.currentHP}/${this.maxHP}`;

        const hpBar = document.getElementById('playerHPBar');
        if (hpBar) {
            const hpPercent = (this.currentHP / this.maxHP) * 100;
            hpBar.style.width = hpPercent + '%';
        }

        const defenseDisplay = document.getElementById('playerDefense');
        if (defenseDisplay) defenseDisplay.textContent = `🛡️ ${this.defense}`;
    }

    updatePlayerStats() {
        const ranksBonus = this.ranks.filter(r => r.purchased).length * 50;
        this.maxHP = this.baseMaxHP + ranksBonus;

        const ranksDefense = this.ranks.filter(r => r.purchased).length * 2;
        const artifactsDefense = this.artifacts.filter(a => a.purchased).length * 3;
        this.defense = ranksDefense + artifactsDefense;

        this.maxHP += this.prestigeSystem.prestigePoints * 20;
        this.defense += this.prestigeSystem.prestigePoints * 2;

        if (this.currentHP > this.maxHP) {
            this.currentHP = this.maxHP;
        }

        this.updateHPDisplay();
    }

    updateLocationUI() {
        const locationSelect = document.getElementById('locationSelect');
        if (!locationSelect) return;

        locationSelect.innerHTML = '';

        LOCATIONS_DATA.forEach(location => {
            const option = document.createElement('option');
            option.value = location.id;

            const isUnlocked = this.unlockedLocations.has(location.id);
            const isCurrent = location.id === this.monsterSystem.currentLocation;

            let text = `${location.icon} ${I18N.t(location.nameKey)}`;

            if (!isUnlocked && location.unlockCost > 0) {
                text += ` (${location.unlockCost} ${I18N.t('manaCost')})`;
            } else if (isUnlocked) {
                text += ' ✓';
            }

            option.textContent = text;

            if (isCurrent) {
                option.selected = true;
            }

            locationSelect.appendChild(option);
        });
    }

    updateClickPower() {
        const prestigeBonus = 1 + (this.prestigeSystem.prestigePoints * 0.05);
        this.clickPower = Math.max(1, Math.floor(this.baseClickPower * prestigeBonus));
    }

    updateFragmentsDisplay() {
        const fragmentsSection = document.getElementById('fragmentsSection');
        const fragmentsList = document.getElementById('fragmentsList');

        if (!fragmentsSection || !fragmentsList) return;

        const hasFragments = Object.values(this.monsterSystem.fragments).some(count => count > 0);
        fragmentsSection.style.display = hasFragments ? 'block' : 'none';

        if (hasFragments) {
            fragmentsList.innerHTML = '';

            Object.entries(this.monsterSystem.fragments).forEach(([fragmentId, count]) => {
                if (count > 0 && FRAGMENTS_DATA[fragmentId]) {
                    const fragmentData = FRAGMENTS_DATA[fragmentId];
                    const sellPrice = this.monsterSystem.getFragmentSellPrice(fragmentId);

                    const fragmentElement = document.createElement('div');
                    fragmentElement.className = 'fragment-item';
                    fragmentElement.innerHTML = `
                        <div class="fragment-info">${fragmentData.icon} ${I18N.t(fragmentData.nameKey)}: ${count}</div>
                        <button class="sell-fragment-btn" data-fragment-id="${fragmentId}">💰 ${sellPrice}</button>
                    `;

                    const sellBtn = fragmentElement.querySelector('.sell-fragment-btn');
                    sellBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.monsterSystem.sellFragment(fragmentId);
                    });

                    fragmentsList.appendChild(fragmentElement);
                }
            });
        }
    }

    tryPrestige() {
        if (this.prestigeSystem.canPrestige()) {
            this.prestigeSystem.startRitual((success) => {
                this.prestigeSystem.performPrestige(success);
            });
        } else {
            const missing = this.prestigeSystem.getMissingRequirements();
            this.ui.showNotification(
                `❌ ${I18N.t('prestigeRequirements')}: ${missing.join(', ')}`,
                'error'
            );
        }
    }

    updatePrestigeUI() {
        const prestigeBtn = document.getElementById('prestigeButton');
        const prestigeInfo = document.getElementById('prestigeInfo');

        if (!prestigeBtn) return;

        const cost = this.prestigeSystem.getRitualCost();
        const hasAllRanks = this.ranks.every(r => r.purchased);
        const hasAllArtifacts = this.artifacts.every(a => a.purchased);
        const hasEnoughMana = this.mana >= cost;
        const hasRebirthKey = this.monsterSystem.fragments['rebirth_key'] > 0;
        const canPrestige = hasAllRanks && hasAllArtifacts && hasEnoughMana && hasRebirthKey;

        prestigeBtn.textContent = `🔮 ${I18N.t('prestige')} (${Math.floor(cost).toLocaleString()} ${I18N.t('manaCost')})`;
        prestigeBtn.disabled = false;

        if (canPrestige) {
            prestigeBtn.classList.add('prestige-ready');
        } else {
            prestigeBtn.classList.remove('prestige-ready');
        }

        if (prestigeInfo) {
            const requirements = [];

            if (hasAllRanks) {
                requirements.push(`✅ ${I18N.t('needAllRanks')}`);
            } else {
                const ranksLeft = this.ranks.filter(r => !r.purchased).length;
                requirements.push(`❌ ${I18N.t('needAllRanks')} (${ranksLeft} ${I18N.t('remaining')})`);
            }

            if (hasAllArtifacts) {
                requirements.push(`✅ ${I18N.t('needAllArtifacts')}`);
            } else {
                const artifactsLeft = this.artifacts.filter(a => !a.purchased).length;
                requirements.push(`❌ ${I18N.t('needAllArtifacts')} (${artifactsLeft} ${I18N.t('remaining')})`);
            }

            if (hasEnoughMana) {
                requirements.push(`✅ ${I18N.t('needMana')}: ${Math.floor(cost).toLocaleString()} ${I18N.t('manaCost')}`);
            } else {
                const manaNeeded = Math.floor(cost - this.mana);
                requirements.push(`❌ ${I18N.t('needMana')}: ${manaNeeded.toLocaleString()} ${I18N.t('manaCost')} (${Math.floor(this.mana).toLocaleString()}/${Math.floor(cost).toLocaleString()})`);
            }

            if (hasRebirthKey) {
                requirements.push(`✅ 🔑 ${I18N.t('needRebirthKey')}`);
            } else {
                requirements.push(`❌ 🔑 ${I18N.t('needRebirthKey')}`);
            }

            if (this.prestigeSystem.prestigeCount > 0) {
                requirements.push(`📊 ${I18N.t('prestigeCount')}: ${this.prestigeSystem.prestigeCount} | ${I18N.t('prestigePoints')}: ${this.prestigeSystem.prestigePoints} | ${I18N.t('prestigeBonus')}: +${this.prestigeSystem.prestigePoints * 5}%`);
            }

            prestigeInfo.innerHTML = `
            <div class="prestige-requirements">
                ${requirements.map(r => `<div class="requirement-item">${r}</div>`).join('')}
            </div>
        `;
        }
    }

    canBuy(item) {
        return this.mana >= item.cost && !item.purchased;
    }

    startGameLoop() {
        setInterval(() => {
            if (this.passiveIncome > 0) {
                this.mana += this.passiveIncome / 10;
                this.totalMana += this.passiveIncome / 10;
                this.ui.update();
                this.checkAchievements();
            }
        }, CONFIG.TICK_INTERVAL);
    }

    startAutoSave() {
        setInterval(() => {
            this.saveGame();
        }, CONFIG.AUTO_SAVE_INTERVAL);
    }

    checkAchievements() {
        ACHIEVEMENTS_DATA.forEach(achievement => {
            if (!this.unlockedAchievements.has(achievement.id) &&
                achievement.condition(this)) {
                this.unlockAchievement(achievement);
            }
        });
    }

    unlockAchievement(achievement) {
        this.unlockedAchievements.add(achievement.id);

        if (achievement.reward.mana) {
            this.mana += achievement.reward.mana;
            this.totalMana += achievement.reward.mana;
        }

        const achievementName = I18N.t(achievement.nameKey);
        this.ui.showNotification(`${achievement.icon} ${I18N.t('achievementUnlocked')}: ${achievementName}!`, 'warning');
        this.ui.update();
        this.saveGame();
    }

    saveGame() {
        return SaveManager.save({
            mana: this.mana,
            totalMana: this.totalMana,
            baseClickPower: this.baseClickPower,
            clickPower: this.clickPower,
            passiveIncome: this.passiveIncome,
            maxHP: this.maxHP,
            currentHP: this.currentHP,
            defense: this.defense,
            ranks: this.ranks.map(r => ({id: r.id, purchased: r.purchased})),
            artifacts: this.artifacts.map(a => ({id: a.id, purchased: a.purchased})),
            achievements: Array.from(this.unlockedAchievements),
            fragments: this.monsterSystem.fragments,
            prestige: this.prestigeSystem.saveData(),
            currentLocation: this.monsterSystem.currentLocation,
            unlockedLocations: Array.from(this.unlockedLocations),
            locationsUnlocked: this.locationsUnlocked,
            monstersKilled: this.monstersKilled,
            bossesKilled: this.bossesKilled,
            chestsOpened: this.chestsOpened
        });
    }

    loadGame() {
        const data = SaveManager.load();
        if (data) {
            this.importState(data);
        }
    }

    importState(data) {
        if (!data) return;

        this.mana = this.validateNumber(data.mana, 0, Number.MAX_SAFE_INTEGER, 0);
        this.totalMana = this.validateNumber(data.totalMana, 0, Number.MAX_SAFE_INTEGER, 0);
        this.passiveIncome = this.validateNumber(data.passiveIncome, 0, 1000000, 0);
        this.baseClickPower = this.validateNumber(data.baseClickPower, 1, 1000000, 1);
        this.maxHP = this.validateNumber(data.maxHP, 100, 1000000, 100);
        this.currentHP = this.validateNumber(data.currentHP, 0, this.maxHP, this.maxHP);
        this.defense = this.validateNumber(data.defense, 0, 10000, 0);
        this.monstersKilled = this.validateNumber(data.monstersKilled, 0, 1000000, 0);
        this.bossesKilled = this.validateNumber(data.bossesKilled, 0, 1000000, 0);
        this.chestsOpened = this.validateNumber(data.chestsOpened, 0, 1000000, 0);

        if (data.unlockedLocations && Array.isArray(data.unlockedLocations)) {
            this.unlockedLocations = new Set(data.unlockedLocations);
            this.unlockedLocations.add('forest');
        } else {
            this.unlockedLocations = new Set(['forest']);
        }

        this.locationsUnlocked = this.unlockedLocations.size;

        if (data.prestige) {
            this.prestigeSystem.loadData(data.prestige);
        }

        if (data.currentLocation) {
            this.monsterSystem.currentLocation = data.currentLocation;
        }

        this.updateClickPower();

        if (data.ranks) {
            data.ranks.forEach(saved => {
                const rank = this.ranks.find(r => r.id === saved.id);
                if (rank) rank.purchased = Boolean(saved.purchased);
            });
        }

        if (data.artifacts) {
            data.artifacts.forEach(saved => {
                const artifact = this.artifacts.find(a => a.id === saved.id);
                if (artifact) artifact.purchased = Boolean(saved.purchased);
            });
        }

        if (data.achievements) {
            this.unlockedAchievements = new Set(
                data.achievements.filter(id => ACHIEVEMENTS_DATA.some(a => a.id === id))
            );
        } else {
            this.unlockedAchievements = new Set();
        }

        if (data.fragments) {
            this.monsterSystem.fragments = data.fragments;
            this.monsterSystem.saveFragments();
        }

        this.updatePlayerStats();
        this.updateHPDisplay();
        this.ui.update();
        this.updateFragmentsDisplay();
        this.updatePrestigeUI();
        this.updateLocationUI();
    }

    validateNumber(value, min, max, defaultValue) {
        const num = Number(value);
        if (isNaN(num)) return defaultValue;
        return Math.max(min, Math.min(max, num));
    }

    resetGame() {
        SaveManager.reset();

        this.mana = 0;
        this.totalMana = 0;
        this.baseClickPower = 1;
        this.clickPower = 1;
        this.passiveIncome = 0;
        this.maxHP = 100;
        this.currentHP = 100;
        this.defense = 0;
        this.ranks = RANKS_DATA.map(r => ({...r, purchased: false}));
        this.artifacts = ARTIFACTS_DATA.map(a => ({...a, purchased: false}));
        this.unlockedAchievements.clear();
        this.monsterSystem.fragments = {};
        this.monsterSystem.saveFragments();
        this.prestigeSystem.prestigePoints = 0;
        this.prestigeSystem.prestigeCount = 0;

        this.unlockedLocations = new Set(['forest']);
        this.locationsUnlocked = 1;
        this.monsterSystem.currentLocation = 'forest';

        this.monstersKilled = 0;
        this.bossesKilled = 0;
        this.chestsOpened = 0;

        this.updatePlayerStats();
        this.updateHPDisplay();
        this.ui.update();
        this.updateFragmentsDisplay();
        this.updatePrestigeUI();
        this.updateLocationUI();
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
});