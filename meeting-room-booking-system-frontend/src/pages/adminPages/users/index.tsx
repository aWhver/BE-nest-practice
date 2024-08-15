import { Form, Input, Button, Table, Image, message, Badge } from 'antd';
import { useRedirect } from '../../../hooks/redirect';
import { useEffect, useMemo, useState, useCallback } from 'react';
import './index.css';
import { toggleFreezeUser, getUserlist } from '../../../api/user/userInfo';
import { UserItem, UserlistQuery } from '../../../api/user/userInfo/types';
import { formatTime } from '../../../common/utils/date';
import { SERVER } from '../../../common/const';

const FormItem = Form.Item;
const cols = [
  {
    title: '用户名',
    key: 'username',
    dataIndex: 'username',
  },
  {
    title: '头像',
    dataIndex: 'headPic',
    key: 'headPic',
    render(src: string) {
      return <Image width={100} src={`${SERVER}/${src}`} />;
    },
  },
  {
    title: '昵称',
    dataIndex: 'nickName',
    key: 'nickName',
  },
  {
    title: '邮箱',
    dataIndex: 'email',
    key: 'email',
  },
  {
    title: '状态',
    dataIndex: 'isFrozen',
    key: 'isFrozen',
    render(isFrozen: boolean) {
      return isFrozen ? <Badge>冻结</Badge> : '';
    },
  },
  {
    title: '注册时间',
    dataIndex: 'createTime',
    key: 'createTime',
    render(cell: string) {
      const date = new Date(cell);
      return formatTime(date);
    },
  },
];

const UserList = function() {
  useRedirect();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState<UserlistQuery>({});
  const [ran, setRandom] = useState(0);
  const columns = useMemo(() => {
    return [
      ...cols,
      {
        title: '操作',
        render(_: any, record: UserItem) {
          return (
            <Button
              type='link'
              onClick={() => onToggleFreezeUser(record.id, !record.isFrozen)}
            >
              {record.isFrozen ? '解冻' : '冻结'}
            </Button>
          );
        },
      },
    ];
  }, []);
  const onToggleFreezeUser = useCallback(function(
    id: number,
    isFrozen: boolean
  ) {
    toggleFreezeUser(id, isFrozen).then((res) => {
      message.success(res.data);
      setRandom(Math.random());
    });
  },
  []);
  const onFinish = function(values: UserlistQuery) {
    setQuery(values);
  };
  useEffect(() => {
    setLoading(true);
    getUserlist(query)
      .then((res) => {
        if (res.code === 200) {
          // console.log(res.data);
          setUsers(res.data.users);
          setTotal(res.data.total);
        }
      })
      .finally(() => setLoading(false));
  }, [query, ran]);
  return (
    <div className='userlist-container'>
      <Form
        labelCol={{ span: 5 }}
        wrapperCol={{ span: 19 }}
        layout='inline'
        autoComplete='off'
        onFinish={onFinish}
      >
        <FormItem label='昵称' name='nickName'>
          <Input />
        </FormItem>
        <FormItem label='用户名' name='username'>
          <Input />
        </FormItem>
        <FormItem label='邮箱' name='email'>
          <Input />
        </FormItem>
        <FormItem>
          <Button type='primary' htmlType='submit'>
            搜索
          </Button>
        </FormItem>
      </Form>

      <div className='userlist'>
        <Table
          loading={loading}
          dataSource={users}
          columns={columns}
          pagination={{ total }}
        ></Table>
      </div>
    </div>
  );
};

export default UserList;
