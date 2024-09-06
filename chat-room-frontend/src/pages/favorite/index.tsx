import { Alert, Button, Card, Image, Tabs } from 'antd';
import './index.css';
import { useEffect, useMemo, useState } from 'react';
import { getFavorites } from '@/api/favorite';
import { FavoriteItem, FavoriteType } from '@/api/favorite/types';
import { formatTime } from '@/common/utils';
import ChatRecordModal from './chatRecordModal';
const Favorite = function() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [open, setOpen] = useState(false);
  const [favoriteId, setFavoriteId] = useState(0);
  const renderPane = function(list: FavoriteItem[]) {
    return (
      <div>
        {list.map((favorite) => {
          return (
            <Card
              key={favorite.id}
              title={favorite.chatHistories?.length ? '聊天记录' : ''}
              style={{ marginBottom: '12px' }}
            >
              {favorite.type === FavoriteType.chatHistory && (
                <Button
                  type='link'
                  onClick={() => {
                    setFavoriteId(favorite.id);
                    setOpen(true);
                  }}
                >
                  详情
                </Button>
              )}
              {favorite.type === FavoriteType.text && favorite.content}
              {favorite.type === FavoriteType.image && (
                <Image src={favorite.content} width={60} />
              )}
              {favorite.type === FavoriteType.file && (
                <a href={favorite.content} download>
                  {(favorite.content || '').split('/').pop()}
                </a>
              )}
              <p className='favorite-time'>
                {formatTime(new Date(favorite.createTime), 'y年m月d日 h:i:s')}
              </p>
            </Card>
          );
        })}
      </div>
    );
  };
  const imageFavorites = useMemo(() => {
    return favorites.filter((favorite) => favorite.type === FavoriteType.image);
  }, [favorites]);
  const fileFavorites = useMemo(() => {
    return favorites.filter((favorite) => favorite.type === FavoriteType.file);
  }, [favorites]);
  useEffect(() => {
    getFavorites().then((res) => {
      res.code === 200 && setFavorites(res.data);
    });
  }, []);
  return (
    <div className='favorite-container'>
      <Alert type='info' message='鼠标移入消息，然后右键点击即可收藏哦' />
      <Tabs
        items={[
          {
            key: 'all',
            tabKey: 'all',
            label: '全部',
            children: renderPane(favorites),
          },
          {
            key: 'image',
            tabKey: 'image',
            label: '图片',
            children: renderPane(imageFavorites),
          },
          {
            key: 'file',
            tabKey: 'file',
            label: '文件',
            children: renderPane(fileFavorites),
          },
        ]}
      ></Tabs>
      <ChatRecordModal
        open={open}
        onClose={() => setOpen(false)}
        favoriteId={favoriteId}
      />
    </div>
  );
};

export default Favorite;
