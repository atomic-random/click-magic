const CONFIG = {
    SAVE_KEY: 'magicClickerSave_v12',
    VERSION: '3.0.0',
    TICK_INTERVAL: 100,
    AUTO_SAVE_INTERVAL: 30000,
    LANGUAGES: ['ru', 'en'],
    PRESTIGE_MANA_COST: 50000,
    PRESTIGE_COST_MULTIPLIER: 2,
};

const RANKS_DATA = [
    { id: 'apprentice', nameKey: 'rank_apprentice', cost: 100, income: 5, descriptionKey: '+5', icon: '📖', examDifficulty: 1 },
    { id: 'adept', nameKey: 'rank_adept', cost: 500, income: 20, descriptionKey: '+20', icon: '🔮', examDifficulty: 1 },
    { id: 'mage', nameKey: 'rank_mage', cost: 2000, income: 80, descriptionKey: '+80', icon: '✨', examDifficulty: 2 },
    { id: 'warlock', nameKey: 'rank_warlock', cost: 8000, income: 300, descriptionKey: '+300', icon: '🌟', examDifficulty: 2 },
    { id: 'archmage', nameKey: 'rank_archmage', cost: 30000, income: 1000, descriptionKey: '+1000', icon: '👑', examDifficulty: 3 },
    { id: 'demigod', nameKey: 'rank_demigod', cost: 100000, income: 5000, descriptionKey: '+5000', icon: '⚡', examDifficulty: 3 }
];

const ARTIFACTS_DATA = [
    { id: 'wand', nameKey: 'artifact_wand', cost: 50, multiplier: 1.5, descriptionKey: 'x1.5', icon: '🪄', requiredFragments: { wood: 2, crystal: 1 } },
    { id: 'crystal', nameKey: 'artifact_crystal', cost: 300, multiplier: 2, descriptionKey: 'x2', icon: '💎', requiredFragments: { crystal: 3, stone: 2 } },
    { id: 'grimoire', nameKey: 'artifact_grimoire', cost: 1000, multiplier: 3, descriptionKey: 'x3', icon: '📕', requiredFragments: { ancient_rune: 2, feather: 3 } },
    { id: 'phoenix', nameKey: 'artifact_phoenix', cost: 5000, multiplier: 5, descriptionKey: 'x5', icon: '🪶', requiredFragments: { phoenix_feather: 3, gold: 2 } },
    { id: 'dragon', nameKey: 'artifact_dragon', cost: 20000, multiplier: 10, descriptionKey: 'x10', icon: '🐉', requiredFragments: { dragon_heart: 3, scale: 5, ruby: 2 } }
];

const FRAGMENTS_DATA = {
    wood: { nameKey: 'fragment_wood', icon: '🪵', rarity: 'common' },
    stone: { nameKey: 'fragment_stone', icon: '🪨', rarity: 'common' },
    bone: { nameKey: 'fragment_bone', icon: '🦴', rarity: 'common' },
    iron: { nameKey: 'fragment_iron', icon: '⛓️', rarity: 'uncommon' },
    crystal: { nameKey: 'fragment_crystal', icon: '💎', rarity: 'uncommon' },
    feather: { nameKey: 'fragment_feather', icon: '🪶', rarity: 'uncommon' },
    gold: { nameKey: 'fragment_gold', icon: '🪙', rarity: 'rare' },
    ruby: { nameKey: 'fragment_ruby', icon: '🔴', rarity: 'rare' },
    scale: { nameKey: 'fragment_scale', icon: '🐍', rarity: 'rare' },
    dragon_heart: { nameKey: 'fragment_dragon_heart', icon: '❤️', rarity: 'epic' },
    phoenix_feather: { nameKey: 'fragment_phoenix_feather', icon: '🔥', rarity: 'epic' },
    ancient_rune: { nameKey: 'fragment_ancient_rune', icon: '📜', rarity: 'epic' }
};

const MONSTERS_DATA = [
    { id: 'slime', nameKey: 'monster_slime', icon: '🟢', hp: 10, dropChance: 0.8, dropType: 'common', manaReward: 20 },
    { id: 'goblin', nameKey: 'monster_goblin', icon: '👺', hp: 25, dropChance: 0.6, dropType: 'common', manaReward: 50 },
    { id: 'skeleton', nameKey: 'monster_skeleton', icon: '💀', hp: 50, dropChance: 0.5, dropType: 'uncommon', manaReward: 100 },
    { id: 'dark_mage', nameKey: 'monster_dark_mage', icon: '🧙', hp: 100, dropChance: 0.4, dropType: 'rare', manaReward: 250 },
    { id: 'dragon', nameKey: 'monster_dragon', icon: '🐉', hp: 200, dropChance: 0.3, dropType: 'epic', manaReward: 500 }
];

const ACHIEVEMENTS_DATA = [
    { id: 'first_click', nameKey: 'achievement_first_click', descriptionKey: 'achievement_first_click_desc', condition: (state) => state.totalMana >= 1, reward: { mana: 10 }, icon: '👆' },
    { id: 'mana_100', nameKey: 'achievement_mana_100', descriptionKey: 'achievement_mana_100_desc', condition: (state) => state.totalMana >= 100, reward: { mana: 50 }, icon: '💯' },
    { id: 'first_rank', nameKey: 'achievement_first_rank', descriptionKey: 'achievement_first_rank_desc', condition: (state) => state.ranks.some(r => r.purchased), reward: { clickPower: 1 }, icon: '📜' },
    { id: 'mana_10000', nameKey: 'achievement_mana_10000', descriptionKey: 'achievement_mana_10000_desc', condition: (state) => state.totalMana >= 10000, reward: { mana: 1000 }, icon: '💰' },
    { id: 'all_ranks', nameKey: 'achievement_all_ranks', descriptionKey: 'achievement_all_ranks_desc', condition: (state) => state.ranks.every(r => r.purchased), reward: { clickPower: 100 }, icon: '🏆' }
];