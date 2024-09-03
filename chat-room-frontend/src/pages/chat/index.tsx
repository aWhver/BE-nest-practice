import Layout, { Content } from 'antd/es/layout/layout';
import ChatList from './list';
import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Input } from 'antd';
import { Message, Reply } from './types';

const Chat = function() {
  const [messageList, setMessageList] = useState<Message[]>([]);
  const socketRef = useRef<Socket>();
  const sendMessage = (value: string) => {
    socketRef.current &&
      socketRef.current.emit('sendMseeage', {
        chatroomId: 1,
        sendUserId: 1,
        message: {
          type: 'text',
          content: value,
        },
      });
  };
  useEffect(() => {
    const socket = (socketRef.current = io('http://localhost:3108'));
    socket.on('connect', () => {
      socket.emit('joinRoom', {
        chatroomId: 1,
        userId: 1,
      });

      socket.on('message', (reply: Reply) => {
        if (reply.type === 'joinRoom') {
          setMessageList((messageList) => [
            ...messageList,
            {
              type: 'text',
              content: `用户${reply.userId}加入群聊`,
            },
          ]);
        } else {
          setMessageList((messageList) => [...messageList, reply.message]);
        }
      });
    });
  }, []);
  return (
    <Layout style={{ height: '100%' }}>
      <ChatList />
      <Content>
        <Input onBlur={(e) => sendMessage(e.target.value)} />
        {messageList.map((message) => {
          return <p>{message.content}</p>;
        })}
      </Content>
    </Layout>
  );
};

export default Chat;
