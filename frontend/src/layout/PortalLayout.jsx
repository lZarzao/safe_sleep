import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import API_URL from '../constants/constants';

const PortalLayout = ({ children }) => {
  const auth = useAuth();

  const handleSignOut = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/signout`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.getRefreshToken()}`,
        },
      });
      if (response.ok) {
        auth.signOut();
      }
    } catch (error) {}
  };
  return (
    <>
      <header>
        <nav>
          <ul>
            <li>
              <Link to='/dashboard'>Dashboard</Link>
            </li>
            <li>
              <Link to='/me'>Profile</Link>
            </li>
            <li>
              <Link to='/me'>{auth.getUser()?.username ?? ''}</Link>
            </li>
            <li>
              <button onClick={handleSignOut}>Sign Out</button>
            </li>
          </ul>
        </nav>
      </header>
      <main className='dashboard'>{children}</main>
    </>
  );
};

export default PortalLayout;
