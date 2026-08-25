class UI {
    constructor(game) {
        this.game = game;
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
                    this.createUpgradeCards(); // Пересоздаем карточки с новым языком
                    this.update();
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

        document.getElementById('ranksTitle').textContent = I18N.t('ranksTitle');
        document.getElementById('artifactsTitle').textContent = I18N.t('artifactsTitle');

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
            const card = this.createCard(rank, 'rank', index);
            container.appendChild(card);
        });
    }

    createArtifactCards() {
        const container = document.getElementById('perksList');
        container.innerHTML = '';

        this.game.artifacts.forEach((artifact, index) => {
            const card = this.createCard(artifact, 'artifact', index);
            container.appendChild(card);
        });
    }

    createCard(item, type, index) {
        const card = document.createElement('div');
        card.className = 'upgrade-card';
        card.id = `${type}-${item.id}`;

        const itemName = I18N.t(item.nameKey);
        const description = this.getDescription(item, type);

        card.innerHTML = `
            <div class="upgrade-name">${item.icon} ${itemName}</div>
            <div class="upgrade-cost" id="${type}-cost-${item.id}"></div>
            <div class="upgrade-effect">${description}</div>
        `;

        card.addEventListener('click', () => {
            if (type === 'rank') {
                this.game.buyRank(index);
            } else {
                this.game.buyArtifact(index);
            }
        });

        return card;
    }

    getDescription(item, type) {
        if (type === 'rank') {
            return `${item.descriptionKey} ${I18N.t('manaCost')}/${I18N.t('passiveIncome').split(' ')[1] || 'сек'}`;
        } else {
            return `${item.descriptionKey} ${I18N.t('clickPower').split(' ')[1] || 'к силе клика'}`;
        }
    }

    setupEventListeners() {
        document.getElementById('clickButton').addEventListener('click', (e) => {
            this.game.handleClick(e);
        });

        document.getElementById('saveButton').addEventListener('click', () => {
            if (this.game.saveGame()) {
                this.showNotification(I18N.t('gameSaved'), 'success');
            } else {
                this.showNotification(I18N.t('saveError'), 'error');
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
                        this.showNotification(message, 'success');
                    } else {
                        this.showNotification(message, 'error');
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
        document.getElementById('money').textContent =
            Math.floor(this.game.mana).toLocaleString();
        document.getElementById('clickPower').textContent =
            this.game.clickPower.toLocaleString();
        document.getElementById('passiveIncome').textContent =
            this.game.passiveIncome.toLocaleString();
        document.getElementById('totalEarned').textContent =
            Math.floor(this.game.totalMana).toLocaleString();
    }

    updateCards() {
        this.updateRankCards();
        this.updateArtifactCards();
    }

    updateRankCards() {
        this.game.ranks.forEach(rank => {
            this.updateCard(rank, 'rank');
        });
    }

    updateArtifactCards() {
        this.game.artifacts.forEach(artifact => {
            this.updateCard(artifact, 'artifact');
        });
    }

    updateCard(item, type) {
        const card = document.getElementById(`${type}-${item.id}`);
        const costElement = document.getElementById(`${type}-cost-${item.id}`);

        if (card && costElement) {
            if (type === 'rank') {
                costElement.textContent = item.purchased
                    ? I18N.t('learned')
                    : `${item.cost.toLocaleString()} ${I18N.t('manaCost')}`;
            } else {
                costElement.textContent = item.purchased
                    ? I18N.t('received')
                    : `${item.cost.toLocaleString()} ${I18N.t('manaCost')}`;
            }

            card.className = 'upgrade-card';

            if (item.purchased) {
                card.classList.add('owned');
            } else if (this.game.mana < item.cost) {
                card.classList.add('locked');
            }
        }
    }

    showFloatingNumber(event, amount) {
        const clickArea = document.querySelector('.click-area');
        const floatingNum = document.createElement('div');
        floatingNum.className = 'floating-number';
        floatingNum.textContent = `+${amount} ✨`;

        const buttonRect = event.target.getBoundingClientRect();
        const containerRect = clickArea.getBoundingClientRect();

        floatingNum.style.left =
            (buttonRect.left - containerRect.left + buttonRect.width / 2 - 20) + 'px';
        floatingNum.style.top =
            (buttonRect.top - containerRect.top - 10) + 'px';

        clickArea.appendChild(floatingNum);

        setTimeout(() => {
            floatingNum.remove();
        }, 1000);
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = 'notification';

        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };

        notification.style.background = colors[type] || colors.success;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transition = 'opacity 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }
}