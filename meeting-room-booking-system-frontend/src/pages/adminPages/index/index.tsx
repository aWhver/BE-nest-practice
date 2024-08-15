import { Flex, Menu, MenuProps } from 'antd';
import { Outlet, useNavigate } from 'react-router-dom';
import { USER_INFO } from '../../../common/const';
import './index.css';

const items = [
  {
    key: 'meetings',
    label: '会议室管理',
  },
  {
    key: 'userList',
    label: '用户管理',
  },
];

const AdminIndex = function() {
  const userInfo = JSON.parse(localStorage.getItem(USER_INFO) || '');
  const isRedirect = !userInfo.isAdmin;
  const navigate = useNavigate();
  const onMenuClick: MenuProps['onClick'] = function(menu) {
    console.log('menu', menu);
    navigate(menu.key);
  }
  return (
    <div className='admin-index-container'>
      <Flex>
        <div className='left-menu'>
          <Menu items={items} defaultSelectedKeys={['userList']} onClick={onMenuClick}></Menu>
        </div>
        <div className='content'>
          <Outlet context={{ isRedirect }} />
        </div>
      </Flex>
    </div>
  );
};

export default AdminIndex;
