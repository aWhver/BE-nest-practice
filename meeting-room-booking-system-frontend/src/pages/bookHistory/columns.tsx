import { ColumnsType } from 'antd/es/table';
import { BookingItem, Status } from '../../api/booking/types';
import { formatTime } from '../../common/utils/date';
import { Button, Tag, message } from 'antd';
import {
  approveBooking,
  cancelBooking,
  rejectBooking,
  urgeBooking,
} from '../../api/booking';
import { isAdmin } from '../../common/utils';

const statusMap: Map<Status, [string, string]> = new Map([
  [Status.Pending, ['申请中', 'processing']],
  [Status.Approved, ['审核通过', 'success']],
  [Status.Rejected, ['驳回', 'error']],
  [Status.Cancel, ['取消', 'default']],
]);

const hanlder = function(
  pro: Promise<{ code: number }>,
  cb?: (ran: number) => void
) {
  pro.then((res) => {
    if (res.code === 200) {
      message.success('操作成功');
      cb && cb(Math.random());
    }
  });
};

export function getColumns(
  cb: (ran: number) => void
): ColumnsType<BookingItem> {
  const admin = isAdmin();
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
      render(id: number, record: BookingItem) {
        return (
          <>
            {admin && (
              <>
                <Button
                  type='link'
                  onClick={() => {
                    hanlder(approveBooking(id), cb);
                  }}
                >
                  同意
                </Button>
                <Button
                  type='link'
                  onClick={() => {
                    hanlder(rejectBooking(id), cb);
                  }}
                >
                  驳回
                </Button>
              </>
            )}
            <Button
              type='link'
              onClick={() => {
                hanlder(
                  urgeBooking({
                    id,
                    meetingRoomName: record.meetingRoomName,
                    bookingTimeRangeTxt: `${formatTime(
                      new Date(record.startTime)
                    )} ~ ${formatTime(new Date(record.endTime))}`,
                  })
                );
              }}
            >
              催办
            </Button>
            {record.status !== Status.Cancel && (
              <Button
                type='link'
                onClick={() => {
                  hanlder(cancelBooking(id), cb);
                }}
              >
                取消
              </Button>
            )}
          </>
        );
      },
    },
  ];
}
