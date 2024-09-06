import { MessageType } from '@/api/chatroom/types';
import { getFavoriteDetail } from '@/api/favorite';
import { FavoriteDetailItem } from '@/api/favorite/types';
import { formatTime } from '@/common/utils';
import { Avatar, Flex, Image, Modal } from 'antd';
import { useEffect, useState } from 'react';

interface ChatRecordModalProps {
  open: boolean;
  onClose: () => void;
  favoriteId: number;
}

const ChatRecordModal: React.FC<ChatRecordModalProps> = function(props) {
  const [records, setRecords] = useState<FavoriteDetailItem[]>([]);
  useEffect(() => {
    props.favoriteId &&
      getFavoriteDetail(props.favoriteId).then((res) => {
        res.code === 200 && setRecords(res.data);
      });
  }, [props.favoriteId]);
  return (
    <Modal
      wrapClassName='chat-record-modal'
      open={props.open}
      title='聊天记录'
      okText='关闭'
      onOk={props.onClose}
      footer={(_, { OkBtn }) => <OkBtn />}
      closable={false}
      styles={{ body: { maxHeight: '60vh', overflow: 'auto' } }}
    >
      {records.map((record) => {
        return (
          <Flex gap={18} key={record.id}>
            <Avatar src={record.headPic} />
            <div className='chat-record'>
              <span className='send-user-name'>{record.nickName}</span>
              <div>
                {record.type === MessageType.text && record.content}
                {record.type === MessageType.image && (
                  <Image src={record.content} style={{ maxWidth: '200px' }} />
                )}
                {record.type === MessageType.file && (
                  <a href={record.content} download>
                    {(record.content || '').split('/').pop()}
                  </a>
                )}
              </div>
            </div>
            <span style={{ fontSize: '12px', color: '#aaa' }}>
              {formatTime(new Date(record.createTime), 'y年m月d日 h:i:s')}
            </span>
          </Flex>
        );
      })}
    </Modal>
  );
};

export default ChatRecordModal;
