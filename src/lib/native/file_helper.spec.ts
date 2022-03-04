import { promises as fs } from 'fs';

import test from 'ava';
import nock from 'nock';

import { FileHelper } from '.';
const nockFoo = nock('https://foo.bar/static');

test('download', async (t) => {
  const fileContent = 'bar';
  const fileName = `foo.${Date.now()}`;
  nockFoo.get(`/${fileName}`).reply(200, fileContent);

  await FileHelper.download(
    `https://foo.bar/static/${fileName}`,
    `/tmp/${fileName}`
  );
  const readFileContent = await fs.readFile(`/tmp/${fileName}`);
  t.is(readFileContent.toString(), fileContent);
});

test('writeFile/readFile', async (t) => {
  const path = `/tmp/random_${Date.now()}.txt`;
  await FileHelper.writeFile('foo', path);

  const content = await FileHelper.readFile(path);
  t.is(content.toString(), 'foo');
});

test('writeFile/readJSONFile', async (t) => {
  const path = `/tmp/random_${Date.now()}.json`;
  await FileHelper.writeFile(JSON.stringify({ foo: 'bar' }), path);

  const content = await FileHelper.readJSONFile(path);
  t.is(content['foo'], 'bar');
});
