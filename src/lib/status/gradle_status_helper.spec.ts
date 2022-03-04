import test from 'ava';
import nock from 'nock';

import { BASE_URL, STATUS_ENDPOINT } from './gradle_status_helper';

import { GradleStatusHelper } from './index';

const IGNORE_QUERY_PARAMS = true;

const nockGradle = nock(BASE_URL);

test('getStatus', async (t) => {
  nockGradle
    .get(STATUS_ENDPOINT)
    .query(IGNORE_QUERY_PARAMS)
    .reply(200, {
      status: { indicator: 'none', description: 'All Systems Operational' },
    });

  const status = await GradleStatusHelper.getStatus();
  t.is(status.status, 'operational');
});

test('isStatusOperational', async (t) => {
  nockGradle
    .get(STATUS_ENDPOINT)
    .query(IGNORE_QUERY_PARAMS)
    .reply(200, {
      status: { indicator: 'none', description: 'All Systems Operational' },
    });

  let operational = await GradleStatusHelper.isStatusOperational();
  t.true(operational);

  process.env.LOG_ERRORS = '0';

  nockGradle
    .get(STATUS_ENDPOINT)
    .query(IGNORE_QUERY_PARAMS)
    .replyWithError('Test error handling');

  operational = await GradleStatusHelper.isStatusOperational();
  t.false(operational);
});
