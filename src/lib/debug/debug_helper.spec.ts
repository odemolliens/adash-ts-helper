import test from 'ava';
import nock from 'nock';

import { NetworkHelper } from '../network';

import { activateDebugNetwork } from './debug_helper';

const nockFoo = nock('https://foo.bar');

test('activateDebugNetwork', async (t) => {
  const outputs = [];

  // eslint-disable-next-line functional/immutable-data
  process.env.DEBUG = '1';

  // eslint-disable-next-line functional/immutable-data, functional/functional-parameters
  console.debug = function (log: unknown, ...rest: readonly unknown[]) {
    // eslint-disable-next-line functional/immutable-data
    outputs.push([log, ...rest].join(' '));
  };

  // eslint-disable-next-line functional/immutable-data, functional/functional-parameters
  console.error = function (log: unknown, ...rest: readonly unknown[]) {
    // eslint-disable-next-line functional/immutable-data
    outputs.push([log, ...rest].join(' '));
  };

  activateDebugNetwork();

  nockFoo.get('/foo').reply(200, '1');
  await NetworkHelper.get('https://foo.bar/foo');
  t.is(outputs.length, 2);

  nockFoo.get('/foo').replyWithError('Error');
  try {
    await NetworkHelper.get('https://foo.bar/foo');
    // eslint-disable-next-line no-empty
  } catch (e) {}

  t.is(outputs.length, 4);
});
