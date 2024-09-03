import Layout, { Content } from 'antd/es/layout/layout';
import ChatList from './list';
import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Outlet, useParams } from 'react-router-dom';
import { useLoginUserStore } from '@/store';
import { UserInfo } from '@/api/user/userInfo/types';
import useChatroomMessageStore, { Reply } from '@/store/chatroomMessage';
import { formatTime } from '@/common/utils';

const Chat = function() {
  const { chatroomId = '0' } = useParams();
  const addMessage = useChatroomMessageStore((state) => state.addMessage);
  const registerSendMessageFn = useChatroomMessageStore(
    (state) => state.registerSendMessageFn
  );
  const userInfo = useLoginUserStore((state) => state.userInfo) as UserInfo;
  const socketRef = useRef<Socket>();
  useEffect(() => {
    const socket = (socketRef.current = io('http://localhost:3108'));
    socket.on('connect', () => {
      socket.emit('joinRoom', {
        chatroomId: +chatroomId,
        userId: userInfo.id,
        nickName: userInfo.nickName,
      });

      socket.on('message', (reply: Reply) => {
        if (reply.type === 'joinRoom') {
          addMessage({
            type: 'text',
            content: `用户${reply.nickName}加入群聊`,
          });
        } else {
          addMessage({
            ...reply.message,
            sendUserId: reply.userId,
            createTime: formatTime(new Date())
          });
        }
      });
      registerSendMessageFn((value: string, type: 'text') => {
        socketRef.current &&
          socketRef.current.emit('sendMseeage', {
            chatroomId: +chatroomId,
            sendUserId: userInfo.id,
            message: {
              type,
              content: value,
            },
          });
      });
    });
    return () => {
      socket.disconnect();
    };
  }, [chatroomId, userInfo.id]);
  return (
    <Layout style={{ height: '100%' }}>
      <ChatList />
      <Content>
        <Outlet />
      </Content>
    </Layout>
  );
};

export default Chat;
