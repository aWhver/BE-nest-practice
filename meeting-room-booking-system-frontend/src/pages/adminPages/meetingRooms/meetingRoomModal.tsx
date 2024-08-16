import { Form, Input, Modal, message } from 'antd';
import { useForm } from 'antd/es/form/Form';
import { CreateMeetingRoomQuery } from '../../../api/meetingRoom/types';
import { useEffect } from 'react';
import {
  createMeetingRoom,
  getMeetingRoomDetail,
  updateMeetingRoom,
} from '../../../api/meetingRoom';

const FormItem = Form.Item;

interface IProps {
  isOpen: boolean;
  handleClose: (refresh: boolean) => void;
  meetingRoomId?: number;
}

const MeetingRoomModal: React.FC<IProps> = function(props) {
  const [form] = useForm<CreateMeetingRoomQuery>();
  const onOk = async function() {
    await form.validateFields();
    if (props.meetingRoomId) {
      return updateMeetingRoom(props.meetingRoomId, form.getFieldsValue()).then(
        () => {
          message.success('修改会议室成功');
          form.resetFields();
          props.handleClose(true);
        }
      );
    }
    return createMeetingRoom(form.getFieldsValue()).then(() => {
      message.success('创建会议室成功');
      form.resetFields();
      props.handleClose(true);
    });
  };

  useEffect(() => {
    if (props.meetingRoomId) {
      getMeetingRoomDetail(props.meetingRoomId).then((res) => {
        form.setFieldsValue({
          name: res.data.name,
          capacity: res.data.capacity,
          location: res.data.location,
          equipment: res.data.equipment,
          description: res.data.description,
        });
      });
    } else {
      form.resetFields();
    }
  }, [props.meetingRoomId, form]);

  return (
    <Modal
      open={props.isOpen}
      closable={false}
      onCancel={() => {
        form.resetFields();
        props.handleClose(false);
      }}
      onOk={onOk}
      okText={props.meetingRoomId ? '修改' : '创建'}
      cancelText='取消'
      destroyOnClose
    >
      <Form
        layout='vertical'
        form={form}
        autoComplete='off'
        colon={false}
        initialValues={{
          capacity: 6,
        }}
      >
        <FormItem
          label='会议室名称'
          name='name'
          rules={[
            {
              required: true,
              message: '会议室名称不能为空',
            },
          ]}
        >
          <Input />
        </FormItem>
        <FormItem label='容纳人数' name='capacity'>
          <Input type='number' />
        </FormItem>
        <FormItem
          label='位置'
          name='location'
          rules={[
            {
              required: true,
              message: '会议室位置不能为空',
            },
          ]}
        >
          <Input />
        </FormItem>
        <FormItem
          label='设备'
          name='equipment'
          rules={[
            {
              required: true,
              message: '设备信息不能为空',
            },
          ]}
        >
          <Input />
        </FormItem>
        <FormItem
          label='描述'
          name='description'
          rules={[
            {
              required: true,
              message: '描述信息不能为空',
            },
          ]}
        >
          <Input />
        </FormItem>
      </Form>
    </Modal>
  );
};

export default MeetingRoomModal;
