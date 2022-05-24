import test from 'ava';

import { simpleLogger } from '../debug';

import { simpleDb } from '.';

test('simpleDb', async (t) => {
  type SimpleRow = {
    readonly createdAt: Date;
    readonly foo: string;
  };

  const logger = simpleLogger({ showInfo: false, showDebug: false });
  const path = `/tmp/db_${Date.now()}.json`;
  const db = simpleDb<SimpleRow>({ path, logger });
  await db.init();

  // insert
  await db.insert({ createdAt: new Date(), foo: 'bar' });
  t.is(db.data()[0].foo, 'bar');

  await db.reset();
  t.is(db.data().length, 0);

  // pre-commit
  const beforeCommit = simpleDb<SimpleRow>({ path, logger });
  await beforeCommit.init();
  t.is(beforeCommit.data().length, 0);

  // after-commit check
  await db.insert({ createdAt: new Date(), foo: 'bar' });
  await db.commit();
  const afterCommit = simpleDb<SimpleRow>({ path, logger });
  await afterCommit.init();
  t.is(afterCommit.data().length, 1);

  // delete
  const today = new Date();
  await db.filter((row) => row.createdAt >= today);
  t.is(db.data().length, 0);

  // insertAll
  await db.insertAll([
    { createdAt: new Date(), foo: 'bar1' },
    { createdAt: new Date(), foo: 'bar2' },
  ]);
  t.is(db.data().length, 2);

  // replace
  await db.replace([{ createdAt: new Date(), foo: 'bar2' }]);
  t.is(db.data().length, 1);
});

test('simpleDb compress option on', async (t) => {
  type SimpleRow = {
    readonly createdAt: Date;
    readonly foo: string;
  };

  const logger = simpleLogger({ showInfo: false, showDebug: false });
  const path = `/tmp/db_${Date.now()}.json`;
  const db = simpleDb<SimpleRow>({ path, logger, compress: true });
  await db.init();

  // insert
  await db.insert({ createdAt: new Date(), foo: 'bar' });
  t.is(db.data()[0].foo, 'bar');

  await db.reset();
  t.is(db.data().length, 0);

  // pre-commit
  const beforeCommit = simpleDb<SimpleRow>({ path, logger, compress: true });
  await beforeCommit.init();
  t.is(beforeCommit.data().length, 0);

  // after-commit check
  await db.insert({ createdAt: new Date(), foo: 'bar' });
  await db.commit();
  const afterCommit = simpleDb<SimpleRow>({ path, logger, compress: true });
  await afterCommit.init();
  t.is(afterCommit.data().length, 1);

  // delete
  const today = new Date();
  await db.filter((row) => row.createdAt >= today);
  t.is(db.data().length, 0);

  // insertAll
  await db.insertAll([
    { createdAt: new Date(), foo: 'bar1' },
    { createdAt: new Date(), foo: 'bar2' },
  ]);
  t.is(db.data().length, 2);

  // replace
  await db.replace([{ createdAt: new Date(), foo: 'bar2' }]);
  t.is(db.data().length, 1);
});
