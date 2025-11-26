import { JSX } from 'react';
import logo from '../assets/img/handle_color_green.png';

interface ImagePreviewProps {
    previewUrl: string | null;
    onRemove: () => void;
}

export const ImagePreview = ({
    previewUrl,
    onRemove
}: ImagePreviewProps): JSX.Element | null => {
    if (!previewUrl) return <img src={logo} alt="no-image" />;
    return (
        <>
            <img
                src={previewUrl}
                alt="Preview"
                style={{ maxWidth: '100%', borderRadius: '8px', display: 'block' }}
            />
            <button
                type="button"
                onClick={onRemove}
                className="remove-image-btn"
                aria-label="Remove image"
            >
                ×
            </button>
        </>
    );
};
