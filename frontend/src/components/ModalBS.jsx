import API_URL from '../constants/constants.js'

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
        <h2>Registrar Bebé</h2>
        <form onSubmit={handleSubmit}>
          <input type='text' name='name' placeholder='Nombre' />
          <select name='gender'>
            <option value='male'>Masculino</option>
            <option value='female'>Femenino</option>
          </select>
          <input type='date' name='birthDate' />
          <div>
            <button type='button' onClick={onClose}>
              Cancelar
            </button>
            <button type='submit'>Aceptar</button>
          </div>
        </form>
      </div>
    </div>
  );
};
