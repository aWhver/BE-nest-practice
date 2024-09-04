import { addFriendship } from '@/api/friendship';
import { Form, Input, message, Modal } from 'antd';
import { useForm } from 'antd/es/form/Form';
import React from 'react';

interface ModalForm {
  username: string;
  reason: string;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddFriendshipModal: React.FC<ModalProps> = function(props) {
  const [form] = useForm<ModalForm>();
  const onCancel = function() {
    form.resetFields();
    props.onClose();
  };
  const onOk = async function() {
    await form.validateFields();
    const values = form.getFieldsValue();
    addFriendship({
      toUsername: values.username,
      reason: values.reason,
    }).then((res) => {
      if (res.code === 200) {
        message.success('发送申请请求成功');
        form.resetFields();
        props.onClose();
      }
    });
  };
  return (
    <Modal
      open={props.isOpen}
      title='添加好友'
      closable={false}
      onCancel={onCancel}
      onOk={onOk}
      cancelText='取消'
      okText='确定'
    >
      <Form
        form={form}
        autoComplete='off'
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 18 }}
      >
        <Form.Item
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
        <Form.Item label='添加理由' name='reason'>
          <Input.TextArea />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddFriendshipModal;
