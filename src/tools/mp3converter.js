const Lame = require('node-lame').Lame;
const { processFilesInDir } = require('../utils/file');
const fs = require('fs-extra');
const path = require('path');
const { createId3TagsSchema } = require('../sound/Track/trackMethods');
const { logger } = require('../utils/logger');

const OUTPUT_PATH = './resampled';

const getOutputPath = fileName => `${outputDir}/${fileName}`;

const resampleFileAsync = ({ file, path }, cb) => {
  const [fileNameNoFormat, format] = file.split('.');
  const input = `${path}/${fileNameNoFormat}.${format}`;
  const output = getOutputPath(`${fileNameNoFormat}.mp3`);

  const encoder = new Lame({
    output,
    bitrate: 128,
    resample: 44.1,
    meta: createId3TagsSchema({ fileName: file }),
  }).setFile(input);

  return encoder.encode()
    .then(() => {
      cb({ file, path});
    });
};

const directory = process.argv[2];
if (!directory) {
  throw new Error('you need some directory to convert files from');
}

// create output directory if not exist
const outputDir = path.resolve(directory, OUTPUT_PATH);
console.log('OUTPUT DIRECTORY:', outputDir);

// TODO create nice script
// 1. Run resample for all file formats (wav, mp3, exclude: .asd, .files)
// 2. Check that all resulting files are in mp3
fs.ensureDir(outputDir).then(() => {
  (async function l() {
    let promises = [];
    processFilesInDir(directory, stats => {
      const { file } = stats;
      if (!fs.existsSync(getOutputPath(file))) {
        promises.push(resampleFileAsync(stats, () => {
          logger('Resampled file:', 'bg', false, ` ${file} OK`);
        }));
      } else {
        logger('Skipped file:', 'bb', false, ` ${file} ALREADY EXISTS`);
      }
    }, { recursively : false, onlyMp3: false });
    return await Promise.all(promises)
      .catch(e => {
        logger(e, 'r');
        throw e;
      });
  })();
});
