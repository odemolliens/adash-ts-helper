import test from 'ava';

import { simpleLogger as logger } from './';

test('loghelper info', async (t) => {
  const infos = [];

  // eslint-disable-next-line functional/immutable-data, functional/functional-parameters
  console.info = function (log: unknown, ...rest: readonly unknown[]) {
    // eslint-disable-next-line functional/immutable-data
    infos.push([log, ...rest].join(' '));
  };

  logger().info('Log infos', 'more infos');
  t.is(infos.length, 1);
});

test('loghelper debug', async (t) => {
  const debugs = [];

  // eslint-disable-next-line functional/immutable-data, functional/functional-parameters
  console.debug = function (log: unknown, ...rest: readonly unknown[]) {
    // eslint-disable-next-line functional/immutable-data
    debugs.push([log, ...rest].join(' '));
  };

  logger().debug('debug');
  t.is(debugs.length, 0);

  const loggerWithDebug = logger({ showDebug: true });
  loggerWithDebug.debug('debug');
  t.is(debugs.length, 1);
});

test('loghelper error', async (t) => {
  const errors = [];

  // eslint-disable-next-line functional/immutable-data, functional/functional-parameters
  console.error = function (log: unknown, ...rest: readonly unknown[]) {
    // eslint-disable-next-line functional/immutable-data
    errors.push([log, ...rest].join(' '));
  };

  logger().error('error');
  t.is(errors.length, 1);
});
