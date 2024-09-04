import { getChatroom, joinGroupChatroom } from '@/api/chatroom';
import { ChatroomType } from '@/api/chatroom/types';
import { message, Modal, Select, SelectProps } from 'antd';
import { useEffect, useState } from 'react';

interface InvitationModalProps {
  isOpen: boolean;
  invitationUserId: number;
  onClose: () => void;
}

const InvitationModal: React.FC<InvitationModalProps> = function(props) {
  const [chatrooms, setChatrooms] = useState<SelectProps['options']>([]);
  const [chatroomId, setChatroomId] = useState<number | string>('');
  const onChange: SelectProps['onChange'] = function(value: number) {
    console.log('value', value);
    setChatroomId(value);
  };
  const onCancel = () => {
    setChatroomId('');
    props.onClose();
  }
  useEffect(() => {
    getChatroom(ChatroomType.group).then((res) => {
      if (res.code === 200) {
        setChatrooms(
          res.data.map((item) => ({
            value: item.id,
            label: item.name,
          }))
        );
      }
    });
  }, []);
  return (
    <Modal
      width={280}
      open={props.isOpen}
      title='选择群聊'
      closable={false}
      onCancel={onCancel}
      onOk={() => {
        if (!chatroomId) {
          return message.error('请选择群聊');
        }
        return joinGroupChatroom(+chatroomId, props.invitationUserId).then(
          (res) => {
            if (res.code === 200) {
              message.success('邀请成功');
              onCancel();
            }
          }
        );
      }}
      cancelText="取消"
      okText="确定"
      centered
    >
      <Select
        style={{ width: '200px' }}
        value={chatroomId}
        options={chatrooms}
        onChange={onChange}
      ></Select>
    </Modal>
  );
};

export default InvitationModal;
