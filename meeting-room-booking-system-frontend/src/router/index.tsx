import { RouteObject, createBrowserRouter } from 'react-router-dom';
import Index from '../pages/index';
import NotFound from '../pages/404';
import Register from '../pages/register';
import Login from '../pages/login';
import UpdatePassword from '../pages/updatePassword';
import UserInfoEdit from '../pages/userInfoEdit';
import MenuIndex from '../pages/menu/index';
import UserList from '../pages/adminPages/users';
import MeetingRooms from '../pages/meetingRooms';
import BookHistory from '../pages/bookHistory';
import { isAdmin } from '../common/utils';

const adminRoutes = [
  {
    path: 'userList',
    element: <UserList />,
  },
];

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
      {
        path: '/',
        element: <MenuIndex />,
        children: [
          {
            path: '',
            element: <MeetingRooms />,
          },
          {
            path: 'meetingRoomList',
            element: <MeetingRooms />,
          },
          {
            path: 'bookHistory',
            element: <BookHistory />,
          },
        ].concat(isAdmin() ? [...adminRoutes] : []),
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
