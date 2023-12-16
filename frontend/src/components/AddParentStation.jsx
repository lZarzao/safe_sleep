import { FaUser } from 'react-icons/fa';
export const AddParentModal = ({
  isOpen,
  onClose,
  user,
  userIsParent,
  handleAddMember,
  email,
  setEmail,
  handleSearch,
}) => {
  if (!isOpen) return null;
  return (
    <div className='modal'>
      <div className='modal-content'>
        <span className='close' onClick={onClose}>
          &times;
        </span>
        <form onSubmit={handleAddMember} className='modal-form'>
          <h1>Añadir Padre</h1>
          <div>
            <div className='input-group addParentStation'>
              <FaUser className='form-icon' />
              <input
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder='Buscar padres'
                className='modal-input'
              />
            </div>
            <button type='button' onClick={handleSearch} className='modal-button accept'>
              Buscar
            </button>
          </div>
          {user && (
            <div className='member-card addParent'>
              <div className='member-info'>
                <p>{user.name}</p>
                <p className={!userIsParent ? 'status-disconnected' : 'status-connected'}>
                  {!userIsParent ? 'No disponible' : 'Disponible'}
                </p>
              </div>
              <div className='member-button'>
                <button type='submit' className={!userIsParent ? 'disabled' : ''} disabled={!userIsParent}>
                  Añadir
                </button>
              </div>
            </div>
          )}
          <div className='modal-buttons addParentStation'>
            <button type='button' onClick={onClose} className='modal-button cancel addParentStation'>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
