import { Form, Input, Button, message } from 'antd';
import Captcha from '../../compnents/captcha';
import './index.css';
import { USER_INFO } from '../../common/const';
import Upload, { UploadFile } from 'antd/es/upload';
import { updateUserinfo } from '../../api/user/userInfo';
import { UpdateUserinfoFieldType } from './types';

const FormItem = Form.Item;

const UserInfoEdit: React.FC = function() {
  const onFinish = function(values: UpdateUserinfoFieldType) {
    console.log('values', values);
    updateUserinfo(values).then((res) => {
      if (res.code === 200) {
        message.success('修改成功');
      }
    });
  };
  const userinfo = JSON.parse(localStorage.getItem(USER_INFO) || '');
  const email = userinfo.email;
  const nickName = userinfo.nickName;
  const headPic = userinfo.headPic;
  return (
    <div className='userinfo-container'>
      <h2>个人信息</h2>
      <div className='userinfo-form-container'>
        <Form
          autoComplete='off'
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}
          onFinish={onFinish}
          initialValues={{ email, nickName, headPic }}
        >
          <FormItem label='头像' name='headPic'>
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
            label='邮箱'
            name='email'
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
            label='验证码'
            name='captcha'
            rules={[
              {
                required: true,
                message: '请填写验证码',
              },
            ]}
          >
            <Captcha captchaUrl='/user/updateCaptcha' />
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
