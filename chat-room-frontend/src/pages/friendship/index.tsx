import { getFriendship } from '@/api/friendship';
import { Friendship } from '@/api/friendship/types';
import { Button, Form, Image, Input, Table } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import AddFriendshipModal from './addFriendshipModal';

const FriendShip = function() {
  const [nickName, setNickName] = useState<string>('');
  const [friendship, setFriendship] = useState<Friendship[]>([]);
  const [open, setOpen] = useState<boolean>(false);
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
        key: 'headPic',
        render(_, record: any) {
          return <Button type='link'>聊天</Button>;
        },
      },
    ];
  }, []);
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
  }, [nickName]);
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
