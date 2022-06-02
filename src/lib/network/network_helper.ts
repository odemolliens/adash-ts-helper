import axios from 'axios';
import { createWriteStream } from 'fs';
import * as stream from 'stream';
import { promisify } from 'util';

const finished = promisify(stream.finished);
const NetworkHelper = axios.create({
  proxy: false,
});

export const NetworkUtils = {
  async downloadFile(fileUrl: string, outputLocationPath: string): Promise<any> {
    const writer = createWriteStream(outputLocationPath);
    return NetworkHelper({
      method: 'get',
      url: fileUrl,
      responseType: 'stream',
    }).then(response => {
      response.data.pipe(writer);
      return finished(writer);
    });
  }
}



export default NetworkHelper;
