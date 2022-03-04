import test from 'ava';
import { matchesProperty } from 'lodash';
import nock from 'nock';

import { slack } from './';

const webhookURL =
  'https://fakewebhookURL.slack.com/services/xxxx/1qweqweIMZLkMkA';

const nockSlack = nock(webhookURL);

test('notify', async (t) => {
  const title = 'Title';
  const message = 'this is a notification';

  nockSlack
    .post('', matchesProperty('blocks.0.text.text', title))
    .reply(200, '1');

  const response = await slack({ webhookURL, username: 'test slack' }).notify(
    title,
    message
  );
  t.is(response, 1);
});
