class Game {
    constructor() {
        I18N.loadLanguage();

        this.mana = 0;
        this.totalMana = 0;
        this.clickPower = 1;
        this.passiveIncome = 0;
        this.ranks = RANKS_DATA.map(r => ({...r, purchased: false}));
        this.artifacts = ARTIFACTS_DATA.map(a => ({...a, purchased: false}));
        this.unlockedAchievements = new Set();

        this.ui = new UI(this);
        this.minigameManager = new MinigameManager();
        this.monsterSystem = new MonsterSystem(this);

        this.loadGame();
        this.startGameLoop();
        this.startAutoSave();
        this.ui.update();
        this.updateFragmentsDisplay();
    }

    handleClick(event) {
        this.mana += this.clickPower;
        this.totalMana += this.clickPower;

        this.ui.showFloatingNumber(event, this.clickPower);
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
        this.clickPower *= artifact.multiplier;

        this.monsterSystem.saveFragments();
        this.ui.update();
        this.updateFragmentsDisplay();
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

        this.ui.showNotification(`⚔️ ${monster.icon} ${I18N.t(monster.nameKey)}! ${I18N.t('fightCost')}: ${fightCost} ${I18N.t('manaCost')}`, 'info');

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

        if (achievement.reward.mana) this.mana += achievement.reward.mana;
        if (achievement.reward.clickPower) this.clickPower += achievement.reward.clickPower;

        const achievementName = I18N.t(achievement.nameKey);
        this.ui.showNotification(`${achievement.icon} ${I18N.t('achievementUnlocked')}: ${achievementName}!`, 'warning');
        this.ui.update();
        this.saveGame();
    }

    saveGame() {
        return SaveManager.save({
            mana: this.mana,
            totalMana: this.totalMana,
            clickPower: this.clickPower,
            passiveIncome: this.passiveIncome,
            ranks: this.ranks.map(r => ({id: r.id, purchased: r.purchased})),
            artifacts: this.artifacts.map(a => ({id: a.id, purchased: a.purchased})),
            achievements: Array.from(this.unlockedAchievements),
            fragments: this.monsterSystem.fragments
        });
    }

    loadGame() {
        const data = SaveManager.load();
        if (data) this.importState(data);
    }

    importState(data) {
        if (!data) return;

        this.mana = this.validateNumber(data.mana, 0, Number.MAX_SAFE_INTEGER, 0);
        this.totalMana = this.validateNumber(data.totalMana, 0, Number.MAX_SAFE_INTEGER, 0);
        this.clickPower = this.validateNumber(data.clickPower, 1, 1000000, 1);
        this.passiveIncome = this.validateNumber(data.passiveIncome, 0, 1000000, 0);

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
        this.clickPower = 1;
        this.passiveIncome = 0;
        this.ranks = RANKS_DATA.map(r => ({...r, purchased: false}));
        this.artifacts = ARTIFACTS_DATA.map(a => ({...a, purchased: false}));
        this.unlockedAchievements.clear();
        this.monsterSystem.fragments = {};
        this.monsterSystem.saveFragments();

        this.ui.update();
        this.updateFragmentsDisplay();
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
});