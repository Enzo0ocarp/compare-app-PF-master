import React, { useState } from 'react';
import { updateProfile } from 'firebase/auth';
import { auth } from '../firebaseConfig'; // Configuración de Firebase
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';

const EditProfile = ({ user, onClose }) => {
    const [name, setName] = useState(user.displayName || '');
    const [photoURL, setPhotoURL] = useState(user.photoURL || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await updateProfile(auth.currentUser, {
                displayName: name,
                photoURL: photoURL,
            });
            alert('¡Perfil actualizado exitosamente!');
            onClose(); // Cerrar el formulario después de actualizar
        } catch (err) {
            setError('Error al actualizar el perfil: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="edit-profile-container">
            <h3>Editar Perfil</h3>
            {error && <Message severity="error" text={error} />}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Nombre</label>
                    <InputText
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Nuevo nombre"
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Foto de Perfil (URL)</label>
                    <InputText
                        value={photoURL}
                        onChange={(e) => setPhotoURL(e.target.value)}
                        placeholder="URL de la foto de perfil"
                    />
                </div>
                <Button label={loading ? "Cargando..." : "Actualizar"} type="submit" icon="pi pi-check" loading={loading} />
            </form>
            <Button label="Cerrar" icon="pi pi-times" onClick={onClose} className="p-button-secondary" />
        </div>
    );
};

export default EditProfile;
