export const getNow = (): string => {
  const koreanTime = new Date().toLocaleString('ko-KR', {
    timeZone: 'Asia/Seoul',
  });
  return koreanTime;
};
