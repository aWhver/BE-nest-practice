import { List } from 'antd';
import Sider from 'antd/es/layout/Sider';
import { useState } from 'react';
import './list.css';

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
  const [activeId, setActiveId] = useState(dataSource[0].id);
  return (
    <Sider theme='light'>
      <List
        className='chat-list'
        dataSource={dataSource}
        renderItem={(item) => {
          return (
            <List.Item
              onClick={() => setActiveId(item.id)}
              className={activeId === item.id ? 'active' : ''}
              style={{ padding: '12px 16px' }}
            >
              <h4>{item.name}</h4>
              {item.text}
            </List.Item>
          );
        }}
      />
    </Sider>
  );
};

export default ChatList;
