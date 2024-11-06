import React from 'react';
import { Button } from 'primereact/button';

const Header = () => {
    return (
        <div className="header">
            <h2>Compare</h2>
            <div className="header-buttons">
                <Button icon="pi pi-search" className="p-button-rounded p-button-text" />
                <Button icon="pi pi-qrcode" label="Scanea y Obtén Información Extra" className="p-button-rounded p-button-outlined" />
            </div>
        </div>
    );
};

export default Header;
