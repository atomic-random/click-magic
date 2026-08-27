class PrestigeSystem {
    constructor(game) {
        this.game = game;
        this.prestigePoints = 0;
        this.prestigeCount = 0;
        this.ritualPhrases = [
            'magicae_est_potentia',
            'sapientia_et_potestas',
            'lux_in_tenebris',
            'aeternum_magicae',
            'spiritus_ignis_aqua',
            'tempus_et_spatium',
            'anima_mundi_vivit',
            'per_aspera_ad_astra'
        ];
    }

    getRitualCost() {
        const baseCost = CONFIG.PRESTIGE_MANA_COST || 50000;
        const multiplier = CONFIG.PRESTIGE_COST_MULTIPLIER || 2;
        return Math.floor(baseCost * Math.pow(multiplier, this.prestigeCount));
    }

    canPrestige() {
        const hasAllRanks = this.game.ranks.every(r => r.purchased);
        const hasAllArtifacts = this.game.artifacts.every(a => a.purchased);
        const hasEnoughMana = this.game.mana >= this.getRitualCost();
        const hasRebirthKey = this.game.monsterSystem.fragments['rebirth_key'] > 0;

        return hasAllRanks && hasAllArtifacts && hasEnoughMana && hasRebirthKey;
    }

    getMissingRequirements() {
        const missing = [];
        const cost = this.getRitualCost();

        const hasAllRanks = this.game.ranks.every(r => r.purchased);
        if (!hasAllRanks) {
            const ranksNeeded = this.game.ranks.filter(r => !r.purchased).length;
            missing.push(`${I18N.t('needAllRanks')} (${ranksNeeded} ${I18N.t('remaining')})`);
        }

        const hasAllArtifacts = this.game.artifacts.every(a => a.purchased);
        if (!hasAllArtifacts) {
            const artifactsNeeded = this.game.artifacts.filter(a => !a.purchased).length;
            missing.push(`${I18N.t('needAllArtifacts')} (${artifactsNeeded} ${I18N.t('remaining')})`);
        }

        const hasEnoughMana = this.game.mana >= cost;
        if (!hasEnoughMana) {
            const manaNeeded = Math.floor(cost - this.game.mana);
            missing.push(`${I18N.t('needMana')}: ${manaNeeded.toLocaleString()} ${I18N.t('manaCost')}`);
        }

        const hasRebirthKey = this.game.monsterSystem.fragments['rebirth_key'] > 0;
        if (!hasRebirthKey) {
            missing.push(`🔑 ${I18N.t('needRebirthKey')}`);
        }

        return missing;
    }

    startRitual(callback) {
        if (!this.canPrestige()) {
            const missing = this.getMissingRequirements();
            this.game.ui.showNotification(
                `❌ ${I18N.t('prestigeRequirements')}: ${missing.join(', ')}`,
                'error'
            );
            return false;
        }

        const phrase = this.ritualPhrases[Math.floor(Math.random() * this.ritualPhrases.length)];

        this.game.ui.showModal(`
            <div class="ritual-modal">
                <h3>🔮 ${I18N.t('ritualTitle')}</h3>
                <p>${I18N.t('ritualDescription')}</p>
                <p style="color: #f59e0b; margin: 10px 0;">⚠️ ${I18N.t('ritualWarning')}</p>
                <button class="check-btn" id="startRitualBtn">${I18N.t('startRitual')}</button>
            </div>
        `);

        document.getElementById('startRitualBtn').addEventListener('click', () => {
            this.game.ui.closeModal();
            this.ritualGame(phrase, callback);
        });

        return true;
    }

    ritualGame(phrase, callback) {
        const timeLimit = 10000;
        let timeLeft = timeLimit / 1000;

        this.game.ui.showModal(`
            <div class="ritual-game">
                <h3>📜 ${I18N.t('enterRitualPhrase')}</h3>
                <p>${I18N.t('timeRemaining')}: <span id="ritualTimer">${timeLeft.toFixed(1)}</span> ${I18N.t('seconds')}</p>
                <div class="phrase-display" style="font-size: 28px; margin: 20px 0; color: #ffd700; font-family: monospace; letter-spacing: 2px;">
                    ${phrase.split('').map(char => char === '_' ? ' ' : char).join('')}
                </div>
                <input type="text" id="ritualInput" style="width: 100%; padding: 10px; font-size: 18px; background: #1a0f2e; color: white; border: 2px solid #8b5cf6; border-radius: 5px; text-align: center;">
                <button class="check-btn" id="ritualCheckBtn">${I18N.t('submit')}</button>
            </div>
        `);

        const timerElement = document.getElementById('ritualTimer');
        const inputElement = document.getElementById('ritualInput');
        let timerInterval;
        let isCompleted = false;

        const startTimer = () => {
            timerInterval = setInterval(() => {
                timeLeft -= 0.1;
                timerElement.textContent = Math.max(0, timeLeft).toFixed(1);

                if (timeLeft <= 0 && !isCompleted) {
                    clearInterval(timerInterval);
                    isCompleted = true;
                    this.game.ui.closeModal();
                    callback(false);
                }
            }, 100);
        };

        const checkPhrase = () => {
            if (isCompleted) return;

            const userPhrase = inputElement.value.trim().replace(/\s+/g, '_').toLowerCase();
            const isCorrect = userPhrase === phrase;

            clearInterval(timerInterval);
            isCompleted = true;
            this.game.ui.closeModal();
            callback(isCorrect);
        };

        document.getElementById('ritualCheckBtn').addEventListener('click', checkPhrase);
        inputElement.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') checkPhrase();
        });

        inputElement.focus();
        startTimer();
    }

    performPrestige(success) {
        if (!success) {
            this.game.ui.showNotification(`❌ ${I18N.t('ritualFailed')}`, 'error');
            return;
        }

        this.game.mana -= this.getRitualCost();
        this.game.artifacts.forEach(a => a.purchased = false);
        this.game.monsterSystem.fragments = {};
        this.game.monsterSystem.saveFragments();
        this.game.ranks.forEach(r => r.purchased = false);

        this.prestigeCount++;
        const pointsGained = this.calculatePrestigePoints();
        this.prestigePoints += pointsGained;

        this.game.updateClickPower();
        this.game.passiveIncome = 0;
        this.game.totalMana = 0;
        this.game.mana = 0;

        this.game.monsterSystem.fragments['rebirth_key']--;
        if (this.game.monsterSystem.fragments['rebirth_key'] <= 0) {
            delete this.game.monsterSystem.fragments['rebirth_key'];
        }
        this.game.monsterSystem.saveFragments();

        this.game.updatePlayerStats();
        this.game.currentHP = this.game.maxHP;
        this.game.updateHPDisplay();

        this.game.ui.update();
        this.game.updateFragmentsDisplay();
        this.game.updatePrestigeUI();
        this.game.saveGame();

        this.game.ui.showNotification(
            `✨ ${I18N.t('prestigeComplete')}! +${pointsGained} ${I18N.t('prestigePoints')}`,
            'success'
        );
    }

    calculatePrestigePoints() {
        let points = 10;
        points += Math.floor(this.game.totalMana / 100000);
        const artifactsCount = this.game.artifacts.filter(a => a.purchased).length;
        points += artifactsCount * 5;
        const ranksCount = this.game.ranks.filter(r => r.purchased).length;
        points += ranksCount * 3;
        return points;
    }

    saveData() {
        return {
            prestigePoints: this.prestigePoints,
            prestigeCount: this.prestigeCount
        };
    }

    loadData(data) {
        this.prestigePoints = data.prestigePoints || 0;
        this.prestigeCount = data.prestigeCount || 0;
    }
}