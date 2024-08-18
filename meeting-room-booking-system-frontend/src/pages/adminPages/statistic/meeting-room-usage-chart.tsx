import { Flex } from 'antd';
import { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import { MeetingRoomUsageCount } from '../../../api/statistic/types';
import { getMeetingRoomUsageCount } from '../../../api/statistic';
import { StatisticQuery } from './types';

interface IProps {
  searchQuery: StatisticQuery;
}

const MeetingRoomUsageChart: React.FC<IProps> = function(props) {
  const usageCountRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<MeetingRoomUsageCount[]>([]);

  useEffect(() => {
    getMeetingRoomUsageCount(props.searchQuery).then((res) => {
      if (res.code === 200) {
        setData(res.data);
      }
    });
  }, [props.searchQuery]);

  useEffect(() => {
    if (!usageCountRef.current) {
      return;
    }
    const chart = echarts.init(usageCountRef.current);
    chart.setOption({
      title: {
        text: ''
      },
      xAxis: {
        name: '会议室名称',
        data: data.map((item) => item.meetingRoomName),
      },
      yAxis: {
        name: '使用次数',
      },
      series: [
        {
          name: '使用次数',
          type: 'bar',
          data: data.map((item) => ({
            name: item.meetingRoomName,
            value: item.usageCount,
          })),
        },
      ],
    });
  }, [data]);
  return (
    <>
      <Flex justify='space-between'>
        <h3>会议室使用频率统计表</h3>
      </Flex>
      <div
        ref={usageCountRef}
        className='statistic-echart usage-count-echart'
      ></div>
    </>
  );
};

export default MeetingRoomUsageChart;
