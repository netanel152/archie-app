import { useState, useEffect, type ReactNode } from 'react';

// src/components/providers/LanguageProvider.tsx


import { User } from '@/entities/User'; // Corrected import path with alias


// Define the shape of all possible translation keys, based on the 'en' object.
// This gives us autocomplete and prevents typos when using the t() function.
type TranslationKey = keyof typeof translations.en;

type TranslationOptions = {
    [key: string]: string | number;
};

// Define the "contract" for our context, so other components know what to expect.
type LanguageContextType = {
    t: (key: TranslationKey, options?: TranslationOptions) => string;
    language: 'en' | 'he';
    setLanguage: (lang: 'en' | 'he') => Promise<void>;
};

// Define the props for the LanguageProvider component itself.
type LanguageProviderProps = {
    children: ReactNode;
};

// --- End of Type Definitions ---

import { translations } from './LanguageContext';

import { LanguageContext } from './LanguageContext';

export function LanguageProvider({ children }: LanguageProviderProps) {
    const [language, setLanguage] = useState<'en' | 'he'>('en');
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchUserLanguage = async () => {
            try {
                const user = await User.me();
                const pref = user.language_preference || navigator.language.split('-')[0];
                setLanguage(pref === 'he' ? 'he' : 'en');
            } catch {
                const browserLang = navigator.language.split('-')[0];
                setLanguage(browserLang === 'he' ? 'he' : 'en');
            } finally {
                setLoading(false);
            }
        };
        fetchUserLanguage();
    }, []);
    
    useEffect(() => {
        document.documentElement.lang = language;
        document.documentElement.dir = language === 'he' ? 'rtl' : 'ltr';
    }, [language]);

    const setAppLanguage = async (lang: 'en' | 'he'): Promise<void> => {
        setLanguage(lang);
        try {
            await User.updateMyUserData({ language_preference: lang });
        } catch {
            console.warn("Could not save language preference for guest user.");
        }
    };

    const t = (key: TranslationKey, options?: TranslationOptions): string => {
        let translation = translations[language][key] || translations['en'][key] || key;
        if (options) {
            Object.keys(options).forEach(k => {
                const regex = new RegExp(`{{${k}}}`, 'g');
                translation = translation.replace(regex, String(options[k]));
            });
        }
        return translation;
    };

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900" />
        </div>;
    }

    const contextValue: LanguageContextType = {
        t,
        language,
        setLanguage: setAppLanguage
    };

    return (
        <LanguageContext.Provider value={contextValue}>
            {children}
        </LanguageContext.Provider>
    );
}

