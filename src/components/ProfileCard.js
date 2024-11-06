import React from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Avatar } from 'primereact/avatar';
import '../styles/ProfileCard.css';

const ProfileCard = ({ user, onEditProfile, onLogout }) => {
    const { name, email, membership, photoURL } = user; // Obtenemos los datos del usuario

    // Configuramos el encabezado de la tarjeta con la imagen de perfil
    const header = (
        <Avatar image={photoURL || '/default-profile.png'} size="xlarge" shape="circle" className="p-mb-3" />
    );

    // Configuramos el pie de la tarjeta con los botones de acción
    const footer = (
        <div className="p-d-flex p-jc-between">
            <Button label="Editar Perfil" icon="pi pi-user-edit" className="p-button-rounded p-button-success" onClick={onEditProfile} />
            <Button label="Cerrar Sesión" icon="pi pi-sign-out" className="p-button-rounded p-button-danger" onClick={onLogout} />
        </div>
    );

    return (
        <Card title={name} subTitle={membership} header={header} footer={footer} className="profile-card">
            <p className="profile-email">
                <i className="pi pi-envelope" style={{ marginRight: '.5em' }}></i>{email}
            </p>
            <br />
        </Card>
    );
};

export default ProfileCard;
