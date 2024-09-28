import { Button, Col, Divider, Row } from 'antd';
import React from 'react';

type Props = {
  searchResults: any[];
  handleAddVideo: (item: any) => void;
};
const ListVideoSearch = ({ searchResults, handleAddVideo }: Props) => {
  return (
    <>
      {/* LIST VIDEO SEARCH */}
      <div className="w-full md:absolute md:h-[65vh] md:overflow-y-scroll">
        {searchResults.map((item: any, index: number) => {
          return (
            <>
              <div key={index} className="flex items-center gap-x-3 px-3 hover:bg-gray-800">
                <div className="flex items-center">
                  <img src={item.snippet.thumbnails.default.url} alt={item.snippet.thumbnails.default.url} />
                </div>
                <div className="flex w-full flex-col">
                  <h5>{item.snippet.title}</h5>
                  <p>{item.snippet.channelTitle}</p>
                </div>
                <div>
                  <Button style ={{backgroundColor:'#438ceb'}} type="primary" onClick={() => handleAddVideo(item)}>
                    Thêm
                  </Button>
                </div>
              </div>
              <Divider className="!my-2" />
            </>
          );
        })}
      </div>
    </>
  );
};

export default ListVideoSearch;
