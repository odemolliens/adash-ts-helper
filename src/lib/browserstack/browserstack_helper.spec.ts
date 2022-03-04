import test from 'ava';
import nock from 'nock';

import BrowserStackHelper, {
  BASE_URL,
  BUILDS_ENDPOINT,
} from './browserstack_helper';

const IGNORE_QUERY_PARAMS = true;

const nockBrowserStack = nock(BASE_URL);

const browserStackHelperInstance = BrowserStackHelper({
  auth: {
    username: 'username',
    password: 'password',
  },
});

test('getBuilds', async (t) => {
  nockBrowserStack
    .get(BUILDS_ENDPOINT)
    .basicAuth({
      user: browserStackHelperInstance.opts.auth.username,
      pass: browserStackHelperInstance.opts.auth.password,
    })
    .query(IGNORE_QUERY_PARAMS)
    .reply(200, [
      { automation_build: { name: 'foobar1' } },
      { automation_build: { name: 'foobar2' } },
    ]);

  const builds = await browserStackHelperInstance.getBuilds();
  t.is(builds.length, 2);
});
