import { Button, Col, DatePicker, Form, Row, message } from 'antd';
import './index.css';
import UserBookingCountChart from './user-booking-count-chart';
import MeetingRoomUsageChart from './meeting-room-usage-chart';
import { useCallback, useState } from 'react';
import { Dayjs } from 'dayjs';
import { StatisticQuery } from './types';
const FormItem = Form.Item;

const Statistic = function() {
  const [query, setQuery] = useState<StatisticQuery>({});
  const onFinish = useCallback(
    (values: { startTime: Dayjs; endTime: Dayjs }) => {
      if (values.startTime && values.endTime) {
        if (values.endTime.diff(values.startTime, 'minute') < 0) {
          return message.warning('结束时间必须比开始时间晚');
        }
      }
      setQuery({
        startTime: values.startTime && values.startTime.valueOf(),
        endTime: values.endTime && values.endTime.valueOf(),
      });
    },
    []
  );
  return (
    <div className='statistic-container'>
      <Form
        onFinish={onFinish}
        name='search'
        autoComplete='off'
        layout='inline'
        colon={false}
      >
        <FormItem name='startTime' label='开始时间'>
          <DatePicker showTime={{ format: 'hh:mm' }} />
        </FormItem>
        <FormItem name='endTime' label='结束时间'>
          <DatePicker showTime={{ format: 'hh:mm' }} />
        </FormItem>
        <FormItem>
          <Button type='primary' htmlType='submit'>
            查询
          </Button>
        </FormItem>
      </Form>
      <Row gutter={24}>
        <Col span={12}>
          <UserBookingCountChart searchQuery={query} />
        </Col>
        <Col span={12}>
          <MeetingRoomUsageChart searchQuery={query} />
        </Col>
      </Row>
    </div>
  );
};

export default Statistic;
