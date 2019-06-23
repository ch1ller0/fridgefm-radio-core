const shuffleArray = (arr: any[]): any[] => arr
  .map((a) => [Math.random(), a])
  .sort((a, b) => a[0] - b[0])
  .map((a) => a[1]);

module.exports = {
  shuffleArray,
};
