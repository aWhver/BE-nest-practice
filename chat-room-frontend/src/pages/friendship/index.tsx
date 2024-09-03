import { deleteFriend, getFriendship } from '@/api/friendship';
import { Friendship } from '@/api/friendship/types';
import { Button, Form, Image, Input, Modal, Table } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import AddFriendshipModal from './addFriendshipModal';
import { createSingleChatroom } from '@/api/chatroom';
import { useNavigate } from 'react-router-dom';

const FriendShip = function() {
  const [nickName, setNickName] = useState<string>('');
  const [num, setNum] = useState<number>(0);
  const [friendship, setFriendship] = useState<Friendship[]>([]);
  const [open, setOpen] = useState<boolean>(false);
  const navigate = useNavigate();
  const columns = useMemo(() => {
    return [
      {
        title: '昵称',
        dataIndex: 'nickName',
      },
      {
        title: '邮箱',
        dataIndex: 'email',
      },
      {
        title: '头像',
        dataIndex: 'headPic',
        render(headPic: string) {
          if (!headPic) {
            return '';
          }
          return <Image src={headPic} width={30} height={30} />;
        },
      },
      {
        title: '操作',
        key: 'id',
        dataIndex: 'id',
        render(id: number) {
          return (
            <>
              <Button type='link' onClick={() => chat(id)}>聊天</Button>
              <Button
                type='link'
                onClick={() => {
                  Modal.confirm({
                    title: '删除好友',
                    content: '确认删除好友？',
                    onOk() {
                      deleteFriend(id).then((res) => {
                        if (res.code === 200) {
                          setNum(Math.random());
                        }
                      });
                    },
                  });
                }}
              >
                删除
              </Button>
            </>
          );
        },
      },
    ];
  }, []);
  const chat = function(friendId: number) {
    createSingleChatroom(friendId).then(res => {
      if (res.code === 200) {
        navigate('/chat/' + res.data, {
          replace: true,
        });
      }
    });
  }
  const onFinish = function(values: { nickName: string }) {
    setNickName(values.nickName);
  };
  const onClose = function() {
    setOpen(false);
  };
  useEffect(() => {
    getFriendship(nickName).then((res) => {
      if (res.code === 200) {
        setFriendship(res.data);
      }
    });
  }, [nickName, num]);
  return (
    <div style={{ padding: '12px' }}>
      <Form autoComplete='off' layout='inline' onFinish={onFinish}>
        <Form.Item name='nickName'>
          <Input placeholder='请输入昵称' />
        </Form.Item>
        <Form.Item>
          <Button type='primary' htmlType='submit'>
            搜索
          </Button>
        </Form.Item>
        <Form.Item>
          <Button type='primary' onClick={() => setOpen(true)}>
            添加好友
          </Button>
        </Form.Item>
      </Form>
      <Table dataSource={friendship} columns={columns}></Table>
      <AddFriendshipModal isOpen={open} onClose={onClose} />
    </div>
  );
};

export default FriendShip;
