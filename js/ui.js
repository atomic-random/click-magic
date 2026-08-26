class UI {
    constructor(game) {
        this.game = game;
        this.notificationContainer = null;
        this.initializeUI();
    }

    initializeUI() {
        this.createUpgradeCards();
        this.setupEventListeners();
        this.setupLanguageSwitcher();
        this.updateLanguage();
    }

    setupLanguageSwitcher() {
        const langButtons = document.querySelectorAll('.lang-btn');
        langButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const lang = btn.dataset.lang;
                if (I18N.setLanguage(lang)) {
                    this.updateLanguage();
                    this.createUpgradeCards();
                    this.update();
                    this.game.updateFragmentsDisplay();
                }
            });
        });
    }

    updateLanguage() {
        document.getElementById('gameTitle').textContent = I18N.t('gameTitle');
        document.getElementById('gameSubtitle').textContent = I18N.t('gameSubtitle');
        document.getElementById('manaLabel').textContent = I18N.t('mana');
        document.getElementById('clickPowerLabel').textContent = I18N.t('clickPower');
        document.getElementById('passiveIncomeLabel').textContent = I18N.t('passiveIncome');
        document.getElementById('totalEarnedLabel').textContent = I18N.t('totalEarned');
        document.getElementById('saveButton').textContent = I18N.t('save');
        document.getElementById('exportButton').textContent = I18N.t('export');
        document.getElementById('importButton').textContent = I18N.t('import');
        document.getElementById('resetButton').textContent = I18N.t('reset');
        document.getElementById('monsterButton').textContent = I18N.t('fightMonster');
        document.getElementById('ranksTitle').textContent = I18N.t('ranksTitle');
        document.getElementById('artifactsTitle').textContent = I18N.t('artifactsTitle');
        document.getElementById('fragmentsTitle').textContent = I18N.t('fragmentsTitle');
        document.getElementById('storageInfo').textContent = I18N.t('storageInfo');

        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === I18N.getCurrentLanguage());
        });

        document.title = I18N.t('gameTitle');
    }

    createUpgradeCards() {
        this.createRankCards();
        this.createArtifactCards();
    }

    createRankCards() {
        const container = document.getElementById('professionsList');
        container.innerHTML = '';

        this.game.ranks.forEach((rank, index) => {
            const card = document.createElement('div');
            card.className = 'upgrade-card';
            card.id = `rank-${rank.id}`;

            const rankName = I18N.t(rank.nameKey);

            card.innerHTML = `
                <div class="upgrade-name">${rank.icon} ${rankName}</div>
                <div class="upgrade-cost" id="rank-cost-${rank.id}"></div>
                <div class="upgrade-effect">${rank.descriptionKey} ${I18N.t('manaPerSec')}</div>
            `;

            card.addEventListener('click', () => {
                this.game.buyRank(index);
            });

            container.appendChild(card);
        });
    }

    createArtifactCards() {
        const container = document.getElementById('perksList');
        container.innerHTML = '';

        this.game.artifacts.forEach((artifact, index) => {
            const card = document.createElement('div');
            card.className = 'upgrade-card';
            card.id = `artifact-${artifact.id}`;

            const artifactName = I18N.t(artifact.nameKey);

            card.innerHTML = `
                <div class="upgrade-name">${artifact.icon} ${artifactName}</div>
                <div class="upgrade-cost" id="artifact-cost-${artifact.id}"></div>
                <div class="upgrade-effect">${artifact.descriptionKey} ${I18N.t('clickPowerBoost')}</div>
                <div class="fragments-requirements" id="artifact-fragments-${artifact.id}"></div>
            `;

            card.addEventListener('click', () => {
                this.game.buyArtifact(index);
            });

            container.appendChild(card);
        });
    }

    setupEventListeners() {
        document.getElementById('clickButton').addEventListener('click', (e) => {
            this.game.handleClick(e);
        });

        document.getElementById('monsterButton').addEventListener('click', () => {
            this.game.startMonsterFight();
        });

        document.getElementById('saveButton').addEventListener('click', () => {
            if (this.game.saveGame()) {
                this.showNotification(I18N.t('gameSaved'), 'success');
            }
        });

        document.getElementById('exportButton').addEventListener('click', () => {
            if (SaveManager.export()) {
                this.showNotification(I18N.t('gameExported'), 'info');
            } else {
                this.showNotification(I18N.t('noSaveToExport'), 'error');
            }
        });

        document.getElementById('importButton').addEventListener('click', () => {
            document.getElementById('importFile').click();
        });

        document.getElementById('importFile').addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                const file = e.target.files[0];

                SaveManager.import(file, (success, message, data) => {
                    if (success) {
                        this.game.importState(data);
                        this.showNotification(I18N.t('gameImported'), 'success');
                    } else {
                        this.showNotification(I18N.t('importError'), 'error');
                    }
                });

                e.target.value = '';
            }
        });

        document.getElementById('resetButton').addEventListener('click', () => {
            if (confirm(I18N.t('confirmReset'))) {
                this.game.resetGame();
                this.showNotification(I18N.t('gameReset'), 'warning');
            }
        });

        window.addEventListener('beforeunload', () => {
            this.game.saveGame();
        });
    }

    update() {
        this.updateStats();
        this.updateCards();
    }

    updateStats() {
        document.getElementById('money').textContent = Math.floor(this.game.mana).toLocaleString();
        document.getElementById('clickPower').textContent = this.game.clickPower.toLocaleString();
        document.getElementById('passiveIncome').textContent = this.game.passiveIncome.toLocaleString();
        document.getElementById('totalEarned').textContent = Math.floor(this.game.totalMana).toLocaleString();
    }

    updateCards() {
        this.updateRankCards();
        this.updateArtifactCards();
    }

    updateRankCards() {
        this.game.ranks.forEach(rank => {
            const card = document.getElementById(`rank-${rank.id}`);
            const costElement = document.getElementById(`rank-cost-${rank.id}`);

            if (card && costElement) {
                costElement.textContent = rank.purchased
                    ? I18N.t('learned')
                    : `${rank.cost.toLocaleString()} ${I18N.t('manaCost')}`;

                card.className = 'upgrade-card';

                if (rank.purchased) {
                    card.classList.add('owned');
                } else if (this.game.mana < rank.cost) {
                    card.classList.add('locked');
                }
            }
        });
    }

    updateArtifactCards() {
        this.game.artifacts.forEach(artifact => {
            const card = document.getElementById(`artifact-${artifact.id}`);
            const costElement = document.getElementById(`artifact-cost-${artifact.id}`);
            const fragmentsElement = document.getElementById(`artifact-fragments-${artifact.id}`);

            if (card && costElement) {
                costElement.textContent = artifact.purchased
                    ? I18N.t('received')
                    : `${artifact.cost.toLocaleString()} ${I18N.t('manaCost')}`;

                if (fragmentsElement && artifact.requiredFragments) {
                    let fragmentsHTML = '<div class="fragments-info">';

                    for (const [fragmentId, requiredCount] of Object.entries(artifact.requiredFragments)) {
                        const fragmentData = FRAGMENTS_DATA[fragmentId];
                        const currentCount = this.game.monsterSystem.fragments[fragmentId] || 0;
                        const hasEnough = currentCount >= requiredCount;

                        fragmentsHTML += `
                            <div class="fragment-requirement ${hasEnough ? 'has-enough' : 'not-enough'}">
                                ${fragmentData.icon} ${I18N.t(fragmentData.nameKey)}: 
                                <span class="${hasEnough ? 'text-success' : 'text-error'}">${currentCount}/${requiredCount}</span>
                            </div>
                        `;
                    }

                    fragmentsHTML += '</div>';
                    fragmentsElement.innerHTML = fragmentsHTML;
                }

                card.className = 'upgrade-card';

                if (artifact.purchased) {
                    card.classList.add('owned');
                } else {
                    let hasAllFragments = true;
                    if (artifact.requiredFragments) {
                        for (const [fragmentId, count] of Object.entries(artifact.requiredFragments)) {
                            if (!this.game.monsterSystem.fragments[fragmentId] ||
                                this.game.monsterSystem.fragments[fragmentId] < count) {
                                hasAllFragments = false;
                                break;
                            }
                        }
                    }

                    const hasEnoughMana = this.game.mana >= artifact.cost;

                    if (!hasAllFragments || !hasEnoughMana) {
                        card.classList.add('locked');
                    }
                }
            }
        });
    }

    showFloatingNumber(event, amount) {
        const clickArea = document.querySelector('.click-area');
        const floatingNum = document.createElement('div');
        floatingNum.className = 'floating-number';
        floatingNum.textContent = `+${amount} ✨`;

        const buttonRect = event.target.getBoundingClientRect();
        const containerRect = clickArea.getBoundingClientRect();

        floatingNum.style.left = (buttonRect.left - containerRect.left + buttonRect.width / 2 - 20) + 'px';
        floatingNum.style.top = (buttonRect.top - containerRect.top - 10) + 'px';

        clickArea.appendChild(floatingNum);

        setTimeout(() => floatingNum.remove(), 1000);
    }

    showNotification(message, type = 'success') {
        if (!this.notificationContainer) {
            this.notificationContainer = document.createElement('div');
            this.notificationContainer.className = 'notification-container';
            document.body.appendChild(this.notificationContainer);
        }

        const notification = document.createElement('div');
        notification.className = 'notification';

        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };

        notification.style.cssText = `
            background: ${colors[type] || colors.success};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            animation: slideIn 0.3s ease-out;
            font-weight: bold;
            pointer-events: auto;
            max-width: 300px;
            word-wrap: break-word;
        `;

        notification.textContent = message;

        const closeBtn = document.createElement('span');
        closeBtn.textContent = ' ✕';
        closeBtn.style.cssText = 'cursor: pointer; margin-left: 10px; opacity: 0.7; float: right;';
        closeBtn.addEventListener('click', () => notification.remove());
        notification.appendChild(closeBtn);

        this.notificationContainer.appendChild(notification);

        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.opacity = '0';
                notification.style.transition = 'opacity 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }
        }, 3000);
    }
}