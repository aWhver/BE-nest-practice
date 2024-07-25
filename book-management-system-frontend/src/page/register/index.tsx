import { Button, Form, Input, message } from 'antd';
import './index.css';
import { RegisterUser } from './types';
import { register } from '../../api';
import { useNavigate } from 'react-router';

const layout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 20 },
};

function Register() {
  const navigate = useNavigate();
  const onFinish = function(values: RegisterUser) {
    console.log('values', values);
    const { username, password, passwordConfirm } = values;
    if (password !== passwordConfirm) {
      return message.error('２次密码不一致');
    }
    register(username, password).subscribe(res => {
      console.log('res', res);
      if (res.code === 200) {
        message.success('注册成功');
        setTimeout(() => {
          navigate('/login');
        })
      }
    });
  };
  return (
    <div className='register'>
      <h1>图书管理系统</h1>
      <Form autoComplete='off' onFinish={onFinish}>
        <Form.Item
          {...layout}
          label='用户名'
          name='username'
          rules={[
            {
              required: true,
              message: '用户名必填',
            },
          ]}
        >
          <Input placeholder='请输入用户名' />
        </Form.Item>
        <Form.Item
          {...layout}
          label='密码'
          name='password'
          rules={[
            {
              required: true,
              message: '密码必填',
            },
          ]}
        >
          <Input.Password placeholder='请输入密码' />
        </Form.Item>
        <Form.Item
          {...layout}
          label='确认密码'
          name='passwordConfirm'
          rules={[
            {
              required: true,
              message: '确认密码必填',
            },
          ]}
        >
          <Input.Password placeholder='请再次输入密码' />
        </Form.Item>
        <Form.Item {...layout} labelCol={{ span: 0 }}>
          <a href='/login'>已有账号?去登录</a>
        </Form.Item>
        <Form.Item {...layout} labelCol={{ span: 0 }}>
          <Button type='primary' htmlType='submit'>
            注册
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}

export default Register;
