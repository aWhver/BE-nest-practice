import { Input, Button, message } from 'antd';
import { registerCaptcha } from '../../api/user/registerLogin';
import './captcha.css';
import { useState, useCallback, useEffect } from 'react';
import useFormInstance from 'antd/es/form/hooks/useFormInstance';

interface Props {
  value?: string;
  onChange?: (captcha: string) => void;
}

const Captcha: React.FC<Props> = function(props) {
  const [count, setCount] = useState(0);
  const onChange = props?.onChange || function fn() {};
  const form = useFormInstance();
  const sendCaptcha = useCallback(function() {
    const email = form.getFieldValue('email');
    // console.log('email', email);
    if (!email) {
      return message.error('请输入邮箱');
    }
    registerCaptcha(email).then((res) => {
      if (res.code === 200) {
        setCount(60);
        message.success('验证码发送成功');
      }
    });
  }, []);

  useEffect(() => {
    if (count !== 0) {
      const timer = setTimeout(() => {
        setCount(count - 1);
        if (count - 1 === 0) {
          clearTimeout(timer);
        }
      }, 1000);
    }
  }, [count]);
  return (
    <div className='captcha-container'>
      <Input value={props.value} onChange={(e) => onChange(e.target.value)} />
      <Button
        disabled={count !== 0}
        onClick={sendCaptcha}
        className='captcha-btn'
        type='primary'
      >
        发送验证码{count ? `(${count}s)` : ''}
      </Button>
    </div>
  );
};

export default Captcha;
