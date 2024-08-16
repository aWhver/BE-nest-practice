import {
  Badge,
  Button,
  Form,
  Input,
  Modal,
  Row,
  Space,
  Table,
  message,
} from 'antd';
import {
  MeetingRoomItem,
  MeetingRoomListQuery,
} from '../../api/meetingRoom/types';
import { ColumnsType } from 'antd/es/table';
import { useCallback, useEffect, useState } from 'react';
import { deleteMeetingRoom, getMeetingRoomList } from '../../api/meetingRoom';
import { formatTime } from '../../common/utils/date';
import { useForm } from 'antd/es/form/Form';
import MeetingRoomModal from './meetingRoomModal';
import { isAdmin } from '../../common/utils';

const FormItem = Form.Item;

const columns: ColumnsType<MeetingRoomItem> = [
  {
    title: '名称',
    dataIndex: 'name',
    width: 100,
  },
  {
    title: '容纳人数',
    dataIndex: 'capacity',
    width: 120,
  },
  {
    title: '位置',
    dataIndex: 'location',
  },
  {
    title: '设备',
    dataIndex: 'equipment',
  },
  {
    title: '描述',
    dataIndex: 'description',
  },
  {
    title: '添加时间',
    dataIndex: 'createTime',
    render: (_: Date) => {
      return formatTime(new Date(_));
    },
  },
  {
    title: '预定状态',
    dataIndex: 'isBooked',
    width: 120,
    render: (_: boolean, record: MeetingRoomItem) =>
      record.isBooked ? (
        <Badge status='error'>已被预订</Badge>
      ) : (
        <Badge status='success'>可预定</Badge>
      ),
  },
];

export const MeetingRooms = function() {
  const [form] = useForm();
  const [list, setList] = useState<MeetingRoomItem[]>([]);
  const [pageNo, setPageNo] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [query, setQuery] = useState<MeetingRoomListQuery>({
    pageNo,
    pageSize,
  });
  const [isOpen, setOpen] = useState(false);
  const [meetingRoomId, setMeetingRoomId] = useState<number>();
  const [ran, setRandom] = useState(0);
  const admin = isAdmin();
  const cols = [
    ...columns,
    {
      title: '操作',
      render: (_: string, record: MeetingRoomItem) => (
        <>
          {admin && (
            <>
              <Button
                type='link'
                onClick={() => {
                  setOpen(true);
                  setMeetingRoomId(record.id);
                }}
              >
                修改
              </Button>
              <Button
                type='link'
                onClick={() => onDelete(record.id, record.name)}
              >
                删除
              </Button>
            </>
          )}
          {!record.isBooked && <Button type='link'>预定</Button>}
        </>
      ),
    },
  ];

  const search = function() {
    setQuery(Object.assign({}, form.getFieldsValue(), { pageNo: 1, pageSize }));
  };

  const changePage = useCallback(function(pageNo: number, pageSize: number) {
    setPageNo(pageNo);
    setPageSize(pageSize);
  }, []);

  const onDelete = useCallback(function(id: number, name: string) {
    Modal.confirm({
      title: '删除会议室',
      content: `确定删除会议室${name}吗？`,
      onOk() {
        return deleteMeetingRoom(id).then(() => {
          message.success('删除成功');
          setRandom(Math.random());
        });
      },
    });
  }, []);

  const handleClose = useCallback((refresh: boolean) => {
    setOpen(false);
    setMeetingRoomId(0); // 避免同一条数据连续打开，后续的无法请求详情数据，表单一直是默认的数据
    refresh && setRandom(Math.random());
  }, []);

  useEffect(() => {
    getMeetingRoomList(query).then((res) => {
      setList(res.data.meetingRooms);
    });
  }, [query, ran]);

  return (
    <div className='meeting-rooms-container'>
      <div className='meetting-rooms-search-container'>
        <Form
          form={form}
          autoComplete='off'
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}
          layout='inline'
          labelWrap
          name='search'
        >
          <FormItem name='name' label='会议室名称'>
            <Input />
          </FormItem>
          <FormItem name='capacity' label='容纳人数'>
            <Input type='number' />
          </FormItem>
          <FormItem name='equipment' label='设备'>
            <Input />
          </FormItem>
          <FormItem name='location' label='位置'>
            <Input />
          </FormItem>
        </Form>
        <Row style={{ margin: '24px 0' }}>
          <Space>
            <Button type='primary' onClick={search}>
              搜索会议室
            </Button>
            <Button type='primary' onClick={() => setOpen(true)}>
              创建会议室
            </Button>
          </Space>
        </Row>
        <Table
          columns={cols}
          dataSource={list}
          pagination={{
            pageSize,
            current: pageNo,
            onChange: changePage,
          }}
        ></Table>
      </div>
      <MeetingRoomModal
        isOpen={isOpen}
        meetingRoomId={meetingRoomId}
        handleClose={handleClose}
      />
    </div>
  );
};

export default MeetingRooms;
