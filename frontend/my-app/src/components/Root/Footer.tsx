import { useTranslation } from 'react-i18next';

export default function Footer() {
    const { t } = useTranslation();

    return (
        <footer className="footer">
            <p className="credits">
                {t('footer.title')} <br />
                {t('footer.credits')}
            </p>
        </footer>
    );
}
