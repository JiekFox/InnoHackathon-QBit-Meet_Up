import React, { useState } from 'react';

export default function Profile() {
    const [formData, setFormData] = useState({
        name: '',
        surname: '',
        email: '',
        about: '',
        photo: null
    });
    const onSave = data => {
        console.log(data);
    };

    const handleChange = e => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handlePhotoUpload = e => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, photo: URL.createObjectURL(file) });
        }
    };

    const handleSubmit = e => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="profile-edit-form">
            <form onSubmit={handleSubmit} className="profile-form">
                <div className="form-fields">
                    <div className="input-group">
                        <label htmlFor="name">Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Value"
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="surname">Surname</label>
                        <input
                            type="text"
                            id="surname"
                            name="surname"
                            value={formData.surname}
                            onChange={handleChange}
                            placeholder="Value"
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Value"
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="about">About myself</label>
                        <textarea
                            id="about"
                            name="about"
                            value={formData.about}
                            onChange={handleChange}
                            placeholder="Value"
                        />
                    </div>
                    <button type="submit" className="save-button">
                        Save Changes
                    </button>
                </div>

                <div className="photo-upload">
                    <div className="photo-preview">
                        {formData.photo ? (
                            <img src={formData.photo} alt="Uploaded" />
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
                        onChange={handlePhotoUpload}
                        className="photo-input"
                    />
                </div>
            </form>
        </div>
    );
}
