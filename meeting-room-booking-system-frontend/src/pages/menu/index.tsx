import { Flex, Menu, MenuProps } from 'antd';
import { Outlet, useNavigate } from 'react-router-dom';
import { USER_INFO } from '../../common/const';
import './index.css';
import { isAdmin } from '../../common/utils';
import { useMemo } from 'react';

function getDefaultselectKey() {
  const pathname = window.location.pathname;
  const key = pathname.split('/').pop() || 'meetingRoomList';
  return key as string;
}

const MenuIndex = function() {
  const userInfo = JSON.parse(localStorage.getItem(USER_INFO) || '');
  const isRedirect = !userInfo.isAdmin;
  const navigate = useNavigate();
  const onMenuClick: MenuProps['onClick'] = function(menu) {
    console.log('menu', menu);
    navigate(menu.key);
  };
  const items = useMemo(() => {
    const adminItems = [
      {
        key: 'userList',
        label: '用户管理',
      },
    ];
    return [
      {
        key: 'meetingRoomList',
        label: '会议室',
      },
      {
        key: 'bookHistory',
        label: '预定历史',
      },
    ].concat(isAdmin() ? [...adminItems] : []);
  }, []);
  return (
    <div className='admin-index-container'>
      <Flex>
        <div className='left-menu'>
          <Menu
            items={items}
            defaultSelectedKeys={[getDefaultselectKey()]}
            onClick={onMenuClick}
          ></Menu>
        </div>
        <div className='content'>
          <Outlet context={{ isRedirect }} />
        </div>
      </Flex>
    </div>
  );
};

export default MenuIndex;
