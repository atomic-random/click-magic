// ============ НАСТРОЙКИ ИГРЫ ============
const CONFIG = {
    SAVE_KEY: 'magicClickerSave_v8',
    VERSION: '1.0.0',
    TICK_INTERVAL: 100,        // Интервал обновления (мс)
    AUTO_SAVE_INTERVAL: 30000, // Автосохранение каждые 30 секунд
    LANGUAGES: ['ru', 'en'],   // Доступные языки
};

// ============ ДАННЫЕ РАНГОВ ============
const RANKS_DATA = [
    {
        id: 'apprentice',
        nameKey: 'rank_apprentice',
        cost: 100,
        income: 5,
        descriptionKey: '+5',
        icon: '📖'
    },
    {
        id: 'adept',
        nameKey: 'rank_adept',
        cost: 500,
        income: 20,
        descriptionKey: '+20',
        icon: '🔮'
    },
    {
        id: 'mage',
        nameKey: 'rank_mage',
        cost: 2000,
        income: 80,
        descriptionKey: '+80',
        icon: '✨'
    },
    {
        id: 'warlock',
        nameKey: 'rank_warlock',
        cost: 8000,
        income: 300,
        descriptionKey: '+300',
        icon: '🌟'
    },
    {
        id: 'archmage',
        nameKey: 'rank_archmage',
        cost: 30000,
        income: 1000,
        descriptionKey: '+1000',
        icon: '👑'
    },
    {
        id: 'demigod',
        nameKey: 'rank_demigod',
        cost: 100000,
        income: 5000,
        descriptionKey: '+5000',
        icon: '⚡'
    }
];

// ============ ДАННЫЕ АРТЕФАКТОВ ============
const ARTIFACTS_DATA = [
    {
        id: 'wand',
        nameKey: 'artifact_wand',
        cost: 50,
        multiplier: 2,
        descriptionKey: 'x2',
        icon: '🪄'
    },
    {
        id: 'crystal',
        nameKey: 'artifact_crystal',
        cost: 300,
        multiplier: 3,
        descriptionKey: 'x3',
        icon: '💎'
    },
    {
        id: 'grimoire',
        nameKey: 'artifact_grimoire',
        cost: 1000,
        multiplier: 5,
        descriptionKey: 'x5',
        icon: '📕'
    },
    {
        id: 'phoenix',
        nameKey: 'artifact_phoenix',
        cost: 5000,
        multiplier: 10,
        descriptionKey: 'x10',
        icon: '🪶'
    },
    {
        id: 'dragon',
        nameKey: 'artifact_dragon',
        cost: 20000,
        multiplier: 50,
        descriptionKey: 'x50',
        icon: '🐉'
    }
];

// ============ СИСТЕМА ДОСТИЖЕНИЙ ============
const ACHIEVEMENTS_DATA = [
    {
        id: 'first_click',
        nameKey: 'achievement_first_click',
        descriptionKey: 'achievement_first_click_desc',
        condition: (state) => state.totalMana >= 1,
        reward: { mana: 10 },
        icon: '👆'
    },
    {
        id: 'mana_100',
        nameKey: 'achievement_mana_100',
        descriptionKey: 'achievement_mana_100_desc',
        condition: (state) => state.totalMana >= 100,
        reward: { mana: 50 },
        icon: '💯'
    },
    {
        id: 'first_rank',
        nameKey: 'achievement_first_rank',
        descriptionKey: 'achievement_first_rank_desc',
        condition: (state) => state.ranks.some(r => r.purchased),
        reward: { clickPower: 1 },
        icon: '📜'
    },
    {
        id: 'mana_10000',
        nameKey: 'achievement_mana_10000',
        descriptionKey: 'achievement_mana_10000_desc',
        condition: (state) => state.totalMana >= 10000,
        reward: { mana: 1000 },
        icon: '💰'
    },
    {
        id: 'all_ranks',
        nameKey: 'achievement_all_ranks',
        descriptionKey: 'achievement_all_ranks_desc',
        condition: (state) => state.ranks.every(r => r.purchased),
        reward: { clickPower: 100 },
        icon: '🏆'
    }
];