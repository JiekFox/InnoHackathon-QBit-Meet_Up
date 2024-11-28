import React from 'react';

function PhotoUpload({ photo, onPhotoUpload, classVisible }) {
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
                    <div className="placeholder">Upload photo</div>
                )}
            </div>
            <label htmlFor="photo-upload" className="photo-upload-label">
                Upload photo
            </label>
            <input
                type="file"
                id="photo-upload"
                accept="image/*"
                onChange={onPhotoUpload}
                className="photo-input"
            />
        </div>
    );
}

export default PhotoUpload;
