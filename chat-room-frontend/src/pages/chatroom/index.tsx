import useChatroomMessageStore from '@/store/chatroomMessage';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Image, Input, Button, Popover } from 'antd';
import EmojiPicker from '@emoji-mart/react';
import data from '@emoji-mart/data';
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
import type { InputRef } from 'antd';

const Chatroom = function() {
  const { chatroomId = '' } = useParams();
  if (chatroomId === '-1') {
    return '';
  }
  const navigate = useNavigate();
  const inputRef = useRef<InputRef>(null);
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
  const [cursorPos, setCursorPos] = useState<number>(0);
  const onEmojiSelect = function(emoji: any) {
    setInputValue(value => {
      const values = value.split('');
      console.log('emoji.native.length', cursorPos, emoji.native.length);
      values.splice(cursorPos, 0, emoji.native);
      setCursorPos(pos => pos + emoji.native.length);
      return values.join('');
    })
    if (inputRef.current) {
      const el = inputRef.current.resizableTextArea.textArea;
      const len = el.value.length;
      // console.log('len', len);
      el.setSelectionRange(len, len);
      // inputRef.current.focus({
      //   cursor: 'end'
      // })
    }
  }
  useEffect
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
              key={message.id}
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
        <div className='chat-bar'>
          <Popover title="表情包" content={<EmojiPicker data={data} onEmojiSelect={onEmojiSelect} />}>
            <span>表情</span>
          </Popover>
        </div>
        <Input.TextArea
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={e => {
            setCursorPos(e.target.selectionStart)
          }}
          onPressEnter={(e) => {
            e.preventDefault();
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
