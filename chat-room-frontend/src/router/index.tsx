import { RouteObject, createBrowserRouter } from 'react-router-dom';
import React from 'react';
import Register from '@pages/register';
import NotFound from '@pages/404';
import Login from '@pages/login';
import Index from '@/pages/index';
import UpdatePassword from '@/pages/updatePassword';
import UserInfoEdit from '@/pages/userInfoEdit';

const routes: RouteObject[] = [
  {
    path: '/',
    errorElement: <NotFound />,
    element: <Index />,
    children: [
      {
        path: "updatePassword",
        element: <UpdatePassword />
      },
      {
        path: "userInfo",
        element: <UserInfoEdit />
      }
    ]
  },
  {
    path: 'register',
    element: <Register />,
  },
  {
    path: 'login',
    element: <Login />,
  },
];

export default createBrowserRouter(routes);
