import { Button, Flex, Form, Input, message } from 'antd';
import './index.css';
import Captcha from '@components/captcha';
import { useCallback } from 'react';
import { FieldType } from './types';
import { register } from '@/api/user/registerLogin';
import { Link, useNavigate } from 'react-router-dom';
import React from 'react';

const FormItem = Form.Item;

const Register: React.FC = function() {
  const navigate = useNavigate();
  const onFinish = useCallback(
    (values: FieldType) => {
      // console.log('value1s', values);
      if (values.password !== values.confirmPassword) {
        return message.error('密码与确认密码不一致');
      }
      const { confirmPassword, ...registerData } = values;
      register(registerData)
        .then((res) => {
          if (res.code === 200) {
            message.success('注册成功');
            setTimeout(() => {
              navigate('/login');
            });
          }
        });
    },
    [navigate]
  );

  return (
    <div className='register-container'>
      <h2>聊天室</h2>
      <div className='register-form-container'>
        <Form
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}
          autoComplete='off'
          onFinish={onFinish}
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
            label='昵称'
            name='nickName'
            rules={[
              {
                required: true,
                message: '昵称不能为空',
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
                validator(rule, value) {
                  console.log('rule', rule, value);
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
            label='确认密码'
            name='confirmPassword'
            rules={[
              {
                required: true,
                message: '确认密码不能为空',
              },
            ]}
          >
            <Input.Password />
          </FormItem>
          <FormItem
            label='邮箱'
            name='email'
            rules={[
              {
                type: 'email',
                message: '不是合法的邮箱',
              },
              {
                required: true,
                message: '邮箱不能为空',
              },
            ]}
          >
            <Input />
          </FormItem>
          <FormItem
            label='验证码'
            name='captcha'
            rules={[
              {
                required: true,
                message: '请输入验证码',
              },
            ]}
          >
            <Captcha captchaUrl='user/register/captcha'/>
          </FormItem>
          <FormItem wrapperCol={{ offset: 6, span: 18 }}>
            <Flex justify='flex-end'>
              <span>已有账号?</span>
              <Link to='/login'>去登录</Link>
            </Flex>
          </FormItem>
          <FormItem wrapperCol={{ offset: 6, span: 18 }}>
            <Button style={{ width: '100%' }} type='primary' htmlType='submit'>
              注册
            </Button>
          </FormItem>
        </Form>
      </div>
    </div>
  );
};

export default Register;
