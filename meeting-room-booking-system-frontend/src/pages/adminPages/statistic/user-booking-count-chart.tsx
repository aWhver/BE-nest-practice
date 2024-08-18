import { Flex } from 'antd';
import { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import { StatisticQuery } from './types';
import { getUserBookingCount } from '../../../api/statistic';
import { UserBookingCount } from '../../../api/statistic/types';

interface IProps {
  searchQuery: StatisticQuery;
}

const UserBookingCountChart: React.FC<IProps> = function(props) {
  const bookingCountRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<UserBookingCount[]>([]);

  useEffect(() => {
    getUserBookingCount(props.searchQuery).then((res) => {
      if (res.code === 200) {
        setData(res.data);
      }
    });
  }, [props.searchQuery]);

  useEffect(() => {
    if (!bookingCountRef.current) {
      return;
    }
    const chart = echarts.init(bookingCountRef.current);
    chart.setOption({
      title: {
        text: ''
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        data: data.map((item) => item.nickName),
      },
      series: [
        {
          name: '预定次数',
          type: 'pie',
          data: data.map((item) => ({
            name: item.nickName,
            value: item.bookingCount,
          })),
          label: {
            show: true,
            formatter: "{a}: {c}",
          }
        },
      ],
    });
  }, [data]);
  return (
    <>
      <Flex justify='space-between'>
        <h3>用户预定统计表</h3>
      </Flex>
      <div
        ref={bookingCountRef}
        className='statistic-echart booking-count-echart'
      ></div>
    </>
  );
};

export default UserBookingCountChart;
