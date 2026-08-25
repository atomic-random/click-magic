class Game {
    constructor() {
        I18N.loadLanguage();

        this.mana = 0;
        this.totalMana = 0;
        this.clickPower = 1;
        this.passiveIncome = 0;
        this.ranks = RANKS_DATA.map(r => ({...r, purchased: false}));
        this.artifacts = ARTIFACTS_DATA.map(a => ({...a, purchased: false}));
        this.achievements = [];
        this.unlockedAchievements = new Set();

        this.ui = new UI(this);

        this.loadGame();
        this.startGameLoop();
        this.startAutoSave();
        this.ui.update();
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
            rank.purchased = true;
            this.passiveIncome += rank.income;

            this.ui.update();
            this.checkAchievements();
            this.saveGame();

            const rankName = I18N.t(rank.nameKey);
            this.ui.showNotification(`${rank.icon} ${rankName} ${I18N.t('rankLearned')}`, 'success');
        }
    }

    buyArtifact(index) {
        const artifact = this.artifacts[index];
        if (this.canBuy(artifact)) {
            this.mana -= artifact.cost;
            artifact.purchased = true;
            this.clickPower *= artifact.multiplier;

            this.ui.update();
            this.checkAchievements();
            this.saveGame();

            const artifactName = I18N.t(artifact.nameKey);
            this.ui.showNotification(`${artifact.icon} ${artifactName} ${I18N.t('artifactReceived')}`, 'success');
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
        }
        if (achievement.reward.clickPower) {
            this.clickPower += achievement.reward.clickPower;
        }

        const achievementName = I18N.t(achievement.nameKey);
        this.ui.showNotification(
            `${achievement.icon} ${I18N.t('achievementUnlocked')}: ${achievementName}!`,
            'warning'
        );
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
            achievements: Array.from(this.unlockedAchievements)
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
        this.clickPower = this.validateNumber(data.clickPower, 1, 1000000, 1);
        this.passiveIncome = this.validateNumber(data.passiveIncome, 0, 1000000, 0);

        if (data.ranks) {
            data.ranks.forEach(saved => {
                const rank = this.ranks.find(r => r.id === saved.id);
                if (rank) {
                    rank.purchased = Boolean(saved.purchased);
                }
            });
        }

        if (data.artifacts) {
            data.artifacts.forEach(saved => {
                const artifact = this.artifacts.find(a => a.id === saved.id);
                if (artifact) {
                    artifact.purchased = Boolean(saved.purchased);
                }
            });
        }

        if (data.achievements) {
            this.unlockedAchievements = new Set(
                data.achievements.filter(id =>
                    ACHIEVEMENTS_DATA.some(a => a.id === id)
                )
            );
        } else {
            this.unlockedAchievements = new Set();
        }

        this.ui.update();
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

        this.ui.update();
    }
}

window.addEventListener('DOMContentLoaded', () => {
    new Game();
});