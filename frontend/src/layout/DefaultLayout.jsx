import { Link } from "react-router-dom";
import { BiHomeAlt2 } from 'react-icons/bi';

const DefaultLayout = ({ children }) => {
    return (
      <div>
        <header>
          <nav>
            <ul>
              <li>
                <Link to='/'>
                  <BiHomeAlt2 className='home-icon' />
                </Link>
              </li>
              <li>
                <Link to='/signup'>Registro</Link>
              </li>
            </ul>
          </nav>
        </header>

        <main>{children}</main>
      </div>
    );
}

export default DefaultLayout