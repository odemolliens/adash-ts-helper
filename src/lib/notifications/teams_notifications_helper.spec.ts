import test from 'ava';
import { matches } from 'lodash';
import nock from 'nock';

import { teams } from './';

const webhookURL =
  'https://fakewebhookURL.webhook.office.com/webhookb2/qqqweewwedasasd/IncomingWebhook/qweqwe0/78efeqweqwesadasd9cee';

const nockTeams = nock(webhookURL);

test('notify', async (t) => {
  const title = 'Title';
  const message = 'this is a notification';

  nockTeams.post('', matches({ summary: title })).reply(200, '1');

  const response = await teams({ webhookURL }).notify(title, message);
  t.is(response, 1);
});
