import { JSX, useState } from 'react';
import logo from '../assets/img/handle_color_green.png';
import { ConfirmationModal } from './ConfirmationModal';
import { useTranslation } from 'react-i18next';

interface ImagePreviewProps {
    previewUrl: string | null;
    onRemove: () => void;
}

export const ImagePreview = ({
    previewUrl,
    onRemove
}: ImagePreviewProps): JSX.Element | null => {
    const { t } = useTranslation();
    const [isModalOpen, setIsModalOpen] = useState(false);
    if (!previewUrl) return <img src={logo} alt={t('imagePreview.noImage')} />;

    return (
        <>
            <img
                src={previewUrl}
                alt="Preview"
                style={{ maxWidth: '100%', borderRadius: '8px', display: 'block' }}
            />
            <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="remove-image-btn"
                aria-label="Remove image"
            >
                ×
            </button>

            <ConfirmationModal
                isOpen={isModalOpen}
                setIsOpen={setIsModalOpen}
                title={t('imagePreview.deleteTitle')}
                onConfirm={onRemove}
                confirmText={t('imagePreview.deleteConfirm')}
            />
        </>
    );
};
