import React from 'react';
import { Toast } from 'primereact/toast';
import { useRef, useEffect } from 'react';

const Notification = ({ type, message, onClose }) => {
    const toast = useRef(null);

    useEffect(() => {
        toast.current.show({ severity: type, summary: message });
        const timer = setTimeout(() => onClose(), 3000);
        return () => clearTimeout(timer);
    }, [type, message, onClose]);

    return <Toast ref={toast} />;
};

export default Notification;
