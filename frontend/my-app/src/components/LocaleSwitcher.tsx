import { useTranslation } from 'react-i18next';

export default function LocaleSwitcher() {
    const { i18n } = useTranslation();

    const handleLanguageChange = (lang: string) => {
        i18n.changeLanguage(lang);
        localStorage.setItem('i18nextLng', lang);
    };

    return (
        <div className="locale-switcher">
            <button
                className={`locale-button ${i18n.language === 'en' ? 'active' : ''}`}
                onClick={() => handleLanguageChange('en')}
                title="English"
            >
                EN
            </button>
            <button
                className={`locale-button ${i18n.language === 'ru' ? 'active' : ''}`}
                onClick={() => handleLanguageChange('ru')}
                title="Русский"
            >
                RU
            </button>
        </div>
    );
}
