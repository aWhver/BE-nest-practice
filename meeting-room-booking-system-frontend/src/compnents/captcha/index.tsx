import { Input, Button } from 'antd';
import './captcha.css';

interface Props {
  value?: string;
  onChange?: (captcha: string) => void;
}

const Captcha: React.FC<Props> = function(props) {
  const onChange = props?.onChange || function fn() {};
  return (
    <div className='captcha-container'>
      <Input
        value={props.value}
        onChange={(e) => onChange(e.target.value)}
      />
      <Button className='captcha-btn' type='primary'>
        发送验证码
      </Button>
    </div>
  );
};

export default Captcha;
