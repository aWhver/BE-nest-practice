import { createBrowserRouter } from 'react-router-dom';
import Home from '../page/home';
import Register from '../page/register';
import Login from '../page/login';

const routes = [
  {
    path: '/',
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'home',
        element: <Home />,
      },
      {
        path: 'register',
        element: <Register />,
      },
      {
        path: 'login',
        element: <Login />,
      },
    ],
  },
];

const router = createBrowserRouter(routes);

export default router;
