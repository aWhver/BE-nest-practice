import useChatroomMessageStore from '@/store/chatroomMessage';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Image, Input, Button } from 'antd';
import { formatTime } from '@/common/utils';
import './index.css';
import { useLoginUserStore } from '@/store';
import { UserInfo } from '@/api/user/userInfo/types';
import {
  disbandGroupChatroom,
  getChatroomInfo,
  quitGroupChatroom,
} from '@/api/chatroom';
import { ChatroomInfo, ChatroomType, SendUserObj } from '@/api/chatroom/types';

const Chatroom = function() {
  const { chatroomId = '' } = useParams();
  if (chatroomId === '-1') {
    return '';
  }
  const navigate = useNavigate();
  const userInfo = useLoginUserStore((state) => state.userInfo) as UserInfo;
  const [chatroomInfo, setChatroomInfo] = useState<ChatroomInfo>({
    users: [],
    name: '',
    creatorId: -1,
    type: ChatroomType.single,
  });
  const [sendUserObj, setSendUserObj] = useState<SendUserObj>({});
  const store = useChatroomMessageStore((state) => ({
    messages: state.messages,
    sendUserObj: state.sendUserObj,
    getMessages: state.getMessages,
    sendMessage: state.sendMessage,
  }));
  const bottomBarRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState<string>('');

  useEffect(() => {
    if (chatroomId) {
      store.getMessages(+chatroomId);
      getChatroomInfo(+chatroomId).then((res) => {
        if (res.code === 200) {
          setChatroomInfo(res.data);
          setSendUserObj(
            res.data.users.reduce((accu, cur) => {
              accu[cur.id] = {
                userId: cur.id,
                nickName: cur.nickName,
                headPic: cur.headPic,
              };
              return accu;
            }, {} as SendUserObj)
          );
        }
      });
    }
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
      <div className='chatroom-name'>
        <h3>
          {chatroomInfo.name}
          {chatroomInfo.type === ChatroomType.group
            ? `(${chatroomInfo.users.length})`
            : ''}
        </h3>
        {chatroomInfo.creatorId === userInfo.id ? (
          <Button
            type='link'
            onClick={async () => {
              await disbandGroupChatroom(+chatroomId);
              navigate('/chat/-1', {
                replace: true,
              });
            }}
          >
            解散
          </Button>
        ) : (
          <Button
            type='link'
            onClick={async () => {
              await quitGroupChatroom(+chatroomId, userInfo.id);
              chatroomInfo.users.length === 1 &&
                disbandGroupChatroom(+chatroomId);
              navigate('/chat/-1', {
                replace: true,
              });
            }}
          >
            退出
          </Button>
        )}
      </div>
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
                    src={sendUserObj[message.sendUserId]?.headPic}
                    width={30}
                    height={30}
                    preview={false}
                  />
                  <span className='nick-name'>
                    {sendUserObj[message.sendUserId]?.nickName}
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
