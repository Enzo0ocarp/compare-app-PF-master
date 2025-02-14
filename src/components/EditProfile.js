// src/components/EditProfile.js
import React, { useState } from 'react';
import { updateProfile } from 'firebase/auth';
import { auth, db } from '../functions/src/firebaseConfig';
import { doc, updateDoc } from 'firebase/firestore';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';

const EditProfile = ({ user, onClose }) => {
    // Inicializamos los estados con la información actual; se asume que 'user' incluye campos extra (firstName, lastName, birthDate, bio)
    const [firstName, setFirstName] = useState(user.firstName || '');
    const [lastName, setLastName] = useState(user.lastName || '');
    const [birthDate, setBirthDate] = useState(user.birthDate || '');
    const [bio, setBio] = useState(user.bio || '');
    const [photoURL, setPhotoURL] = useState(user.photoURL || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const displayName = `${firstName} ${lastName}`;
            // Actualizamos el perfil de Firebase Auth
            await updateProfile(auth.currentUser, {
                displayName: displayName,
                photoURL: photoURL,
            });
            // Actualizamos el documento del usuario en Firestore
            await updateDoc(doc(db, "users", auth.currentUser.uid), {
                firstName,
                lastName,
                birthDate,
                bio,
                photoURL,
            });
            alert('¡Perfil actualizado exitosamente!');
            onClose();
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
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Nombre"
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Apellido</label>
                    <InputText
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Apellido"
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Fecha de Nacimiento</label>
                    <InputText
                        type="date"
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                        placeholder="Fecha de nacimiento"
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
                <div className="form-group">
                    <label>Biografía</label>
                    <InputText
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Cuéntanos algo sobre ti"
                    />
                </div>
                <Button label={loading ? "Cargando..." : "Actualizar"} type="submit" icon="pi pi-check" loading={loading} />
            </form>
            <br />
            <Button label="Cerrar" icon="pi pi-times" onClick={onClose} className="p-button-secondary" />
        </div>
    );
};

export default EditProfile;
