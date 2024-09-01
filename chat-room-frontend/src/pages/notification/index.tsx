import { approve, getFriendshipRequest, reject } from '@/api/friendship';
import { FriendRequestStatus, FriendshipItem } from '@/api/friendship/types';
import { formatTime } from '@/common/utils';
import { Image, Tabs, TabsProps, Button, Table, Tag, message } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { useEffect, useState } from 'react';
const statusMap: Map<FriendRequestStatus, [string, string]> = new Map([
  [FriendRequestStatus.appending, ['申请中', 'processing']],
  [FriendRequestStatus.approved, ['通过', 'success']],
  [FriendRequestStatus.rejected, ['拒绝', 'error']],
]);
const commonColumns: ColumnsType<FriendshipItem> = [
  {
    dataIndex: 'nickName',
    title: '用户',
  },
  {
    dataIndex: 'headPic',
    title: '头像',
    render: (headPic: string) => {
      return <Image src={headPic} width={40} height={40} />;
    },
  },
  {
    dataIndex: 'createTime',
    title: '请求时间',
    render: (createTime: string) => {
      return formatTime(new Date(createTime));
    },
  },
  {
    title: '状态',
    dataIndex: 'status',
    render: (status: FriendRequestStatus) => {
      const [text, color] = statusMap.get(status) || [];
      return <Tag color={color}>{text}</Tag>;
    },
  },
];

const Notification = function() {
  const [toMe, setToMe] = useState<FriendshipItem[]>([]);
  const [fromMe, setFromMe] = useState<FriendshipItem[]>([]);
  const [num, setNum] = useState<number>(0);
  const toMeColumns: ColumnsType<FriendshipItem> = [
    ...commonColumns,
    {
      dataIndex: 'id',
      title: '操作',
      render: (id: number, record: FriendshipItem) => {
        if (record.status === FriendRequestStatus.appending) {
          return (
            <>
              <Button type='primary' onClick={() => {
                approve(id).then(res => {
                  if (res.code === 200) {
                    message.success('好友申请通过');
                    setNum(Math.random());
                  }
                })
              }}>同意</Button>
              <Button style={{ marginLeft: 6 }} onClick={() => {
                reject(id).then(res => {
                  if (res.code === 200) {
                    message.success('你已拒绝好友申请');
                    setNum(Math.random());
                  }
                })
              }}>拒绝</Button>
            </>
          );
        }
        return '';
      },
    },
  ];

  const fromMeColumns: ColumnsType<FriendshipItem> = [...commonColumns];
  const items: TabsProps['items'] = [
    {
      key: 'toMe',
      label: '发给我的',
      children: <Table columns={toMeColumns} dataSource={toMe}></Table>,
    },
    {
      key: 'fromMe',
      label: '我发送的',
      children: <Table columns={fromMeColumns} dataSource={fromMe}></Table>,
    },
  ];
  useEffect(() => {
    getFriendshipRequest().then((res) => {
      if (res.code === 200) {
        setToMe(res.data.toMe);
        setFromMe(res.data.fromMe);
      }
    });
  }, [num]);
  return (
    <div style={{ padding: '12px' }}>
      <Tabs items={items} />
    </div>
  );
};

export default Notification;
