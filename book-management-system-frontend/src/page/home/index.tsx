import { useState, useEffect } from 'react';
import { Form, Input, Button, Card, message, Modal } from 'antd';
import CreateUpdateBookModal from './createUpdateBookModal';
import { deleteBook, getBooks } from '../../api';
import './index.css';
import { Book } from './types';

function Home() {
  const [books, setBooks] = useState<Array<Book>>([]);
  const [name, setName] = useState<string>('');
  const [open, setModalOpen] = useState<boolean>(false);
  const [bookId, setBookId] = useState<string>('');
  const onSearch = function(values: { name: string }) {
    setName(values.name);
  };

  const onDeleteBook = function(bookId: string) {
    Modal.confirm({
      title: '删除',
      content: '确认删除吗',
      onOk: () => {
        deleteBook(bookId).subscribe((res) => {
          if (res.code === 200) {
            message.success('删除成功');
            getBooks(name).subscribe((res) => {
              if (res.code === 200) {
                setBooks(res.data);
              }
            });
          }
        });
      },
    });
  };

  useEffect(() => {
    getBooks(name).subscribe((res) => {
      if (res.code === 200) {
        setBooks(res.data);
      }
    });
  }, [name]);
  return (
    <div className='book-management'>
      <h1>图书管理</h1>
      <CreateUpdateBookModal
        isOpen={open}
        bookId={bookId}
        handleClose={() => {
          setModalOpen(false);
          setBookId('');
          getBooks(name).subscribe((res) => {
            if (res.code === 200) {
              setBooks(res.data);
            }
          });
        }}
      />
      <div className='content'>
        <div className='book-search'>
          <Form layout='inline' onFinish={onSearch}>
            <Form.Item label='书籍名称' name='name'>
              <Input />
            </Form.Item>

            <Form.Item>
              <Button type='primary' htmlType='submit'>
                搜索
              </Button>
              <Button
                htmlType='button'
                style={{ marginLeft: '15px' }}
                onClick={() => setModalOpen(true)}
              >
                新增
              </Button>
            </Form.Item>
          </Form>
        </div>
        <div className='book-list'>
          {books.map((item) => {
            return (
              <Card
                key={item.id}
                className='book'
                hoverable
                style={{ width: 200 }}
                cover={
                  <img
                    style={{ width: '200px', height: '300px' }}
                    src={`http://localhost:3103/${item.cover}`}
                  />
                }
              >
                <h2>{item.name}</h2>
                <div className='author'>{item.author}</div>
                <div className='operator'>
                  <span
                    onClick={() => {
                      setModalOpen(true);
                      setBookId(item.id);
                    }}
                  >
                    详情
                  </span>
                  <span
                    onClick={() => {
                      setModalOpen(true);
                      setBookId(item.id);
                    }}
                  >
                    编辑
                  </span>
                  <span onClick={() => onDeleteBook(item.id)}>删除</span>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Home;
