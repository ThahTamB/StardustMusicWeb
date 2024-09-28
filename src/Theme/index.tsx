import { ThemeConfig } from 'antd';

export const customTheme: ThemeConfig = {
  token: {
    // Seed Token
    colorPrimary: '#1ed760',
    colorText: '#ffffff',
    borderRadius: 4,
    // Alias Token
    colorBgContainer: '#fff',
    colorBgLayout: '#000',
    colorBgBase: '#212121',
    colorBgContainerDisabled: '#fff',
  },
  components: {
    Input: {
      colorBorder: '#ffffff',
      colorTextPlaceholder: '#757575',
      borderRadius: 100,
      activeShadow: '0 0 0 2px #fff',
    },
  },
};
