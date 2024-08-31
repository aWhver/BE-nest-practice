import { Menu, MenuProps } from 'antd';
import Layout, { Content } from 'antd/es/layout/layout';
import Sider from 'antd/es/layout/Sider';
import { Outlet, useNavigate } from 'react-router-dom';

function getDefaultselectKey() {
  const pathname = window.location.pathname;
  const key = pathname.split('/').pop() || 'chat';
  return key as string;
}

const items = [
  {
    key: 'chat',
    label: '聊天',
  },
  {
    key: 'friendship',
    label: '朋友',
  },
  {
    key: 'collection',
    label: '收藏',
  },
  {
    key: 'notification',
    label: '通知',
  },
];

const Nav = function() {
  const navigate = useNavigate();
  const onMenuClick: MenuProps['onClick'] = function(menu) {
    navigate(menu.key);
  };
  return (
    <Layout>
      <Sider
        theme='light'
        width={70}
      >
        <Menu
          style={{ width: 70, textAlign: 'center', height: '100%' }}
          items={items}
          defaultSelectedKeys={[getDefaultselectKey()]}
          onClick={onMenuClick}
        ></Menu>
      </Sider>
      <Content className='content'>
        <Outlet />
      </Content>
    </Layout>
  );
};

export default Nav;
