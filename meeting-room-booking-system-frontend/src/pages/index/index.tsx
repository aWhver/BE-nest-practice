import { Outlet, Link } from 'react-router-dom';
import { UserOutlined } from '@ant-design/icons';
import { Flex } from 'antd';
import './index.css';

const Index: React.FC = function() {
  return (
    <div className='home-container'>
      <header className='header-container'>
        <Flex justify='space-between'>
          <h2>会议室预定系统</h2>
          <Link to="/userInfo">
            <UserOutlined className='icon' />
          </Link>
        </Flex>
      </header>
      <section className='body-container'>
        <Outlet />
      </section>
    </div>
  );
};

export default Index;
