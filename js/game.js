class Game {
    constructor() {
        I18N.loadLanguage();

        this.mana = 0;
        this.totalMana = 0;
        this.baseClickPower = 1;
        this.clickPower = 1;
        this.passiveIncome = 0;
        this.ranks = RANKS_DATA.map(r => ({...r, purchased: false}));
        this.artifacts = ARTIFACTS_DATA.map(a => ({...a, purchased: false}));
        this.unlockedAchievements = new Set();

        this.ui = new UI(this);
        this.minigameManager = new MinigameManager();
        this.monsterSystem = new MonsterSystem(this);
        this.prestigeSystem = new PrestigeSystem(this);

        this.loadGame();
        this.startGameLoop();
        this.startAutoSave();
        this.updateClickPower();
        this.ui.update();
        this.updateFragmentsDisplay();
        this.updatePrestigeUI();
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
        this.baseClickPower = Math.floor(this.baseClickPower * (1 + (artifact.multiplier - 1) * 0.5));

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
        const monster = this.monsterSystem.getRandomMonster();
        const fightCost = this.monsterSystem.getFightCost(monster);

        if (this.mana < fightCost) {
            this.ui.showNotification(`❌ ${I18N.t('notEnoughMana')}! ${I18N.t('fightCost')}: ${fightCost} ${I18N.t('manaCost')}`, 'error');
            return;
        }

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
            }
            this.saveGame();
        });
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
        const canPrestige = hasAllRanks && hasAllArtifacts && hasEnoughMana;

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

            if (this.prestigeSystem.prestigeCount > 0) {
                requirements.push(`📊 ${I18N.t('prestigeCount')}: ${this.prestigeSystem.prestigeCount} | ${I18N.t('prestigePoints')}: ${this.prestigeSystem.prestigePoints} | ${I18N.t('prestigeBonus')}: +${this.prestigeSystem.prestigePoints * 10}%`);
            }

            prestigeInfo.innerHTML = `
                <div class="prestige-requirements">
                    ${requirements.map(r => `<div class="requirement-item">${r}</div>`).join('')}
                </div>
            `;
        }
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
                    sellBtn.addEventListener('click', () => {
                        this.monsterSystem.sellFragment(fragmentId);
                    });

                    fragmentsList.appendChild(fragmentElement);
                }
            });
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
                if (Math.floor(this.mana) % 100 === 0) {
                    this.updatePrestigeUI();
                }
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
            ranks: this.ranks.map(r => ({id: r.id, purchased: r.purchased})),
            artifacts: this.artifacts.map(a => ({id: a.id, purchased: a.purchased})),
            achievements: Array.from(this.unlockedAchievements),
            fragments: this.monsterSystem.fragments,
            prestige: this.prestigeSystem.saveData()
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

        if (data.prestige) {
            this.prestigeSystem.loadData(data.prestige);
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

        this.ui.update();
        this.updateFragmentsDisplay();
        this.updatePrestigeUI();
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
        this.ranks = RANKS_DATA.map(r => ({...r, purchased: false}));
        this.artifacts = ARTIFACTS_DATA.map(a => ({...a, purchased: false}));
        this.unlockedAchievements.clear();
        this.monsterSystem.fragments = {};
        this.monsterSystem.saveFragments();
        this.prestigeSystem.prestigePoints = 0;
        this.prestigeSystem.prestigeCount = 0;

        this.ui.update();
        this.updateFragmentsDisplay();
        this.updatePrestigeUI();
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
});