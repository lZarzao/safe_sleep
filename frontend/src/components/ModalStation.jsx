import React from 'react';
import { FaTimes } from 'react-icons/fa'; // Importando ícono de cierre

const Modal = ({ isOpen, toggleModal }) => {
  if (!isOpen) return null;

  return (
    <div className='modal'>
      <div className='modal-content'>
        <FaTimes className='close' onClick={toggleModal} />
        {/* Contenido del modal aquí */}
      </div>
    </div>
  );
};

export default Modal;
