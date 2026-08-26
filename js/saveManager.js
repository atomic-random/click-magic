class SaveManager {
    static generateHash(data) {
        const str = JSON.stringify(data);
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(36);
    }

    static signData(data) {
        const signature = this.generateHash(data);
        return {
            ...data,
            _signature: signature
        };
    }

    static verifyData(data) {
        if (!data._signature) return false;

        const { _signature, ...dataWithoutSignature } = data;
        const expectedSignature = this.generateHash(dataWithoutSignature);

        return _signature === expectedSignature;
    }

    static save(state) {
        try {
            const saveData = this.signData({
                ...state,
                timestamp: Date.now(),
                version: CONFIG.VERSION
            });

            localStorage.setItem(CONFIG.SAVE_KEY, JSON.stringify(saveData));
            return true;
        } catch (error) {
            console.error('Save error:', error);
            return false;
        }
    }

    static load() {
        try {
            const data = localStorage.getItem(CONFIG.SAVE_KEY);
            if (!data) return null;

            const parsedData = JSON.parse(data);

            if (!this.verifyData(parsedData)) {
                console.warn('Corrupted save detected');
                return null;
            }

            return parsedData;
        } catch (error) {
            console.error('Load error:', error);
            return null;
        }
    }

    static reset() {
        localStorage.removeItem(CONFIG.SAVE_KEY);
    }

    static export() {
        const data = this.load();
        if (data) {
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `magic-clicker-save-${new Date().toISOString().slice(0, 10)}.json`;
            a.click();
            URL.revokeObjectURL(url);
            return true;
        }
        return false;
    }

    static import(file, callback) {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);

                if (!this.verifyData(data)) {
                    if (callback) {
                        callback(false, I18N.t('importCheated'), null);
                    }
                    return;
                }

                if (data.mana === undefined || data.totalMana === undefined) {
                    if (callback) {
                        callback(false, I18N.t('importError'), null);
                    }
                    return;
                }

                localStorage.setItem(CONFIG.SAVE_KEY, JSON.stringify(data));

                if (callback) {
                    callback(true, I18N.t('gameImported'), data);
                }

            } catch (error) {
                console.error('Import error:', error);
                if (callback) {
                    callback(false, I18N.t('importError'), null);
                }
            }
        };

        reader.onerror = () => {
            if (callback) {
                callback(false, I18N.t('importError'), null);
            }
        };

        reader.readAsText(file);
    }
}