import { envConst } from './Constanst';

export const YOUTUBE_API_KEY = [
  envConst.youtubeApikey1,
  envConst.youtubeApikey2,
  envConst.youtubeApikey3,
  envConst.youtubeApikey4,
];
export const getVideoId = (url: string) => {
  let id = url.replace('https://www.youtube.com/watch?v=', '');
  if (id.indexOf('&')) {
    id = id.split('&')[0];
  }
  return id;
};

export const getVideoThumbnail = (url: string) => {
  return `https://img.youtube.com/vi/${getVideoId(url)}/sddefault.jpg`;
};

export const getVideoTitle = async (videoId: string) => {
  const url = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet&key=${YOUTUBE_API_KEY}`;
  const response = await fetch(url);
  const data = await response.json();
  if (data.items.length > 0) {
    return data.items[0].snippet.title;
  } else {
    return '';
  }
};
