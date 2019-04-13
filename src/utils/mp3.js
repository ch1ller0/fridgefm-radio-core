module.exports.isMp3 = file => {
  const arr = file.split('.');
  return arr[arr.length - 1] === 'mp3';
};
