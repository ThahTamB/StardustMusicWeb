import { PauseCircleOutlined, PlayCircleOutlined, UserOutlined } from '@ant-design/icons';
import { Video } from 'User';
import { Avatar, List, Tag, Tooltip } from 'antd';
import React, { useState } from 'react';

type Props = {
  loading: boolean;
  videoIds: Video[];
  currentID: Video | undefined;
  darkMode: boolean;
};
const ListPlayer = ({ loading, videoIds, currentID, darkMode }: Props) => {

  
  
  
  return (
    <List
      className="mw-full md:absolute md:h-[65vh] md:overflow-y-auto"
      loading={loading}
      dataSource={videoIds}
      itemLayout="vertical"
      style={{border: darkMode? '1px solid #000':'2px solid #dfe2ec'}}
      bordered
      size="small"
      renderItem={(item, index) => {
        const isPlaying = currentID?.videoId === item.videoId;

        return (
          <List.Item key={index}
          style={{
            backgroundColor: isPlaying && darkMode ? '#141931' : isPlaying ? '#dfe2ec':'',
          }}
          extra={<img width={120} alt={item.title} src={item.thumbnail} />}>
            <List.Item.Meta
              avatar={<Avatar className="!bg-gray-400" shape="circle" icon={index + 1} />}
              title={
                <a
                  href={item.url}
                  style={{
                    color:  darkMode? '#fff':'#000',
                  }}
                >
                  {item.title}
                </a>
              }
            />
            <div className="flex gap-x-1">
              <Tooltip title="Người yêu cầu">
                <Tag className="!rounded-full" icon={<UserOutlined />} color={isPlaying ? 'gray' : 'gray'} >
                  {item.user || 'Anonymous'}
                </Tag>
              </Tooltip>
              <Tooltip title="Trạng thái">
                <Tag
                  className="!rounded-full"
                  icon={isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                  color={isPlaying ? 'gray' : 'gray'}
                >
                  {isPlaying ? <>Đang phát</> : <>Chờ phát</>}
                </Tag>
              </Tooltip>
            </div>
          </List.Item>
        );
      }}
    />
  );
};

export default ListPlayer;
