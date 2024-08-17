import { Button, Col, DatePicker, Form, Input, Row, Select, Table } from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getBookingList } from '../../api/booking';
import { BookingItem, BookingListQuery, Status } from '../../api/booking/types';
import { getColumns } from './columns';
import { Dayjs } from 'dayjs';

const FormItem = Form.Item;

interface BookListForm {
  meetingRoomName: string;
  meetingRoomLocation: string;
  bookingTime: [Dayjs, Dayjs];
  bookingPerson: string;
  status: Status;
}

const BookHistory = function() {
  const [form] = Form.useForm();
  const [total, setTotal] = useState(0);
  const [bookingList, setBookingList] = useState<BookingItem[]>([]);
  const [query, setQuery] = useState<BookingListQuery>({
    pageNo: 1,
    pageSize: 10,
  });
  const [ran, setRandom] = useState(0);
  const columns = useMemo(() => {
    return getColumns(setRandom);
  }, []);
  const onFinish = function(values: BookListForm) {
    const { bookingTime = [], ...restQuery } = values;
    setQuery({
      ...restQuery,
      startTime: bookingTime[0] && bookingTime[0].valueOf(),
      endTime: bookingTime[1] && bookingTime[1].valueOf(),
      pageNo: 1,
      pageSize: query.pageSize,
    })
  }
  const onChange = function(pageNo: number, pageSize: number) {
    setQuery({
      ...query,
      pageNo,
      pageSize,
    })
  }
  useEffect(() => {
    getBookingList(query).then((res) => {
      if (res.code === 200) {
        setBookingList(res.data.bookingList);
        setTotal(res.data.total);
      }
    });
  }, [query, ran]);
  return (
    <div className='booking-history-container'>
      <Form
        form={form}
        autoComplete='off'
        colon={false}
        style={{ maxWidth: 'none' }}
        labelAlign='right'
        onFinish={onFinish}
      >
        <Row gutter={24}>
          <Col span={8}>
            <FormItem label='会议室名称' name='meetingRoomName'>
              <Input />
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem label='会议室位置' name='meetingRoomLocation'>
              <Input />
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem label='预定人' name='bookingPerson'>
              <Input />
            </FormItem>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={12}>
            <FormItem label='预定时间' name='bookingTime'>
              <DatePicker.RangePicker
                showTime={{ format: 'HH:mm' }}
                format='YYYY-MM-DD HH:mm'
              />
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem label='状态' name='status'>
              <Select style={{ width: '100%' }} placeholder="请选择状态" allowClear>
                <Select.Option value={0}>申请中</Select.Option>
                <Select.Option value={1}>审核通过</Select.Option>
                <Select.Option value={2}>驳回</Select.Option>
                <Select.Option value={3}>取消</Select.Option>
              </Select>
            </FormItem>
          </Col>
        </Row>

        <FormItem>
          <Button type='primary' htmlType='submit'>
            搜索
          </Button>
        </FormItem>
      </Form>
      <Table dataSource={bookingList} columns={columns} pagination={{
        pageSize: query.pageSize,
        current: query.pageNo,
        onChange: onChange,
        total,
        showSizeChanger: true,
        showTotal(total) {
          return `总共${total}条数据`;
        },
      }}></Table>
    </div>
  );
};

export default BookHistory;
