import { Flex, Menu } from 'antd';
import { Outlet } from 'react-router-dom';
import { USER_INFO } from '../../../common/const';
import './index.css';

const items = [
  {
    key: 'admin/meetings',
    label: '会议室管理',
  },
  {
    key: 'admin/userList',
    label: '用户管理',
  },
];

const AdminIndex = function() {
  const userInfo = JSON.parse(localStorage.getItem(USER_INFO) || '');
  const isRedirect = !userInfo.isAdmin;
  return (
    <div className='admin-index-container'>
      <Flex>
        <div className='left-menu'>
          <Menu items={items}></Menu>
        </div>
        <div className='content'>
          <Outlet context={{ isRedirect }} />
        </div>
      </Flex>
    </div>
  );
};

export default AdminIndex;
