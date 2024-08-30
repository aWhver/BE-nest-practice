import { PlusOutlined } from '@ant-design/icons';
import { Upload, UploadFile, UploadProps, message } from 'antd';
import React, { useEffect, useState } from 'react';
import { presignedUrl } from '@/api/user/userInfo';
import axios from 'axios';

interface HeadPicUploadProps {
  value?: string;
  onChange?: Function;
}

const HeadPicUpload: React.FC<HeadPicUploadProps> = function(props) {
  const [fileList, setFileList] = useState<UploadFile[]>();
  const onChange: UploadProps['onChange'] = function(info) {
    const { status } = info.file;
    // console.log('info.fileList', info.fileList, status);
    if (status === 'done') {
      message.success('头像上传成功');
    } else if (status === 'error') {
      message.error('头像上传失败');
    }
  };
  const beforeUpload: UploadProps['beforeUpload'] = function(file) {
    setFileList([file]);
  };
  const onRemove: UploadProps['onRemove'] = function() {
    props.onChange!('');
  };
  useEffect(() => {
    setFileList(
      props.value
        ? [
            {
              uid: Math.random()
                .toString()
                .slice(2, 8),
              url: props.value,
              name: '',
            },
          ]
        : []
    );
  }, [props.value]);
  const action = async function(file: UploadFile) {
    const res = await presignedUrl(file.name);
    return res.data;
  };
  const customRequest: UploadProps['customRequest'] = async function(options) {
    const resp = await axios.put(options.action, options.file, {
      headers: {
        'Content-Type': options.file.type,
      },
    });
    options.onSuccess!(resp.data);
    props.onChange!(`http://localhost:9000/nest-basic/${options.file.name}`);
  };
  return (
    <Upload
      name='file'
      action={action}
      listType='picture-circle'
      multiple={false}
      fileList={fileList}
      customRequest={customRequest}
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
