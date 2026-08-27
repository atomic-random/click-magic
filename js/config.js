const CONFIG = {
    SAVE_KEY: 'magicClickerSave_v13',
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
    {
        id: 'wand',
        nameKey: 'artifact_wand',
        cost: 50,
        multiplier: 2,
        descriptionKey: '+2',
        icon: '🪄',
        requiredFragments: { wood: 2, herbs: 1 }
    },
    {
        id: 'bone_armor',
        nameKey: 'artifact_bone_armor',
        cost: 150,
        multiplier: 3,
        descriptionKey: '+3',
        icon: '🦴',
        requiredFragments: { bone: 3, stone: 2 }
    },
    {
        id: 'crystal_orb',
        nameKey: 'artifact_crystal_orb',
        cost: 300,
        multiplier: 4,
        descriptionKey: '+4',
        icon: '🔮',
        requiredFragments: { crystal: 3, stone: 2 }
    },
    {
        id: 'iron_sword',
        nameKey: 'artifact_iron_sword',
        cost: 800,
        multiplier: 6,
        descriptionKey: '+6',
        icon: '⚔️',
        requiredFragments: { iron: 5, bone: 3, gold: 2 }
    },
    {
        id: 'grimoire',
        nameKey: 'artifact_grimoire',
        cost: 1000,
        multiplier: 8,
        descriptionKey: '+8',
        icon: '📕',
        requiredFragments: { ancient_rune: 2, feather: 3 }
    },
    {
        id: 'phoenix_amulet',
        nameKey: 'artifact_phoenix_amulet',
        cost: 5000,
        multiplier: 16,
        descriptionKey: '+16',
        icon: '📿',
        requiredFragments: { phoenix_feather: 3, gold: 2 }
    },
    {
        id: 'dragon_blade',
        nameKey: 'artifact_dragon_blade',
        cost: 20000,
        multiplier: 32,
        descriptionKey: '+32',
        icon: '🗡️',
        requiredFragments: { dragon_heart: 3, scale: 5, ruby: 2 }
    },
    {
        id: 'dragon_scale_armor',
        nameKey: 'artifact_dragon_scale_armor',
        cost: 50000,
        multiplier: 50,
        descriptionKey: '+50',
        icon: '🛡️',
        requiredFragments: { dragon_scale: 5, iron: 10 }
    },
    {
        id: 'ancient_heart_amulet',
        nameKey: 'artifact_ancient_heart_amulet',
        cost: 100000,
        multiplier: 100,
        descriptionKey: '+100',
        icon: '💜',
        requiredFragments: { ancient_heart: 3, dragon_scale: 5, phoenix_feather: 5 }
    }
];

const FRAGMENTS_DATA = {
    wood: { nameKey: 'fragment_wood', icon: '🪵', rarity: 'common' },
    stone: { nameKey: 'fragment_stone', icon: '🪨', rarity: 'common' },
    bone: { nameKey: 'fragment_bone', icon: '🦴', rarity: 'common' },
    herbs: { nameKey: 'fragment_herbs', icon: '🌿', rarity: 'common' },

    iron: { nameKey: 'fragment_iron', icon: '⛓️', rarity: 'uncommon' },
    crystal: { nameKey: 'fragment_crystal', icon: '💎', rarity: 'uncommon' },
    feather: { nameKey: 'fragment_feather', icon: '🪶', rarity: 'uncommon' },

    gold: { nameKey: 'fragment_gold', icon: '🪙', rarity: 'rare' },
    ruby: { nameKey: 'fragment_ruby', icon: '🔴', rarity: 'rare' },
    scale: { nameKey: 'fragment_scale', icon: '🐍', rarity: 'rare' },

    dragon_heart: { nameKey: 'fragment_dragon_heart', icon: '❤️', rarity: 'epic' },
    phoenix_feather: { nameKey: 'fragment_phoenix_feather', icon: '🔥', rarity: 'epic' },
    ancient_rune: { nameKey: 'fragment_ancient_rune', icon: '📜', rarity: 'epic' },

    dragon_scale: { nameKey: 'fragment_dragon_scale', icon: '🐉', rarity: 'legendary' },
    ancient_heart: { nameKey: 'fragment_ancient_heart', icon: '💜', rarity: 'legendary' },

    rebirth_key: { nameKey: 'fragment_rebirth_key', icon: '🔑', rarity: 'mythic' }
};

const MONSTERS_DATA = [
    {
        id: 'slime',
        nameKey: 'monster_slime',
        icon: '🟢',
        hp: 5,
        damage: 2,
        dropChance: 0.9,
        dropType: 'common',
        manaReward: 10
    },
    {
        id: 'forest_spirit',
        nameKey: 'monster_forest_spirit',
        icon: '🌿',
        hp: 10,
        damage: 3,
        dropChance: 0.7,
        dropType: 'common',
        manaReward: 25
    },
    {
        id: 'goblin',
        nameKey: 'monster_goblin',
        icon: '👺',
        hp: 20,
        damage: 5,
        dropChance: 0.6,
        dropType: 'common',
        manaReward: 50
    },
    {
        id: 'skeleton',
        nameKey: 'monster_skeleton',
        icon: '💀',
        hp: 40,
        damage: 8,
        dropChance: 0.5,
        dropType: 'uncommon',
        manaReward: 100
    },
    {
        id: 'dark_mage',
        nameKey: 'monster_dark_mage',
        icon: '🧙',
        hp: 80,
        damage: 12,
        dropChance: 0.4,
        dropType: 'rare',
        manaReward: 250
    },
    {
        id: 'dragon',
        nameKey: 'monster_dragon',
        icon: '🐉',
        hp: 150,
        damage: 18,
        dropChance: 0.3,
        dropType: 'epic',
        manaReward: 500
    },
    {
        id: 'ancient_dragon',
        nameKey: 'monster_ancient_dragon',
        icon: '🐲',
        hp: 500,
        damage: 25,
        dropChance: 1.0,
        dropType: 'rebirth_key',
        manaReward: 0,
        isBoss: true,
        bossReward: 'rebirth_key'
    },
    {
        id: 'mimic_chest',
        nameKey: 'monster_mimic_chest',
        icon: '📦',
        hp: 100,
        damage: 0,
        dropChance: 1.0,
        dropType: 'chest',
        manaReward: 0,
        isChest: true,
        guaranteedFragments: 3
    }
];

const LOCATIONS_DATA = [
    { id: 'forest', nameKey: 'location_forest', icon: '🌲', unlockCost: 0, monsters: ['slime', 'forest_spirit', 'mimic_chest'] },
    { id: 'cave', nameKey: 'location_cave', icon: '🕳️', unlockCost: 500, monsters: ['forest_spirit', 'goblin', 'skeleton', 'mimic_chest'] },
    { id: 'ruins', nameKey: 'location_ruins', icon: '🏛️', unlockCost: 5000, monsters: ['goblin', 'skeleton', 'dark_mage', 'mimic_chest'] },
    { id: 'mountains', nameKey: 'location_mountains', icon: '⛰️', unlockCost: 20000, monsters: ['skeleton', 'dark_mage', 'dragon', 'mimic_chest'] },
    { id: 'dragon_lair', nameKey: 'location_dragon_lair', icon: '🐉', unlockCost: 100000, monsters: ['dark_mage', 'dragon', 'ancient_dragon', 'mimic_chest'] }
];

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
        reward: { mana: 100 },
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
        reward: { mana: 5000 },
        icon: '🏆'
    },

    {
        id: 'first_artifact',
        nameKey: 'achievement_first_artifact',
        descriptionKey: 'achievement_first_artifact_desc',
        condition: (state) => state.artifacts.some(a => a.purchased),
        reward: { mana: 200 },
        icon: '🪄'
    },
    {
        id: 'all_artifacts',
        nameKey: 'achievement_all_artifacts',
        descriptionKey: 'achievement_all_artifacts_desc',
        condition: (state) => state.artifacts.every(a => a.purchased),
        reward: { mana: 10000 },
        icon: '⚡'
    },
    {
        id: 'first_monster',
        nameKey: 'achievement_first_monster',
        descriptionKey: 'achievement_first_monster_desc',
        condition: (state) => state.monstersKilled >= 1,
        reward: { mana: 50 },
        icon: '⚔️'
    },
    {
        id: 'monster_hunter',
        nameKey: 'achievement_monster_hunter',
        descriptionKey: 'achievement_monster_hunter_desc',
        condition: (state) => state.monstersKilled >= 10,
        reward: { mana: 500 },
        icon: '🏹'
    },
    {
        id: 'monster_slayer',
        nameKey: 'achievement_monster_slayer',
        descriptionKey: 'achievement_monster_slayer_desc',
        condition: (state) => state.monstersKilled >= 50,
        reward: { mana: 5000 },
        icon: '🗡️'
    },
    {
        id: 'first_boss',
        nameKey: 'achievement_first_boss',
        descriptionKey: 'achievement_first_boss_desc',
        condition: (state) => state.bossesKilled >= 1,
        reward: { mana: 5000 },
        icon: '🐲'
    },
    {
        id: 'chest_opener',
        nameKey: 'achievement_chest_opener',
        descriptionKey: 'achievement_chest_opener_desc',
        condition: (state) => state.chestsOpened >= 1,
        reward: { mana: 300 },
        icon: '📦'
    },
    {
        id: 'first_prestige',
        nameKey: 'achievement_first_prestige',
        descriptionKey: 'achievement_first_prestige_desc',
        condition: (state) => state.prestigeCount >= 1,
        reward: { mana: 10000 },
        icon: '🔮'
    },
    {
        id: 'location_traveler',
        nameKey: 'achievement_location_traveler',
        descriptionKey: 'achievement_location_traveler_desc',
        condition: (state) => state.locationsUnlocked >= 2,
        reward: { mana: 500 },
        icon: '🚶'
    },
    {
        id: 'location_explorer',
        nameKey: 'achievement_location_explorer',
        descriptionKey: 'achievement_location_explorer_desc',
        condition: (state) => state.locationsUnlocked >= 3,
        reward: { mana: 2000 },
        icon: '🗺️'
    },
    {
        id: 'location_master',
        nameKey: 'achievement_location_master',
        descriptionKey: 'achievement_location_master_desc',
        condition: (state) => state.locationsUnlocked >= 5,
        reward: { mana: 10000 },
        icon: '🌍'
    },
    {
        id: 'rich_mage',
        nameKey: 'achievement_rich_mage',
        descriptionKey: 'achievement_rich_mage_desc',
        condition: (state) => state.totalMana >= 1000000,
        reward: { mana: 50000 },
        icon: '💎'
    }
];