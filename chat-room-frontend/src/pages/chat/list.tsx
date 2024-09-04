import { List } from 'antd';
import Sider from 'antd/es/layout/Sider';
import { useEffect, useState } from 'react';
import './list.css';
import { getChatroom } from '@/api/chatroom';
import { Chatroom } from '@/api/chatroom/types';
import { useNavigate, useParams } from 'react-router-dom';

const ChatList = function() {
  const { chatroomId = '0' } = useParams();
  const [chatroomList, setChatroomList] = useState<Chatroom[]>([]);
  const [activeId, setActiveId] = useState<number>();
  const navigate = useNavigate();
  useEffect(() => {
    setActiveId(+chatroomId);
    getChatroom().then((res) => {
      if (res.code === 200) {
        setChatroomList(res.data);
      }
    });
  }, []);
  useEffect(() => {
    // 创建群聊时，打开新建的聊天界面，刷新下聊天室列表
    if (+chatroomId !== activeId) {
      setActiveId(+chatroomId);
      getChatroom().then((res) => {
        if (res.code === 200) {
          setChatroomList(res.data);
        }
      });
    }
  }, [chatroomId])
  return (
    <Sider theme='light'>
      <List
        className='chat-list'
        dataSource={chatroomList}
        renderItem={(item) => {
          return (
            <List.Item
              key={item.id}
              onClick={() => {
                setActiveId(item.id);
                navigate('/chat/' + item.id, {
                  replace: true,
                });
              }}
              className={activeId === item.id ? 'active' : ''}
              style={{ padding: '12px 16px' }}
            >
              <h4>{item.name}</h4>
            </List.Item>
          );
        }}
      />
    </Sider>
  );
};

export default ChatList;
