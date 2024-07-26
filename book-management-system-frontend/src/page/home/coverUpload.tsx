import { GetProp, Upload, message, Image } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import React, { useState } from 'react';
import { DraggerProps, UploadFile, UploadProps } from 'antd/es/upload';
import './upload.css';

interface IProps {
  value: string;
  onChange: (imageSrc: string) => void;
}

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

const getBase64 = function(file: FileType): Promise<string> {
  return new Promise((resolve) => {
    const filereader = new FileReader();
    filereader.readAsDataURL(file);
    filereader.onload = function() {
      resolve(filereader.result as string);
    };
  });
};

const CoverUpload: React.FC<IProps> = function(props) {
  const [isPreview, setPreview] = useState<boolean>(false);
  const [previewImage, setPreviewImage] = useState<string>('');
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const draggerProps: DraggerProps = {
    action: 'http://localhost:3103/book/upload',
    name: 'file',
    method: 'post',
    // fileList: props.value ? [
    //   {
    //     url: `http://localhost:3103/${props.value}`,
    //     name: 'picture',
    //     status: 'done',
    //     uid: Math.random()
    //       .toString(36)
    //       .slice(2),
    //   },
    // ] : fileList,
    onChange(info) {
      const { status, response } = info.file;
      console.log('info', info);
      if (status === 'done') {
        message.success('上传成功');
        setFileList(info.fileList.map(item => ({
          ...item,
          url: `http://localhost:3103/${response.data}`
        })));
        props.onChange(response.data);
      } else if (status === 'error') {
        message.error(`${info.file.name} 文件上传失败`);
      } else if (status === 'removed') {
        props.onChange('');
      }
    },
    listType: 'picture-card',
    onPreview(file: UploadFile) {
      if (!file.url) {
        getBase64(file.originFileObj as FileType).then((res) => {
          file.url = res;
          setPreviewImage(res);
          setPreview(true);
        });
      } else {
        setPreviewImage(file.url);
        setPreview(true);
      }
    },
    className: 'cover-upload',
  };
  console.log('', draggerProps.fileList, props);
  return (
    <>
      {props.value && <Image
        src={`http://localhost:3103/${props.value}`}
        style={{ width: '80px', height: '120px' }}
        preview={{
          visible: isPreview,
          onVisibleChange(visible) {
            setPreview(visible);
          },
        }}
      />}
      <Upload.Dragger {...draggerProps}>
        <InboxOutlined />
        <p>点击或拖拽上传</p>
      </Upload.Dragger>
      {/* {isPreview && (

      )} */}
    </>
  );
};

export default CoverUpload;
