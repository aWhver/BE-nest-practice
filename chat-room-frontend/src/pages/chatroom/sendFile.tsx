import { MessageType } from '@/api/chatroom/types';
import { presignedUrl } from '@/api/user/userInfo';
import useChatroomMessageStore from '@/store/chatroomMessage';
import { message, Upload, UploadFile, UploadProps } from 'antd';
import axios from 'axios';
import { ReactNode, useState } from 'react';

interface SendFileProps {
  sendType: MessageType;
  readonly children: ReactNode;
}

const SendFile: React.FC<SendFileProps> = function(props) {
  const sendMessage = useChatroomMessageStore((state) => state.sendMessage);
  const [, setFileList] = useState<UploadFile[]>();
  const uploadProps: UploadProps = {
    name: 'file',
    multiple: true,
    action: async function(file: UploadFile) {
      const res = await presignedUrl(file.name);
      return res.data;
    },
    customRequest: async function(options) {
      const resp = await axios.put(options.action, options.file, {
        headers: {
          'Content-Type': options.file.type,
        },
      });
      options.onSuccess!(resp.data);
      // props.onChange!(`http://localhost:9000/chat-room/${options.file.name}`);
    },
    beforeUpload: function(file, fileList) {
      console.log('file', file);
      if (props.sendType === MessageType.image) {
        if (
          !['png', 'jpeg', 'gif', 'jpg', 'webp'].includes(
            file.type.replace('image/', '').toLowerCase()
          )
        ) {
          message.error('请上传图片类型');
          return false;
        }
      }
      setFileList(fileList);
    },
    onChange: function(info) {
      const { status } = info.file;
      if (status === 'done') {
        sendMessage(
          `http://localhost:9000/chat-room/${info.file.name}`,
          props.sendType
        );
      } else if (status === 'error') {
        message.error('发送失败');
      }
    },
  };
  return <Upload {...uploadProps}>{props.children}</Upload>;
};

export default SendFile;
