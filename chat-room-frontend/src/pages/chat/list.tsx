import { List } from 'antd';
import Sider from 'antd/es/layout/Sider';
import { useEffect, useState } from 'react';
import './list.css';
import { getChatroom } from '@/api/chatroom';
import { Chatroom } from '@/api/chatroom/types';
import { useNavigate } from 'react-router-dom';

const dataSource = [
  {
    id: 1,
    name: 'tong',
    text: 'offer给到40k',
  },
  {
    id: 2,
    name: 'inigo',
    text: 'offer给到42k',
  },
  {
    id: 3,
    name: 'juntong',
    text: 'offer给到52k',
  },
];

const ChatList = function() {
  const [chatroomList, setChatroomList] = useState<Chatroom[]>([]);
  const [activeId, setActiveId] = useState<number>();
  const navigate = useNavigate();
  useEffect(() => {
    getChatroom().then((res) => {
      if (res.code === 200) {
        setChatroomList(res.data);
        // res.data.length && setActiveId(res.data[0].id);
      }
    });
  }, []);
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
