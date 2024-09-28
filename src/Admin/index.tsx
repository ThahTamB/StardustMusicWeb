import { getDatabase, onValue, ref, set } from 'firebase/database';
import { useEffect, useRef, useState } from 'react';
import YouTube from 'react-youtube';
import { app } from 'firebase.config';
import Swal from 'sweetalert2';
import ReactDragListView from 'react-drag-listview';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import { YOUTUBE_API_KEY } from 'Utils/Helpers';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import {
  Avatar,
  Button,
  Divider,
  Input,
  Layout,
  List,
  Popover,
  Skeleton,
  Space,
  Spin,
  Tag,
  Tooltip,
  Typography,
  theme,
  Row,
  Col,
} from 'antd';
import {
  CloseCircleOutlined,
  FastForwardOutlined,
  UpSquareOutlined,
  DeleteOutlined,
  MenuOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  SearchOutlined,
  UserOutlined,
  SunOutlined,
  MoonOutlined,
} from '@ant-design/icons';
const { Header, Content, Footer, Sider } = Layout;

const { Title } = Typography;
interface Video {
  videoId?: string;
  url?: string;
  title?: string;
  thumbnail?: string;
  created?: number;
  user?: string;
}
const Admin = () => {
  const { t, i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState('vi');
  const handleLanguageChange = (language: string) => {
    // Kiểm tra ngôn ngữ hiện tại
    if (currentLanguage === 'en') {
      // Nếu là tiếng Anh, chuyển sang tiếng Việt
      setCurrentLanguage('vi');
      i18n.changeLanguage('vi');
    } else {
      // Ngược lại, nếu là tiếng Việt, chuyển sang tiếng Anh
      setCurrentLanguage('en');
      i18n.changeLanguage('en');
    }
  };
  type ButtonNames = {
    [key: string]: string;
  };
  const buttonNames: ButtonNames = {
    en: 'Switch to Viet Nam ',
    vi: 'Chuyển sang Tiếng Anh',
  };

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [videoIds, setVideoIds] = useState<Video[]>([]);
  const [currentID, setCurrentID] = useState('');
  const playerRef = useRef<YouTube | null>(null);

  const [txtKeyword, setTxtKeyword] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const db = getDatabase(app);
  const videos = ref(db, 'videos');
  const currentVideo = ref(db, 'current');

  const [darkMode, setDarkMode] = useState(true);
  const darkModeStyles = {
    backgroundColor: '#000', // Màu nền cho chế độ tối
    color: '#fff', // Màu chữ cho chế độ tối
    border: '1 solid #222222',
  };

  const lightModeStyles = {
    backgroundColor: '#fff', // Màu nền cho chế độ sáng
    color: '#000', // Màu chữ cho chế độ sáng
    border: '1 solid #777',
  };

  const layoutStyles = darkMode ? darkModeStyles : lightModeStyles;

  useEffect(() => {
    playCurrent();

    // Khi list trên db thay đổi thì cũng set list ở dưới như vậy
    onValue(videos, (snapshot) => {
      const data: Video[] = snapshot.val();
      setVideoIds(data || []);

      playCurrent();
    });
    // Khi current trên db thay đổi thì cũng set current ở dưới như vậy
    onValue(currentVideo, (snapshot) => {
      const data: Video = snapshot.val();
      setCurrentID(data?.videoId || '');

      playCurrent();
    });
  }, []);

  const handleSearch = async () => {
    try {
      setLoading(true);
      await axios
        .get('https://www.googleapis.com/youtube/v3/search', {
          params: {
            key: YOUTUBE_API_KEY[Math.floor(Math.random() * YOUTUBE_API_KEY.length)],
            part: 'snippet',
            q: txtKeyword,
            type: 'video',
            maxResults: 10,
          },
        })
        .then((res) => {
          setSearchResults(res.data.items ?? []);
          setShowSearch(true);
        })
        .catch((err) => {
          Swal.fire('Hi', 'Dùng chùa nên hết lượt tìm rồi', 'error');
        });
      setLoading(false);
    } catch (error) {
      console.error('Lỗi tìm kiếm', error);
    }
  };

  const playCurrent = () => {
    if (!currentID) {
      if (videoIds && videoIds.length > 0) {
        set(ref(db, 'current'), videoIds[0]);
      }
    }
  };

  const handleAddVideo = async (item: any) => {
    setLoading(true);

    const newItem: Video = {
      videoId: item.id.videoId,
      url: 'https://www.youtube.com/watch?v=' + item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.default.url,
      created: new Date().getTime(),
      user: 'Admin',
    };

    videoIds.push(newItem);
    set(videos, videoIds).then(() => {
      setLoading(false);
    });
    setTxtKeyword('');

    playCurrent();
  };

  const handleNextVideo = () => {
    if (videoIds.length > 1) {
      set(ref(db, 'current'), videoIds?.filter((e) => e && e.videoId !== currentID)[0]);
      set(
        ref(db, 'videos'),
        videoIds?.filter((e) => e && e.videoId !== currentID),
      );
    }
    playerRef?.current?.internalPlayer.playVideo();
  };

  const handleRemoveVideo = (videoId: string) => {
    const updatedVideoIds = videoIds.filter((video) => video.videoId !== videoId);
    set(videos, updatedVideoIds).then(() => {
      if (currentID === videoId) {
        handleNextVideo();
      }
    });
  };

  const handlePushToTop = (videoId: string) => {
    if (videoId === currentID) return; // Do nothing if it's the currently playing video

    const videoIndex = videoIds.findIndex((video) => video.videoId === videoId);
    const currentIndex = videoIds.findIndex((video) => video.videoId === currentID);

    if (videoIndex > -1 && currentIndex > -1) {
      const videoToMove = videoIds[videoIndex];
      let newVideoList = [...videoIds];
      newVideoList.splice(videoIndex, 1); // Remove the video from its current position
      newVideoList.splice(currentIndex + 1, 0, videoToMove); // Insert it right after the currently playing video

      setVideoIds(newVideoList); // Update local state
      set(videos, newVideoList); // Update Firebase
    }
  };

  const onDragEnd = (fromIndex: number, toIndex: number) => {
    const currentIndex = videoIds.findIndex((video) => video.videoId === currentID);
    if (toIndex < 0 || fromIndex === toIndex || (fromIndex > currentIndex && toIndex <= currentIndex)) {
      return;
    }
    const item = videoIds[fromIndex];
    const newVideoIds = [...videoIds];
    newVideoIds.splice(fromIndex, 1);
    newVideoIds.splice(toIndex, 0, item);
    setVideoIds(newVideoIds);
    set(videos, newVideoIds);
  };

  const opts = {
    height: '400',
    // width: '600',
    playerVars: { autoplay: 1, disablekb: 1, enablejsapi: 0 },
  };
  const {
    token: { colorBgContainer, borderRadiusLG, colorBgLayout, colorBgBase },
  } = theme.useToken();

  const [showSearch, setShowSearch] = useState(false);

  return (
    <>
      <Layout
        className="!min-h-screen"
        style={{
          background: colorBgLayout,
          ...layoutStyles,
        }}
      >
        <header className="flex justify-center gap-x-3 p-4">
          <div>
            <Popover
              title={
                <Title className="flex justify-between px-3" level={5}>
                  {searchResults.length > 0 ? t('admin.searchResultsTitle') : 'Hãy tìm kiếm bài hát của bạn'}
                  <Button type="text" icon={<CloseCircleOutlined />} onClick={() => setShowSearch(false)}>
                    {t('admin.searchResultsClose')}
                  </Button>
                </Title>
              }
              trigger="click"
              open={showSearch}
              // onOpenChange={handleOpenChange}
              content={
                <div className="h-[50vh] w-full overflow-y-scroll rounded-r-md bg-[#121212]">
                  <>
                    {/* LIST VIDEO SEARCH */}
                    <div>
                      {searchResults.map((item: any, index: number) => {
                        return (
                          <>
                            <div key={index} className="flex items-center gap-x-3 px-3 hover:bg-gray-800">
                              <div className="flex items-center">
                                <img
                                  src={item.snippet.thumbnails.default.url}
                                  alt={item.snippet.thumbnails.default.url}
                                />
                              </div>
                              <div className="flex w-full flex-col">
                                <h5>{item.snippet.title}</h5>
                                <p>{item.snippet.channelTitle}</p>
                              </div>
                              <div>
                                <Button
                                  type="primary"
                                  style={{ backgroundColor: '#438ceb' }}
                                  onClick={() => handleAddVideo(item)}
                                >
                                  {t('admin.addToQueueButton')}
                                </Button>
                              </div>
                            </div>
                            <Divider className="!my-2" />
                          </>
                        );
                      })}
                    </div>
                  </>
                </div>
              }
            >
              <Input
                className="h-12 !min-w-[60vw]  !border-[#333333] bg-[#242424] !px-4"
                prefix={<SearchOutlined className="text-base" />}
                placeholder={t('admin.searchPlaceholder')}
                value={txtKeyword}
                onChange={(e) => setTxtKeyword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
                style={{
                  ...layoutStyles,
                }}
              />
            </Popover>
          </div>
        </header>
        <Content className="p-2">
          {/* List music and list search */}
          <div className="flex w-full flex-col justify-around gap-1 md:flex-row">
            {/* PLAYING VIDEO */}
            <YouTube
              className="flex justify-center rounded-md md:w-1/2"
              ref={playerRef}
              videoId={currentID}
              opts={opts}
              onEnd={handleNextVideo}
            />
            <div className="${darkMode ? 'bg-[#121212]' : 'bg-[#f0f0f0]'}`} w-full rounded-r-md p-2 md:w-1/2">
              <div className="flex justify-between">
                <Title style={{ color: darkMode ? '#fff' : '#000', border: darkMode ? '#000' : '#fff' }} level={3}>
                  {t('admin.currentListTitle')}
                </Title>
                <Button
                  type="primary"
                  style={{
                    backgroundColor: '#438ceb',
                  }}
                  icon={<FastForwardOutlined />}
                  onClick={handleNextVideo}
                >
                  {t('admin.nextVideoButton')}
                </Button>
              </div>
              <ReactDragListView onDragEnd={onDragEnd} nodeSelector="li" handleSelector=".drag-handle">
                <List
                  className="md:h-[65vh] md:overflow-x-scroll"
                  loading={loading}
                  dataSource={videoIds}
                  itemLayout="vertical"
                  style={{ border: darkMode ? '1px solid #000' : '2px solid #dfe2ec' }}
                  bordered
                  size="small"
                  renderItem={(item, index) => {
                    const isPlaying = currentID === item.videoId;

                    return (
                      <List.Item
                        key={index}
                        style={{
                          backgroundColor: isPlaying && darkMode ? '#141931' : isPlaying ? '#dfe2ec' : '',
                        }}
                        extra={<img width={120} alt={item.title} src={item.thumbnail} />}
                      >
                        <List.Item.Meta
                          avatar={
                            <Avatar
                              className={isPlaying ? '!bg-gray-400' : 'drag-handle !bg-gray-400'}
                              shape="circle"
                              icon={isPlaying ? <PlayCircleOutlined /> : <MenuOutlined />}
                            />
                          }
                          title={
                            <a
                              href={item.url}
                              style={{
                                color: darkMode ? '#fff' : '#000',
                              }}
                            >
                              {item.title}
                            </a>
                          }
                        />
                        <div className="flex w-full justify-between">
                          <div>
                            <Tooltip title={t('admin.requestedBy')}>
                              <Tag className="!rounded-full" icon={<UserOutlined />} color="gray">
                                {item.user || 'Anonymous'}
                              </Tag>
                            </Tooltip>
                            <Tooltip title={t('admin.state')}>
                              <Tag
                                className="!rounded-full"
                                icon={isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                                color={isPlaying ? 'gray' : 'gray'}
                              >
                                {isPlaying ? <>{t('admin.playingStatus')}</> : <>{t('admin.waitingStatus')}</>}
                              </Tag>
                            </Tooltip>
                          </div>
                          {!isPlaying && (
                            <div className="flex gap-x-1">
                              <Button
                                type="primary"
                                style={{
                                  backgroundColor: '#438ceb',
                                }}
                                onClick={() => item.videoId && handlePushToTop(item.videoId)}
                                icon={<UpSquareOutlined />}
                              >
                                {t('admin.moveToTopButton')}
                              </Button>
                              <Button
                                type="primary"
                                style={{
                                  backgroundColor: '#b12020',
                                }}
                                onClick={() => item.videoId && handleRemoveVideo(item.videoId)}
                                icon={<DeleteOutlined />}
                              >
                                {t('admin.removeButton')}
                              </Button>
                            </div>
                          )}
                        </div>
                      </List.Item>
                    );
                  }}
                />
              </ReactDragListView>
            </div>
          </div>
          <Row justify="end">
            <Col>
              <Button
                type="primary"
                style={{ width: '40px', margin: '10px 10px', backgroundColor: '#438ceb' }}
                onClick={() => setDarkMode(!darkMode)}
                icon={darkMode ? <SunOutlined /> : <MoonOutlined />}
              >
                {/* {darkMode ? t('admin.lightModeButton') : t('admin.darkModeButton')} */}
              </Button>
              <Button
                type="primary"
                style={{ width: '180px', margin: '10px 10px', backgroundColor: '#438ceb' }}
                onClick={() => handleLanguageChange('en')}
              >
                {buttonNames[currentLanguage]}
              </Button>
            </Col>
          </Row>
        </Content>
        <Footer style={{ textAlign: 'center', ...layoutStyles }}>
          Stardust Music ©{new Date().getFullYear()} Create by Stardust
        </Footer>
      </Layout>
    </>
  );
};

export default Admin;
