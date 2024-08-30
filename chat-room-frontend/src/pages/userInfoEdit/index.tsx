import { Form, Input, Button, message } from 'antd';
import Captcha from '@components/captcha';
import './index.css';
import { updateUserinfo } from '@/api/user/userInfo';
import { UpdateUserinfoFieldType } from './types';
import HeadPicUpload from '@components/headPic';
import { useEffect } from 'react';
import { useForm } from 'antd/es/form/Form';
import { useLoginUserStore } from '@/store';
import { UserInfo } from '@/api/user/userInfo/types';

const FormItem = Form.Item;

const UserInfoEdit: React.FC = function() {
  const [form] = useForm();
  const userInfo = useLoginUserStore((state) => state.userInfo);
  const onFinish = function(values: UpdateUserinfoFieldType) {
    // console.log('values', values);
    updateUserinfo({ id: (userInfo as UserInfo).id, ...values }).then((res) => {
      if (res.code === 200) {
        message.success('修改成功');
      }
    });
  };
  useEffect(() => {
    if (Object.keys(userInfo).length) {
      form.setFieldsValue({
        headPic: (userInfo as UserInfo).headPic,
        nickName: (userInfo as UserInfo).nickName,
        email: (userInfo as UserInfo).email,
      });
    }
  }, [userInfo]);
  return (
    <div className='userinfo-container'>
      <h2>个人信息</h2>
      <div className='userinfo-form-container'>
        <Form
          form={form}
          autoComplete='off'
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}
          onFinish={onFinish}
        >
          <FormItem label='头像' name='headPic'>
            <HeadPicUpload />
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
            label='邮箱'
            name='email'
            rules={[
              {
                required: true,
                message: '邮箱不能为空',
              },
              {
                type: 'email',
                message: '请输入合法的邮箱',
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
                message: '请填写验证码',
              },
            ]}
          >
            <Captcha captchaUrl='user/update/captcha' />
          </FormItem>
          <FormItem wrapperCol={{ offset: 6 }}>
            <Button type='primary' htmlType='submit' style={{ width: '100%' }}>
              修改
            </Button>
          </FormItem>
        </Form>
      </div>
    </div>
  );
};

export default UserInfoEdit;
