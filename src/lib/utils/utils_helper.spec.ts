import test from 'ava';

import { getBool, iEquals, requireAndLogsKeys } from './utils_helper';

test('iEquals', async (t) => {
  t.true(iEquals('Foo', 'foO'));
  t.true(iEquals('Foo', 'Foo'));
  t.false(iEquals('foo', 'bar'));
});

test('requireAndLogsKeys', async (t) => {
  process.env.DEBUG = '1';

  const debugs = [];

  // eslint-disable-next-line functional/immutable-data, functional/functional-parameters
  console.debug = function (log: unknown, ...rest: readonly unknown[]) {
    // eslint-disable-next-line functional/immutable-data
    debugs.push([log, ...rest].join(' '));
  };

  t.notThrows(() => requireAndLogsKeys({ FOO: 'bar', BAR: 'foo' }));
  t.is(debugs.length, 2);

  t.throws(() => requireAndLogsKeys({ FOO: undefined }));
});

test('getBool', async (t) => {
  t.true(getBool('1'));
  t.true(getBool('true'));
  t.true(getBool(true));
  t.false(getBool('false'));
  t.false(getBool('0'));
  t.false(getBool(false));
  t.false(getBool(undefined));
  t.false(getBool(null));
});
