import { Form, Button, Input, message } from 'antd';
import './index.css';
import { LoginUser } from './types';
import { login } from '../../api/login';
import { useNavigate } from 'react-router';

const Login = function() {
  const navigate = useNavigate();
  const onFinish = function(values: LoginUser) {
    login(values.username, values.password).subscribe(res => {
      if (res.code === 200) {
        message.success('登录成功');
        setTimeout(() => {
          navigate('/home');
        });
      }
    });
  }
  return (
    <div className='login'>
      <Form onFinish={onFinish} autoComplete='off'>
        <Form.Item
          labelCol={{ span: 4 }}
          label='用户名'
          name='username'
          rules={[
            {
              required: true,
              message: '请输入用户名',
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          labelCol={{ span: 4 }}
          label='密码'
          name='password'
          rules={[
            {
              required: true,
              message: '请输入密码',
            },
          ]}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item labelCol={{ span: 0 }}>
          <Button htmlType='submit' type='primary'>
            登录
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Login;
