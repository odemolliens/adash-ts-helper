import fs from 'fs';
import stream from 'stream';
import util from 'util';

import { simpleLogger as logger } from '../debug';
import { NetworkHelper } from '../network';

const pipelinePromise = util.promisify(stream.pipeline);
const writeFilePromise = util.promisify(fs.writeFile);
const readFilePromise = util.promisify(fs.readFile);

/**
 * Downloads a remote file and save the content into the given path
 *
 * @param url
 * @param path
 */
export const download = async (url: string, path: string) => {
  logger().debug('Download file', url, 'and save the content into', path);

  const { data } = await NetworkHelper.get(url, { responseType: 'stream' });
  await pipelinePromise(data, fs.createWriteStream(path));
};

/**
 * Creates a new file with the given data as file content
 *
 * @param data
 * @param path
 */
export const writeFile = async (data: unknown, path: string) => {
  logger().debug('Write file', path, 'with data', data);
  data = typeof data === 'string' ? data : JSON.stringify(data);
  await writeFilePromise(path, data as string);
};

/**
 * Reads and returns the content of the file for the given path
 *
 * @param path
 */
export const readFile = async (path: string) => {
  logger().debug('Read file', path);
  return await readFilePromise(path);
};

/**
 * Reads and returns the content of the JSON file for the given path
 *
 * @param path
 */
export const readJSONFile = async (path: string) => {
  logger().debug('Read file', path);
  return JSON.parse((await readFilePromise(path)).toString());
};
