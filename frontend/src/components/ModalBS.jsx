import API_URL from '../constants/constants.js'
import { FaBaby, FaCalendar } from 'react-icons/fa';
import { LuBaby } from 'react-icons/lu';


export const ModalBS = ({ isOpen, onClose, onAccept, parentId }) => {
  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const name = e.target.name.value;
    const gender = e.target.gender.value;
    const birthDate = e.target.birthDate.value;

    try {
      const response = await fetch(`${API_URL}/baby`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, gender, birthDate, parentId, socketId: '' }),
      });

      if (response.ok) {
        console.log('Baby created successfully');
        onAccept();
      } else {
        console.log('Error creating baby');
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className='modal'>
      <div className='modal-content'>
        <span className='close' onClick={onClose}>
          &times;
        </span>
        <form onSubmit={handleSubmit} className='modal-form'>
          <h1>Registrar Bebé</h1>
          <div className='input-group'>
            <FaBaby className='form-icon' />
            <input type='text' name='name' placeholder='Nombre' className='modal-input' />
          </div>

          <div className='input-group'>
            <LuBaby className='form-icon' />
            <select name='gender' className='modal-select'>
              <option value='male'>Masculino</option>
              <option value='female'>Femenino</option>
            </select>
          </div>
          <div className='input-group'>
            <FaCalendar className='form-icon' />
            <input type='date' name='birthDate' className='modal-input' />
          </div>

          <button type='button' onClick={onClose} className='modal-button cancel'>
            Cancelar
          </button>
          <button type='submit' className='modal-button accept'>
            Aceptar
          </button>
        </form>
      </div>
    </div>
  );
};
