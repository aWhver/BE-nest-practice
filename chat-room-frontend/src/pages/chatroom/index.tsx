import useChatroomMessageStore from '@/store/chatroomMessage';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Input,
  Button,
  Popover,
  Space,
  Avatar,
  Menu,
  message,
  Checkbox,
  Flex,
} from 'antd';
import { HeartTwoTone, CloseOutlined } from '@ant-design/icons';
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
import {
  ChatHistoryItem,
  ChatroomInfo,
  ChatroomType,
  MessageType,
  SendUserObj,
} from '@/api/chatroom/types';
import { InputRef } from 'antd';
import SendFile from './sendFile';
import { addFavorite } from '@/api/favorite';
import { FavoriteType } from '@/api/favorite/types';

const Chatroom = function() {
  const { chatroomId = '' } = useParams();
  if (chatroomId === '-1') {
    return '';
  }
  const navigate = useNavigate();
  const inputRef = useRef<InputRef>(null);
  const contentContainerRef = useRef<HTMLDivElement>(null);
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
  const [menuPos, setMenuPos] = useState({ left: '0px', top: '0px' });
  const [visible, setVisible] = useState(false);
  const [showCheckbox, setShowCheckbox] = useState(false);
  const [selectedInfo, setSelectedInfo] = useState({
    type: MessageType.text,
    content: '',
  });
  const [selectedChatIds, setSelectedChatIds] = useState<
    Record<string, boolean>
  >({});
  const onEmojiSelect = function(emoji: any) {
    setInputValue((value) => {
      const values = value.split('');
      console.log('emoji.native.length', cursorPos, emoji.native.length);
      values.splice(cursorPos, 0, emoji.native);
      setCursorPos((pos) => pos + emoji.native.length);
      return values.join('');
    });
    if (inputRef.current) {
      const el = inputRef.current.resizableTextArea.textArea;
      const len = el.value.length;
      // console.log('len', len);
      el.setSelectionRange(len, len);
      // inputRef.current.focus({
      //   cursor: 'end'
      // })
    }
  };
  const onContextMenu = useCallback(
    (
      e: React.MouseEvent<HTMLDivElement, MouseEvent>,
      chatHistoryItem: ChatHistoryItem
    ) => {
      e.preventDefault();
      if (showCheckbox) {
        return;
      }
      setMenuPos({
        left: `${e.nativeEvent.layerX}px`,
        top: `${Math.min(
          e.nativeEvent.layerY,
          (contentContainerRef.current?.clientHeight as number) - 93
        )}px`,
      });
      setVisible(true);
      setSelectedInfo({
        type: chatHistoryItem.type,
        content: chatHistoryItem.content,
      });
    },
    [showCheckbox]
  );
  const onMenuClick = useCallback(
    (e: any) => {
      if (e.key === 'cancel') {
        setVisible(false);
      }
      if (e.key === 'favorite') {
        addFavorite(selectedInfo).then((res) => {
          if (res.code === 200) {
            message.success('收藏成功');
            setVisible(false);
          }
        });
      }
      if (e.key === 'multiSelect') {
        setShowCheckbox(true);
        setVisible(false);
      }
    },
    [selectedInfo]
  );
  const onCheckBox = useCallback((checked: boolean, id: number) => {
    setSelectedChatIds((value) => ({ ...value, [id]: checked }));
  }, []);
  const onBatchCancel = useCallback(() => {
    setShowCheckbox(false);
    setSelectedChatIds({});
  }, []);
  const onBatchFavorite = useCallback(() => {
    addFavorite({
      type: FavoriteType.chatHistory,
      chatHistoryIds: Object.keys(selectedChatIds).map(Number),
    }).then((res) => {
      if (res.code === 200) {
        message.success('收藏成功');
        onBatchCancel();
      }
    });
  }, [selectedChatIds]);
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
      <div className='chat-content-container' ref={contentContainerRef}>
        <div className='chat-message-list'>
          {store.messages.map((message) => {
            return (
              <div
                key={message.id}
                className={`chat-item ${
                  userInfo.id === message.sendUserId ? 'from-me' : ''
                }`}
              >
                {showCheckbox && (
                  <div className='chat-checkbox'>
                    <Checkbox
                      checked={selectedChatIds[message.id]}
                      onChange={(e) => onCheckBox(e.target.checked, message.id)}
                    />
                  </div>
                )}
                <div className='chat-item-box'>
                  {message.sendUserId && (
                    <div className='chat-item-title'>
                      <Avatar
                        src={sendUserObj[message.sendUserId]?.headPic}
                        size={30}
                      />
                      <span className='nick-name'>
                        {sendUserObj[message.sendUserId]?.nickName}
                      </span>
                      <span className='send-time'>
                        {formatTime(new Date(message.createTime || ''))}
                      </span>
                    </div>
                  )}

                  <div
                    className='chat-item-body'
                    onContextMenu={(e) => onContextMenu(e, message)}
                  >
                    {message.type === MessageType.text && message.content}
                    {message.type === MessageType.image && (
                      <img
                        src={message.content}
                        style={{ maxWidth: '200px' }}
                      />
                    )}
                    {message.type === MessageType.file && (
                      <a href={message.content} download>
                        {message.content.split('/').pop()}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div className='bottom-bar' ref={bottomBarRef}></div>
        </div>
        {visible && (
          <Menu
            style={menuPos}
            className='chat-context-menu'
            onClick={onMenuClick}
          >
            <Menu.Item key='favorite'>收藏</Menu.Item>
            <Menu.Item key='multiSelect'>多选</Menu.Item>
            <div className='divider' />
            <Menu.Item key='cancel'>取消</Menu.Item>
          </Menu>
        )}
      </div>
      <div className='chat-input'>
        <div className='chat-bar'>
          <Space size={24}>
            <Popover
              title='表情包'
              content={
                <EmojiPicker data={data} onEmojiSelect={onEmojiSelect} />
              }
            >
              <span>表情</span>
            </Popover>
            <SendFile sendType={MessageType.image}>
              <span>图片</span>
            </SendFile>
            <SendFile sendType={MessageType.file}>
              <span>文件</span>
            </SendFile>
          </Space>
        </div>
        <Input.TextArea
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={(e) => {
            setCursorPos(e.target.selectionStart);
          }}
          onPressEnter={(e) => {
            e.preventDefault();
            if (!inputValue) {
              return;
            }
            store.sendMessage(inputValue, MessageType.text);
            setInputValue('');
          }}
        />
        {showCheckbox && (
          <div className='chat-history-operation'>
            <Flex align='center' vertical className='operation-item'>
              <div className='operation-circle' onClick={onBatchFavorite}>
                <HeartTwoTone style={{ fontSize: '20px' }} />
              </div>
              <span>收藏</span>
            </Flex>
            <Flex align='center' vertical className='operation-item'>
              <div
                className='operation-circle'
                onClick={onBatchCancel}
              >
                <CloseOutlined style={{ fontSize: '20px' }} />
              </div>
              <span>取消</span>
            </Flex>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chatroom;
