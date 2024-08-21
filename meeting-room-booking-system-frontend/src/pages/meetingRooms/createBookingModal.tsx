import { Form, Input, Modal, DatePicker, message } from 'antd';
import { useForm } from 'antd/es/form/Form';
import { Dayjs } from 'dayjs';
import { createBooking } from '../../api/booking';
import { memo } from 'react';

const FormItem = Form.Item;

interface BookingForm {
  note?: string;
  timeRange: [Dayjs, Dayjs];
}

interface CreateBookingModalProps {
  isOpen: boolean;
  meetingRoomName: string;
  meetingRoomId: number;
  handleClose: () => void;
}

const CreateBookingModal: React.FC<CreateBookingModalProps> = function(props) {
  const [form] = useForm<BookingForm>();
  const onOk = async function() {
    await form.validateFields();
    const values = form.getFieldsValue();
    return createBooking({
      meetingRoomId: props.meetingRoomId,
      note: values.note,
      startTime: values.timeRange[0].valueOf(),
      endTime: values.timeRange[1].valueOf(),
    }).then((res) => {
      if (res.code === 200) {
        message.success('创建预定成功');
        form.resetFields();
        props.handleClose();
      }
    });
  };
  return (
    <Modal
      open={props.isOpen}
      title='预定会议室'
      closable={false}
      onCancel={() => {
        props.handleClose();
        form.resetFields();
      }}
      onOk={onOk}
    >
      <Form form={form} autoComplete='off' layout='vertical'>
        <FormItem label='会议室名称'>
          <Input disabled value={props.meetingRoomName} />
        </FormItem>
        <FormItem
          label='会议时间'
          name='timeRange'
          rules={[
            {
              required: true,
              message: '请填写会议室使用时间',
            },
          ]}
        >
          <DatePicker.RangePicker
            showTime={{ format: 'HH:mm' }}
            format='YYYY-MM-DD HH:mm'
          />
        </FormItem>
        <FormItem label='备注' name='note'>
          <Input />
        </FormItem>
      </Form>
    </Modal>
  );
};

export default memo(CreateBookingModal);
