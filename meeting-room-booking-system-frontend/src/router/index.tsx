import { RouteObject, createBrowserRouter } from 'react-router-dom';
import Index from '../pages/index';
import NotFound from '../pages/404';
import Register from '../pages/register';
import Login from '../pages/login';
import UpdatePassword from '../pages/updatePassword';
import UserInfoEdit from '../pages/userInfoEdit';

const routes: RouteObject[] = [
  {
    path: '/',
    element: <Index />,
    errorElement: <NotFound />,
    children: [
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
  {
    path: 'updatePassword',
    element: <UpdatePassword />,
  },
];

export default createBrowserRouter(routes);
