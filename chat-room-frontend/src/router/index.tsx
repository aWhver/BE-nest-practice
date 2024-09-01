import { RouteObject, createBrowserRouter } from 'react-router-dom';
import React from 'react';
import Register from '@pages/register';
import NotFound from '@pages/404';
import Login from '@pages/login';
import Index from '@/pages/index';
import UpdatePassword from '@/pages/updatePassword';
import UserInfoEdit from '@/pages/userInfoEdit';
import Nav from '@/pages/nav';
import Chat from '@/pages/chat';
import FriendShip from '@/pages/friendship';
import Notification from '@/pages/notification';

const routes: RouteObject[] = [
  {
    path: '/',
    errorElement: <NotFound />,
    element: <Index />,
    children: [
      {
        path: '/',
        element: <Nav />,
        children: [
          {
            path: '/',
            element: <Chat />,
          },
          {
            path: 'friendship',
            element: <FriendShip />,
          },
          {
            path: 'notification',
            element: <Notification />,
          },
        ],
      },
      {
        path: 'updatePassword',
        element: <UpdatePassword />,
      },
      {
        path: 'userInfo',
        element: <UserInfoEdit />,
      },
    ],
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
