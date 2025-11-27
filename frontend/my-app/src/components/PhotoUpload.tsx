import React, { useState } from 'react';
import logo from '../assets/img/handle_color_green.png';
import { ConfirmationModal } from './ConfirmationModal';

interface PhotoUploadProps {
    photo: File | string | null;
    onPhotoUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onPhotoDelete?: () => void;
    classVisible?: string;
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({
    photo,
    onPhotoUpload,
    onPhotoDelete,
    classVisible = ''
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className={`photo-upload ${classVisible}`}>
            <div className="photo-preview">
                {photo ? (
                    typeof photo === 'object' ? (
                        <img src={URL.createObjectURL(photo)} alt="Uploaded" />
                    ) : (
                        <img src={photo} alt="Uploaded" />
                    )
                ) : (
                    <img src={logo} alt="no-image" />
                )}
            </div>

            <div
                className="photo-controls"
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '10px'
                }}
            >
                {onPhotoUpload && (
                    <>
                        <label htmlFor="photo-upload" className="photo-upload-label">
                            {photo ? 'Change photo' : 'Upload photo'}
                        </label>
                        <input
                            type="file"
                            id="photo-upload"
                            accept="image/*"
                            onChange={onPhotoUpload}
                            className="photo-input"
                            style={{ display: 'none' }}
                        />
                    </>
                )}

                {photo && onPhotoDelete ? (
                    <>
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(true)}
                            className="delete-photo-button"
                        >
                            Delete photo
                        </button>

                        <ConfirmationModal
                            isOpen={isModalOpen}
                            setIsOpen={setIsModalOpen}
                            title="Delete photo?"
                            onConfirm={onPhotoDelete}
                            confirmText="Delete"
                        />
                    </>
                ) : (
                    <div style={{ height: 33 }}> </div>
                )}
            </div>
        </div>
    );
};

export default PhotoUpload;
