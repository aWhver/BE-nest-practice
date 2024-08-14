import { Button, Form, Input, message } from 'antd';
import Captcha from '../../compnents/captcha';
import './index.css';
import { UpdatePasswordFieldType } from './types';
import { updatePassword } from '../../api/user/userInfo';
import { useNavigate } from 'react-router-dom';

const FormItem = Form.Item;

const UpdatePassword: React.FC = function() {
  const navigate = useNavigate();
  const onFinish = function(values: UpdatePasswordFieldType) {
    const { confirmPassword, ...updateInfo } = values;
    if (values.password !== confirmPassword) {
      return message.error('两次密码不一致');
    }
    updatePassword(updateInfo).then(res => {
      if (res.code === 200) {
        message.success('更新成功');
        setTimeout(() => {
          navigate('/login');
        }, 1000);
      }
    });
  }
  return (
    <div className='update-password-container'>
      <h2>修改密码</h2>
      <Form onFinish={onFinish} autoComplete='off' labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
        <FormItem
          name='email'
          label='邮箱'
          rules={[
            {
              required: true,
              message: '邮箱不能为空',
            },
          ]}
        >
          <Input />
        </FormItem>
        <FormItem
          name='captcha'
          label='验证码'
          rules={[
            {
              required: true,
              message: '验证码不能为空',
            },
          ]}
        >
          <Captcha captchaUrl='/user/updatePasswordCaptcha' />
        </FormItem>
        <FormItem
          name='password'
          label='新密码'
          rules={[
            {
              required: true,
              validator(rule, value) {
                if (!value) {
                  return Promise.reject('密码不能为空');
                }
                if (value.length < 6) {
                  return Promise.reject('密码至少６位');
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <Input.Password />
        </FormItem>
        <FormItem
          name='confirmPassword'
          label='确认密码'
          rules={[
            {
              required: true,
              message: '确认密码不能为空',
            },
          ]}
        >
          <Input.Password />
        </FormItem>
        <FormItem wrapperCol={{ offset: 6 }}>
          <Button style={{ width: '100%' }} type='primary' htmlType='submit'>
            修改
          </Button>
        </FormItem>
      </Form>
    </div>
  );
};

export default UpdatePassword;
