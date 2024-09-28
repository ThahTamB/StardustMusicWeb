import { StyleProvider } from '@ant-design/cssinjs';
import { ConfigProvider } from 'antd';
import { customTheme } from 'Theme';
import UserMusicRequest from 'User';

const UserPage = () => {
  return (
    <ConfigProvider theme={customTheme}>
      <StyleProvider hashPriority="high">
        {/* Các page liên quan đến màn hình phía user */}
        <UserMusicRequest />
      </StyleProvider>
    </ConfigProvider>
  );
};

export default UserPage;
