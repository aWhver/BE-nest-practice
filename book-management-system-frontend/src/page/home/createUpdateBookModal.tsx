import { Form, Modal, Input, message } from 'antd';
import { useForm } from 'antd/es/form/Form';
import React, { useEffect } from 'react';
import { CreateBookForm } from './types';
import { createBook, getBookDetail, updateBook } from '../../api';
import CoverUpload from './coverUpload';

interface IProps {
  isOpen: boolean;
  handleClose: () => void;
  bookId?: string;
}

const layout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

const CreateUpdateBookModal: React.FunctionComponent<IProps> = function(props) {
  const [form] = useForm<CreateBookForm>();
  const onCreateBook = async function() {
    console.log('values', form.getFieldsValue());
    await form.validateFields();
    if (props.bookId) {
      updateBook({
        id: props.bookId,
        ...form.getFieldsValue(),
      }).subscribe(res => {
        if (res.code === 200) {
          message.success('修改成功');
          form.resetFields();
          props.handleClose();
        }
      });
      return;
    }
    createBook(form.getFieldsValue()).subscribe((res) => {
      if (res.code === 200) {
        message.success('创建成功');
        form.resetFields();
        props.handleClose();
      }
    });
  };
  const onUploadCover = function(path: string) {
    form.setFieldValue('cover', path);
  };
  useEffect(() => {
    props.bookId &&
      getBookDetail(props.bookId).subscribe((res) => {
        if (res.code === 200) {
          const data = res.data;
          form.setFieldsValue({
            name: data.name,
            author: data.author,
            description: data.description,
            cover: data.cover,
          });
        }
      });
  }, [props.bookId, form]);
  return (
    <Modal
      title='书籍创建'
      open={props.isOpen}
      onCancel={() => {
        form.resetFields();
        props.handleClose();
      }}
      onOk={onCreateBook}
      okText={props.bookId ? '修改' : '创建'}
      cancelText='取消'
      closable={false}
    >
      <Form form={form} colon={false} {...layout}>
        <Form.Item
          label='名称'
          name='name'
          rules={[
            {
              required: true,
              message: '书籍名称必填',
            },
            {
              type: 'string',
              max: 15,
            },
          ]}
        >
          <Input autoComplete='off' />
        </Form.Item>
        <Form.Item
          label='作者'
          name='author'
          rules={[
            {
              required: true,
              message: '作者必填',
            },
          ]}
        >
          <Input autoComplete='off' />
        </Form.Item>
        <Form.Item
          label='书籍简介'
          name='description'
          rules={[
            {
              required: true,
              message: '请填写书籍简介',
            },
            {
              type: 'string',
              min: 10,
              message: '最少填写10个字',
            },
          ]}
        >
          <Input.TextArea autoComplete='off' />
        </Form.Item>
        <Form.Item
          label='封面'
          name='cover'
          rules={[
            {
              required: true,
              message: '请上传封面',
            },
          ]}
        >
          <CoverUpload onChange={onUploadCover} value={form.getFieldValue('cover')} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateUpdateBookModal;
