const PREBUFFER_LENGTH = 12;

const modifyPrebuffer = (ch, store) => {
  const storeCopy = [...store];
  if (storeCopy.length > PREBUFFER_LENGTH) {
    storeCopy.shift();
  }

  storeCopy.push(ch);
  return storeCopy;
};

const getPrebuffer = store => {
  const totalPrebufferLength = (store[0] || []).length * PREBUFFER_LENGTH;

  return Buffer.concat(store, totalPrebufferLength);
};

module.exports = {
  modifyPrebuffer,
  getPrebuffer,
};