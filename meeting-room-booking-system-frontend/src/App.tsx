import React from 'react';
import { Outlet, RouterProvider } from 'react-router-dom';
// import logo from './logo.svg';
import './App.css';
import router from './router';

function App() {
  return (
    <div className='app'>
      <RouterProvider router={router} />
      <Outlet />
    </div>
  );
}

export default App;
