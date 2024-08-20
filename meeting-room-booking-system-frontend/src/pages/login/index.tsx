import { Button, Flex, Form, Input, Spin, message } from 'antd';
import { login } from '../../api/user/registerLogin';
import './index.css';
import {
  ACCESS_TOKEN,
  REFRESH_TOKEN,
  SERVER,
  USER_INFO,
} from '../../common/const';
import { Link } from 'react-router-dom';
import router from '../../router';
import { useState } from 'react';

const FormItem = Form.Item;

const Login: React.FC = function() {
  const [spinning, setSpinning] = useState(false);
  const onFinish = function(values: { username: string; password: string }) {
    login(values).then((res) => {
      if (res.code === 200) {
        const data = res.data;
        localStorage.setItem(ACCESS_TOKEN, data.access_token);
        localStorage.setItem(REFRESH_TOKEN, data.refresh_token);
        localStorage.setItem(USER_INFO, JSON.stringify(data.userInfo));
        message.success('登录成功');
        setTimeout(() => {
          router.navigate('/meetingRoomList');
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
          <FormItem
            labelCol={{ span: 22 }}
            wrapperCol={{
              span: 2,
              offset: 22,
            }}
          >
            <Button
              type='link'
              style={{ padding: 0 }}
              onClick={() => {
                setSpinning(true);
                window.location.href = `${SERVER}/auth/github/login`;
              }}
            >
              <svg
                height='32'
                aria-hidden='true'
                viewBox='0 0 24 24'
                version='1.1'
                width='32'
                data-view-component='true'
              >
                <path d='M12.5.75C6.146.75 1 5.896 1 12.25c0 5.089 3.292 9.387 7.863 10.91.575.101.79-.244.79-.546 0-.273-.014-1.178-.014-2.142-2.889.532-3.636-.704-3.866-1.35-.13-.331-.69-1.352-1.18-1.625-.402-.216-.977-.748-.014-.762.906-.014 1.553.834 1.769 1.179 1.035 1.74 2.688 1.25 3.349.948.1-.747.402-1.25.733-1.538-2.559-.287-5.232-1.279-5.232-5.678 0-1.25.445-2.285 1.178-3.09-.115-.288-.517-1.467.115-3.048 0 0 .963-.302 3.163 1.179.92-.259 1.897-.388 2.875-.388.977 0 1.955.13 2.875.388 2.2-1.495 3.162-1.179 3.162-1.179.633 1.581.23 2.76.115 3.048.733.805 1.179 1.825 1.179 3.09 0 4.413-2.688 5.39-5.247 5.678.417.36.776 1.05.776 2.128 0 1.538-.014 2.774-.014 3.162 0 .302.216.662.79.547C20.709 21.637 24 17.324 24 12.25 24 5.896 18.854.75 12.5.75Z'></path>
              </svg>
            </Button>
          </FormItem>
        </Form>
      </div>
    </Spin>
  );
};

export default Login;
