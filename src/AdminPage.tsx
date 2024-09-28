import Admin from 'Admin';
import { customTheme } from 'Theme';
import { ConfigProvider } from 'antd';
import { StyleProvider } from '@ant-design/cssinjs';

const AdminPage = () => {
  return (
    <ConfigProvider theme={customTheme}>
      <StyleProvider hashPriority="high">
        {/* Các page liên quan đến màn hình phía admin */}
        <Admin />
      </StyleProvider>
    </ConfigProvider>
  );
};

export default AdminPage;
