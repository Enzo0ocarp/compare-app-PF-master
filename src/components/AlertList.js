import React from 'react';

const AlertList = ({ alerts }) => {
    return (
        <ul className="alert-list">
            {alerts.map((alert, index) => (
                <li key={index}>{alert}</li>
            ))}
        </ul>
    );
};

export default AlertList;
