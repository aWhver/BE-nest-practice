import { Button, Flex, Form, Input, Spin, message } from 'antd';
import { login } from '@/api/user/registerLogin';
import './index.css';
import { ACCESS_TOKEN } from '@common/const';
import { Link } from 'react-router-dom';
import router from '@router/';
import { useState } from 'react';
import { useLoginUserStore } from '@/store';

const FormItem = Form.Item;

const Login: React.FC = function() {
  const [spinning, setSpinning] = useState(false);
  const setUserInfo = useLoginUserStore((state) => state.setUserInfo);
  const onFinish = function(values: { username: string; password: string }) {
    setSpinning(true);
    login(values).then((res) => {
      if (res.code === 200) {
        const data = res.data;
        localStorage.setItem(ACCESS_TOKEN, data.token);
        setUserInfo(data.user);
        message.success('登录成功');
        setTimeout(() => {
          router.navigate('/');
        }, 1000);
      }
    });
  };
  return (
    <Spin spinning={spinning}>
      <div className='login-container'>
        <h2>会议室预定系统</h2>
        <Form
          onFinish={onFinish}
          autoComplete='off'
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}
        >
          <FormItem
            label='用户名'
            name='username'
            rules={[
              {
                required: true,
                message: '用户名不能为空',
              },
            ]}
          >
            <Input />
          </FormItem>
          <FormItem
            label='密码'
            name='password'
            rules={[
              {
                required: true,
                message: '密码不能为空',
              },
            ]}
          >
            <Input.Password />
          </FormItem>
          <FormItem wrapperCol={{ offset: 6 }}>
            <Flex justify='space-between'>
              <Link to='/register'>去注册</Link>
              <Link to='/updatePassword'>忘记密码</Link>
            </Flex>
          </FormItem>
          <FormItem wrapperCol={{ offset: 6 }}>
            <Button style={{ width: '100%' }} type='primary' htmlType='submit'>
              登录
            </Button>
          </FormItem>
        </Form>
      </div>
    </Spin>
  );
};

export default Login;
