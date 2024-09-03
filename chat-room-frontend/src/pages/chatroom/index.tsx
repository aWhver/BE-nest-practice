import useChatroomMessageStore from '@/store/chatroomMessage';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Image, Input } from 'antd';
import { formatTime } from '@/common/utils';
import './index.css';
import { useLoginUserStore } from '@/store';
import { UserInfo } from '@/api/user/userInfo/types';

const Chatroom = function() {
  const { chatroomId } = useParams();
  const userInfo = useLoginUserStore((state) => state.userInfo) as UserInfo;
  const store = useChatroomMessageStore((state) => ({
    messages: state.messages,
    sendUserObj: state.sendUserObj,
    getMessages: state.getMessages,
    sendMessage: state.sendMessage,
  }));
  const bottomBarRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState<string>('');

  useEffect(() => {
    chatroomId && store.getMessages(+chatroomId);
  }, [chatroomId]);
  useLayoutEffect(() => {
    if (bottomBarRef.current) {
      bottomBarRef.current.scrollIntoView({
        block: 'end',
      });
    }
  }, [store.messages]);
  return (
    <div className='chat-container'>
      <div className='chat-content-container'>
        {store.messages.map((message) => {
          return (
            <div
              className={`chat-item ${
                userInfo.id === message.sendUserId ? 'from-me' : ''
              }`}
            >
              {message.sendUserId && (
                <div className='chat-item-title'>
                  <Image
                    src={store.sendUserObj[message.sendUserId]?.headPic}
                    width={30}
                    height={30}
                    preview={false}
                  />
                  <span className='nick-name'>
                    {store.sendUserObj[message.sendUserId]?.nickName}
                  </span>
                  <span className='send-time'>
                    {formatTime(new Date(message.createTime || ''))}
                  </span>
                </div>
              )}

              <div className='chat-item-body'>{message.content}</div>
            </div>
          );
        })}
        <div className='bottom-bar' ref={bottomBarRef}></div>
      </div>
      <div className='chat-input'>
        <Input.TextArea
          value={inputValue}
          style={{ height: '100%' }}
          onChange={(e) => setInputValue(e.target.value)}
          onPressEnter={() => {
            if (!inputValue) {
              return;
            }
            store.sendMessage(inputValue, 'text');
            setInputValue('');
          }}
        />
      </div>
    </div>
  );
};

export default Chatroom;
