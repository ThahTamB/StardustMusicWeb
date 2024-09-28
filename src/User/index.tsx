import { app } from 'firebase.config';
import { getDatabase, onValue, ref, set } from 'firebase/database';
import React, { useEffect, useRef, useState } from 'react';
import YouTube from 'react-youtube';
import { useTranslation } from 'react-i18next';
import {
  FastForwardOutlined,
  GoogleOutlined,
  SearchOutlined,
  UserOutlined,
  UsergroupAddOutlined,
} from '@ant-design/icons';
import { YOUTUBE_API_KEY } from 'Utils/Helpers';
import { Button, Input, Layout, Typography, theme, Row, Col } from 'antd';
import axios from 'axios';
import { GoogleAuthProvider, getAuth, signInWithPopup } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import ListPlayer from './Components/ListPlayer';
import ListVideoSearch from './Components/ListVideoSearch';
const { Header, Content, Footer, Sider } = Layout;



const items = [
  {
    key: '1',
    label: 'Yêu cầu nhạc',
    icon: React.createElement(UsergroupAddOutlined),
  },
  {
    key: '2',
    label: 'Nghe nhạc riêng',
    icon: React.createElement(UserOutlined),
  },
];
const { Title } = Typography;

const provider = new GoogleAuthProvider();
const auth = getAuth();

export interface Video {
  videoId?: string;
  url?: string;
  title?: string;
  thumbnail?: string;
  created?: number;
  user?: string;
}

interface User {
  uid?: string;
  email?: string;
  displayName?: string;
}



const UserMusicRequest = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [videoIds, setVideoIds] = useState<Video[]>([]);
  const [currentID, setCurrentID] = useState<Video | undefined>();
  const playerRef = useRef<YouTube | null>(null);

  const [currentUser, setCurrentUser] = useState<User | undefined>();

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

  const { t, i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState('vi');
  const handleLanguageChange = (language:string) => {
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
  const buttonNames : ButtonNames ={
    en: 'Switch to Viet Nam ',
    vi: 'Chuyển sang Tiếng Anh',
  };

  useEffect(() => {
    // List trên db thay đổi thì set list tương tự
    onValue(videos, (snapshot) => {
      const data: Video[] = snapshot.val();
      setVideoIds(data?.filter((e) => e && e.url) || []);
    });
    // Current trên db thay đổi thì set current tương tự
    onValue(currentVideo, (snapshot) => {
      const data: Video = snapshot.val();
      setCurrentID(data);
    });
  }, []);

  // Hàm xử lý tìm kiếm bài hát
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
            maxResults: 20,
          },
        })
        .then(async (res) => {
          setSearchResults(res.data.items ?? []);
        })
        .catch((err) => {
          Swal.fire({
            title: 'Lỗi mất rồi. Thử lại xem sao!!!',
            text: err.message,
            icon: 'error',
          });
        })
        .finally(() => {
          setLoading(false);
        });
    } catch (error) {
      console.error('Error searching for videos:', error);
    }
  };

  const handleAddVideo = async (item: any) => {
    const newItem: Video = {
      videoId: item.id.videoId,
      url: 'https://www.youtube.com/watch?v=' + item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.default.url,
      created: new Date().getTime(),
      user: currentUser?.displayName,
    };

    if (videoIds.findIndex((e) => e.videoId === newItem.videoId) > -1) {
      return;
    }

    setLoading(true);
    videoIds.push(newItem);
    set(
      videos,
      videoIds?.filter((e) => e && e.url),
    )
      .then(() => {
        Swal.fire({
          title: 'Thêm bài hát thành công nha',
          icon: 'success',
          timer: 1000,
          timerProgressBar: true,
        });
      })
      .finally(() => {
        setLoading(false);
      });
    setTxtKeyword('');
  };

  // Xử lý bỏ qua bài hát
  const handleNextVideo = () => {
    if (currentID?.user === 'Admin') {
      Swal.fire('Thông cảm', 'Không cho next bài của Admin nha hihi!', 'warning');
      return;
    }
    if (videoIds.length > 0) {
      const newList = videoIds?.filter((e, index) => index !== 0);
      set(ref(db, 'current'), newList.length > 0 ? newList[0] : null);
      set(ref(db, 'videos'), newList || []);
    } else {
      playerRef.current?.internalPlayer.playVideo();
    }
  };

  // Xử lý login với google
  const handleLogin = () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        const user = result.user;
        setCurrentUser(user as User);
      })
      .catch((error) => {
        console.log(JSON.stringify(error));
      });
  };

  const {
    token: { colorBgContainer, borderRadiusLG, colorBgLayout, colorBgBase },
  } = theme.useToken();

  return (
    <>
      <Layout
        className="!min-h-screen"
        style={{
          background: colorBgLayout,
          ...layoutStyles
        }}
      >
        <Content className="p-2">
          <div
            className="min-h-full"
            style={{
              borderRadius: borderRadiusLG,
            }}
          >
            <header className="flex justify-center gap-x-3 p-4">
              <div>
                <Input
                  className="h-12 !min-w-[70vw] !border-[#333333] bg-[#242424] !px-4"
                  prefix={<SearchOutlined className="text-base" />}
                  placeholder="Nhập bài hát muốn nghe"
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
                  disabled={!currentUser ? true : false}
                />
              </div>
            </header>
            {/* List music and list search */}
            <Layout className="text-white"
            style={{backgroundColor:darkMode? '#000':'#fff'}}>
              <div className="flex w-full flex-col  justify-around gap-1 md:flex-row">
                <div className="relative w-full rounded-r-md ${darkMode ? 'bg-[#121212]' : 'bg-[#f0f0f0]'}`} md:!w-[48%]">
                  {currentUser ? (
                    <>
                      <Title className="px-3" level={3}>
                        {searchResults.length > 0 ? 'Kết quả tìm kiếm' : 'Hãy tìm kiếm bài hát của bạn'}
                      </Title>
                      <ListVideoSearch searchResults={searchResults} handleAddVideo={handleAddVideo} />
                    </>
                  ) : (
                    <div className="flex min-h-[300px] w-full items-center justify-center md:h-full ">
                      <Button
                        className="text-xs !font-semibold uppercase"
                        style={{
                          backgroundColor:  '#438ceb',
                        }}
                        type="primary"
                        onClick={handleLogin}
                        icon={<GoogleOutlined />}
                      >
                        Đăng nhập để yêu cầu bài hát
                      </Button>
                    </div>
                  )}
                </div>
                <div className="w-full rounded-r-md ${darkMode ? 'bg-[#121212]' : 'bg-[#f0f0f0]'}`} p-2 md:w-[48%]">
                  <div className="flex justify-between">
                    <Title style={{ color: darkMode ? '#fff' : '#000' ,border: darkMode ? '#000' : '#fff'}} level={3}>{t('admin.currentListTitle')}</Title>
                    {currentUser && (
                      <Button 
                        type="primary" 
                        style={{
                          backgroundColor:  '#438ceb',
                        }}
                        icon={<FastForwardOutlined />} 
                        onClick={handleNextVideo}>
                        Qua bài khác
                      </Button>
                    )}
                  </div>

                  <ListPlayer loading={loading} videoIds={videoIds} currentID={currentID} darkMode={darkMode} />
                </div>
              </div>
            </Layout>
          </div>
          <Row justify="end" >
            <Col>
                <Button
                  type="primary"
                  style={{ width: '100px',margin: '10px 10px',backgroundColor:'#438ceb' }}
                  onClick={() => setDarkMode(!darkMode)}
                >
                  {darkMode ? t('admin.lightModeButton') : t('admin.darkModeButton')}
                </Button>
                <Button
                  type="primary"
                  style={{ width: '180px', margin: '10px 10px', backgroundColor: '#438ceb' }}
                  onClick={() => handleLanguageChange('en')}>
                  {buttonNames[currentLanguage]}
                </Button>
              </Col>
        </Row>
        </Content>
        <Footer style={{ textAlign: 'center',...layoutStyles }}>STARDUST MUSIC ©{new Date().getFullYear()} Create by Stardust</Footer>
      </Layout>
    </>
  );
};

export default UserMusicRequest;
