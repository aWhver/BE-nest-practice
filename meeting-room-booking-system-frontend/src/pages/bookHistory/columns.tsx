import { ColumnsType } from 'antd/es/table';
import { BookingItem, Status } from '../../api/booking/types';
import { formatTime } from '../../common/utils/date';
import { Button, Tag, message } from 'antd';
import { approveBooking, rejectBooking } from '../../api/booking';

const statusMap: Map<Status, [string, string]> = new Map([
  [Status.Pending, ['申请中', 'processing']],
  [Status.Approved, ['审核通过', 'success']],
  [Status.Rejected, ['驳回', 'error']],
  [Status.Cancel, ['取消', 'default']],
]);

export function getColumns(cb: (ran: number) => void): ColumnsType<BookingItem> {
  return [
    {
      title: '预定人',
      dataIndex: 'bookingNickName',
    },
    {
      title: '会议室名称',
      dataIndex: 'meetingRoomName',
    },
    {
      title: '会议室位置',
      dataIndex: 'meetingRoomName',
    },
    {
      title: '会议时间',
      dataIndex: 'startTime',
      render(_: Date, record: BookingItem) {
        return `${formatTime(new Date(record.startTime))} ~ ${formatTime(
          new Date(record.endTime)
        )}`;
      },
    },
    {
      title: '备注',
      dataIndex: 'note',
    },
    {
      title: '状态',
      dataIndex: 'status',
      render(status: Status) {
        const [text, color] = statusMap.get(status) || [];
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: '操作',
      dataIndex: 'id',
      render(id: number) {
        return (
          <>
            <Button
              type='link'
              onClick={() => {
                approveBooking(id).then((res) => {
                  if (res.code === 200) {
                    message.success('操作成功');
                    cb(Math.random());
                  }
                });
              }}
            >
              同意
            </Button>
            <Button
              type='link'
              onClick={() => {
                rejectBooking(id).then((res) => {
                  if (res.code === 200) {
                    message.success('操作成功');
                    cb(Math.random());
                  }
                });
              }}
            >
              驳回
            </Button>
          </>
        );
      },
    },
  ];
}
