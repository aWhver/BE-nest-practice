import { PlusOutlined } from '@ant-design/icons';
import { Upload, UploadFile, UploadProps, message } from 'antd';
import React, { useEffect, useState } from 'react';
import { ACCESS_TOKEN, SERVER } from '../../common/const';

interface HeadPicUploadProps {
  value?: string;
  onChange?: Function;
}

const HeadPicUpload: React.FC<HeadPicUploadProps> = function(props) {
  const [fileList, setFileList] = useState<UploadFile[]>();
  const onChange: UploadProps['onChange'] = function(info) {
    const { status, response } = info.file;
    // console.log('status', status);
    // console.log('info.fileList', info.fileList, status);
    if (status === 'done') {
      props.onChange!(response.data);
      message.success('头像上传成功');
    } else if (status === 'error') {
      message.error('头像上传失败');
    }
  };
  const beforeUpload: UploadProps['beforeUpload'] = function (file) {
    // console.log('file', file);
    setFileList([file]);
  }
  const onRemove: UploadProps['onRemove'] = function() {
    props.onChange!('');
  }
  useEffect(() => {
    setFileList(props.value ? [
      {
        uid: Math.random()
          .toString()
          .slice(2, 8),
        url: `${SERVER}/${props.value}`,
        name: '',
      },
    ] : []);
  }, [props.value]);
  // const _Upload
  return (
    <Upload
      name='file'
      action={`${SERVER}/user/upload`}
      listType='picture-circle'
      multiple={false}
      fileList={fileList}
      headers={{
        Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN)}` || '',
      }}
      onChange={onChange}
      onRemove={onRemove}
      beforeUpload={beforeUpload}
    >
      <button style={{ border: 0, background: 'none' }} type='button'>
        <PlusOutlined />
        <div style={{ marginTop: 8 }}>Upload</div>
      </button>
    </Upload>
  );
};

export default HeadPicUpload;
