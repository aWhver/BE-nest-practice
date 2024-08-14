import { Button, Flex, Form, Input, message } from 'antd';
import { login } from '../../api/user/registerLogin';
import './index.css';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../../common/const';

const FormItem = Form.Item;

const Login: React.FC = function() {
  const onFinish = function(values: {
    username: string;
    password: string;
  }) {
    login(values).then(res => {
      if (res.code === 200) {
        const data = res.data;
        localStorage.setItem(ACCESS_TOKEN, data.access_token);
        localStorage.setItem(REFRESH_TOKEN, data.refresh_token);
        localStorage.setItem('userInfo', JSON.stringify(data.userInfo));
        message.success('登录成功');
      }
    });
  }
  return (
    <div className='login-container'>
      <h2>会议室预定系统</h2>
      <Form onFinish={onFinish} autoComplete='off' labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
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
            <a href='/register'>去注册</a>
            <a href='/updatePassword'>忘记密码</a>
          </Flex>
        </FormItem>
        <FormItem wrapperCol={{ offset: 6 }}>
          <Button style={{ width: '100%' }} type='primary' htmlType='submit'>
            登录
          </Button>
        </FormItem>
      </Form>
    </div>
  );
};

export default Login;
