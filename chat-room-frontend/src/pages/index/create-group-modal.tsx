import { createGroupChatroom } from '@/api/chatroom';
import { Button, Input, message, Modal } from 'antd';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CreateGroupModal = function() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const navigate = useNavigate();
  const onCancel = function() {
    setOpen(false);
    setName('');
  };
  const onOk = function() {
    if (!name) {
      return message.error('请输入群名称');
    }
    return createGroupChatroom(name).then((res) => {
      if (res.code === 200) {
        onCancel();
        navigate(`/chat/${res.data.id}`, {
          replace: true,
        });
      }
    });
  };
  return (
    <>
      <Button type='link' onClick={() => setOpen(true)}>
        发起群聊
      </Button>
      <Modal
        open={open}
        title='创建聊天群'
        closable={false}
        onCancel={onCancel}
        onOk={onOk}
        cancelText='取消'
        okText='创建'
      >
        <Input
          placeholder='输入聊天群名称'
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </Modal>
    </>
  );
};

export default CreateGroupModal;
