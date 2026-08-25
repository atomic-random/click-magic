const I18N = {
    currentLanguage: 'ru',

    translations: {
        ru: {
            gameTitle: '✨ Магический Кликер',
            gameSubtitle: 'Собирай ману и становись великим волшебником!',

            mana: '💎 Мана',
            clickPower: '⚡ Сила клика',
            passiveIncome: '🌟 Мана/сек',
            totalEarned: '📊 Всего маны',

            save: '💾 Сохранить',
            export: '📤 Экспорт',
            import: '📥 Импорт',
            reset: '🗑️ Сбросить',

            ranksTitle: '📜 Магические ранги',
            artifactsTitle: '⚡ Артефакты',

            learned: '✓ Изучен',
            received: '✓ Получен',
            manaCost: 'маны',

            gameSaved: '✨ Игра сохранена!',
            gameReset: '🗑️ Игра сброшена',
            gameExported: '📤 Сохранение экспортировано!',
            noSaveToExport: '❌ Нет сохранения для экспорта',
            gameImported: '📥 Сохранение импортировано!',
            importError: '❌ Ошибка импорта: неверный формат файла',
            importCheated: '❌ Ошибка импорта: обнаружена подделка сохранения',
            rankLearned: 'изучен!',
            artifactReceived: 'получен!',
            achievementUnlocked: 'Достижение',

            confirmReset: 'Вы уверены? Весь магический прогресс будет удалён!',

            storageInfo: 'Данные сохраняются в вашем браузере (localStorage)',

            saveError: '❌ Ошибка сохранения игры',
            loadError: '⚠️ Ошибка загрузки сохранения',
            corruptedSave: '⚠️ Сохранение повреждено или подделано',

            achievement_first_click: 'Первый шаг',
            achievement_first_click_desc: 'Сделайте первый клик',
            achievement_mana_100: 'Сотня маны',
            achievement_mana_100_desc: 'Накопите 100 маны',
            achievement_first_rank: 'Первое звание',
            achievement_first_rank_desc: 'Изучите первый ранг',
            achievement_mana_10000: 'Богач',
            achievement_mana_10000_desc: 'Накопите 10,000 маны',
            achievement_all_ranks: 'Великий маг',
            achievement_all_ranks_desc: 'Изучите все ранги',

            rank_apprentice: 'Ученик',
            rank_adept: 'Адепт',
            rank_mage: 'Маг',
            rank_warlock: 'Чародей',
            rank_archmage: 'Архимаг',
            rank_demigod: 'Полубог',

            artifact_wand: 'Волшебная палочка',
            artifact_crystal: 'Кристалл силы',
            artifact_grimoire: 'Гримуар',
            artifact_phoenix: 'Перо феникса',
            artifact_dragon: 'Сердце дракона',

            manaPerSec: 'маны/сек',
            clickPowerBoost: 'к силе клика'
        },

        en: {
            gameTitle: '✨ Magic Clicker',
            gameSubtitle: 'Collect mana and become a great wizard!',

            mana: '💎 Mana',
            clickPower: '⚡ Click Power',
            passiveIncome: '🌟 Mana/sec',
            totalEarned: '📊 Total Mana',

            save: '💾 Save',
            export: '📤 Export',
            import: '📥 Import',
            reset: '🗑️ Reset',

            ranksTitle: '📜 Magic Ranks',
            artifactsTitle: '⚡ Artifacts',

            learned: '✓ Learned',
            received: '✓ Received',
            manaCost: 'mana',

            gameSaved: '✨ Game saved!',
            gameReset: '🗑️ Game reset',
            gameExported: '📤 Save exported!',
            noSaveToExport: '❌ No save to export',
            gameImported: '📥 Save imported!',
            importError: '❌ Import error: invalid file format',
            importCheated: '❌ Import error: corrupted save detected',
            rankLearned: 'learned!',
            artifactReceived: 'received!',
            achievementUnlocked: 'Achievement',

            confirmReset: 'Are you sure? All magic progress will be deleted!',

            storageInfo: 'Data is saved in your browser (localStorage)',

            saveError: '❌ Game save error',
            loadError: '⚠️ Save loading error',
            corruptedSave: '⚠️ Save is corrupted or tampered',

            achievement_first_click: 'First Step',
            achievement_first_click_desc: 'Make your first click',
            achievement_mana_100: 'Hundred Mana',
            achievement_mana_100_desc: 'Collect 100 mana',
            achievement_first_rank: 'First Rank',
            achievement_first_rank_desc: 'Learn your first rank',
            achievement_mana_10000: 'Rich',
            achievement_mana_10000_desc: 'Collect 10,000 mana',
            achievement_all_ranks: 'Great Mage',
            achievement_all_ranks_desc: 'Learn all ranks',

            rank_apprentice: 'Apprentice',
            rank_adept: 'Adept',
            rank_mage: 'Mage',
            rank_warlock: 'Warlock',
            rank_archmage: 'Archmage',
            rank_demigod: 'Demigod',

            artifact_wand: 'Magic Wand',
            artifact_crystal: 'Power Crystal',
            artifact_grimoire: 'Grimoire',
            artifact_phoenix: 'Phoenix Feather',
            artifact_dragon: 'Dragon Heart',

            manaPerSec: 'mana/sec',
            clickPowerBoost: 'to click power'
        }
    },

    t(key) {
        const lang = this.translations[this.currentLanguage];
        return lang[key] || this.translations.ru[key] || key;
    },

    setLanguage(lang) {
        if (this.translations[lang]) {
            this.currentLanguage = lang;
            localStorage.setItem('gameLanguage', lang);
            return true;
        }
        return false;
    },

    loadLanguage() {
        const savedLang = localStorage.getItem('gameLanguage');
        if (savedLang && this.translations[savedLang]) {
            this.currentLanguage = savedLang;
        }
    },

    getCurrentLanguage() {
        return this.currentLanguage;
    }
};