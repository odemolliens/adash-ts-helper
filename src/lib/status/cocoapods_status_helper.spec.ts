import test from 'ava';
import nock from 'nock';

import {
  BASE_URL,
  COMPONENTS_ENDPOINT,
  PACKAGE_PUBLISHING_COMPONENT,
  STATUS_OPERATIONAL,
} from './cocoapods_status_helper';

import { CocoaPodsStatusHelper } from './index';

const IGNORE_QUERY_PARAMS = true;

const nockNPM = nock(BASE_URL);

test('getCDNStatus', async (t) => {
  nockNPM
    .get(COMPONENTS_ENDPOINT)
    .query(IGNORE_QUERY_PARAMS)
    .reply(200, {
      components: [
        {
          name: PACKAGE_PUBLISHING_COMPONENT,
          status: STATUS_OPERATIONAL,
        },
      ],
    });

  const package_publishing = await CocoaPodsStatusHelper.getCDNStatus();
  t.true(package_publishing.name.length > 0);
  t.true(package_publishing.status.length > 0);
});

test('isCDNOperational', async (t) => {
  nockNPM
    .get(COMPONENTS_ENDPOINT)
    .query(IGNORE_QUERY_PARAMS)
    .reply(200, {
      components: [
        {
          name: PACKAGE_PUBLISHING_COMPONENT,
          status: STATUS_OPERATIONAL,
        },
      ],
    });

  const operational = await CocoaPodsStatusHelper.isCDNOperational();
  t.true(operational);

  process.env.LOG_ERRORS = '0';
  nockNPM
    .get(COMPONENTS_ENDPOINT)
    .query(IGNORE_QUERY_PARAMS)
    .replyWithError('Test error handling');

  const notOperational = await CocoaPodsStatusHelper.isCDNOperational();
  t.false(notOperational);
});
