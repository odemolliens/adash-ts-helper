import test from 'ava';

import { notificator } from './';

test('notify', async (t) => {
  const notifications = [];
  const title = 'Title';
  const message = 'this is a notification';

  // register fakeService to the notificator
  const fakeService = {
    notify: async (title: string, message: string) => {
      notifications.push(`${title} ${message}`);
    },
  };

  notificator.registerMultiple([fakeService, fakeService]);

  await notificator.notify(title, message);
  t.is(notifications[0], `${title} ${message}`);
  t.is(notifications.length, 1);

  // remove fakeService to the notificator
  notificator.remove(fakeService);

  const outputs = [];

  console.error = function (log: unknown, ...rest: readonly unknown[]) {
    // eslint-disable-next-line functional/immutable-data
    outputs.push([log, ...rest].join(' '));
  };

  await notificator.notify(title, message);

  t.true((outputs[0] as string).includes('no notificators registered!'));
  t.is(notifications.length, 1);
});
