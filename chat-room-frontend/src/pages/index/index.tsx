import { UserInfo } from '@/api/user/userInfo/types';
import { useLoginUserStore } from '@/store';
import { Layout, Image, Flex } from 'antd';
import { Header } from 'antd/es/layout/layout';
import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

const Index = function() {
  const navigate = useNavigate();
  const { userInfo, getUserInfo } = useLoginUserStore((state) => ({
    userInfo: state.userInfo as UserInfo,
    getUserInfo: state.getUserInfo,
  }));
  // console.log('userInfo', userInfo);
  useEffect(() => {
    if (Object.keys(userInfo).length === 0) {
      getUserInfo();
    }
  }, []);
  return (
    <Layout style={{ height: '100%' }}>
      <Header
        style={{ backgroundColor: '#fff', borderBottom: '1px solid #eee' }}
      >
        <Flex justify='space-between'>
          <h2>聊天室</h2>
          <Image
            onClick={() => navigate('/userInfo')}
            src={userInfo.headPic}
            width={50}
            height={50}
            preview={false}
          />
        </Flex>
      </Header>
      <Outlet />
    </Layout>
  );
};

export default Index;
