export const addEllipsisToEachWordsInTheEnd = (
  _val: string,
  ellipsisStartAt: number,
  separator = ' '
) => {
  const words = _val.split(separator);
  const formattedWords = words.map((val) => {
    return val.length > ellipsisStartAt
      ? `${val.slice(0, ellipsisStartAt)}...`
      : val;
  });
  return formattedWords.join(separator);
};
