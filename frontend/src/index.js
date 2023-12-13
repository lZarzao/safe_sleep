import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Login from './routes/Login';
import SignUp from './routes/SignUp';
import Dashboard from './routes/Dashboard';
import { AuthProvider } from './auth/AuthProvider';
import { ContextProvider } from './context/SocketContext';
import ProtectedRoute from './routes/ProtectedRoute';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Login />,
    // errorElement: <div>Error</div>
  },
  {
    path: '/signup',
    element: <SignUp />,
    // errorElement: <div>Error</div>
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        path: '/dashboard',
        element: (
            <Dashboard />
        ),
      },
    ],
    // errorElement: <div>Error</div>
  },
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <ContextProvider>
        <RouterProvider router={router} />
      </ContextProvider>
    </AuthProvider>
  </React.StrictMode>
);
