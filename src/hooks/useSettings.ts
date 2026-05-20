// File: src/hooks/useSettings.ts
import { useEffect, useState, useCallback } from 'react';
import { settingsService, AppSettings } from '../services/settingsService';

interface UseSettingsReturn {
    settings: AppSettings | null;
    loading: boolean;
    update: (partial: Partial<AppSettings>) => Promise<void>;
    reset: () => Promise<void>;
}

export const useSettings = (): UseSettingsReturn => {
    const [settings, setSettings] = useState<AppSettings | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        settingsService.load().then(s => {
            setSettings(s);
            setLoading(false);
        });
    }, []);

    const update = useCallback(async (partial: Partial<AppSettings>) => {
        const updated = await settingsService.load();
        const merged = { ...updated, ...partial };
        await settingsService.save(merged);
        setSettings(merged);
    }, []);

    const reset = useCallback(async () => {
        await settingsService.reset();
        const fresh = await settingsService.load();
        setSettings(fresh);
    }, []);

    return { settings, loading, update, reset };
};