import test from 'ava';
import nock from 'nock';

import { NPMStatusHelper } from './index';

const IGNORE_QUERY_PARAMS = true;

const nockNPM = nock('https://status.npmjs.org/api/v2');

test('getPackagePublishingStatus', async (t) => {
  nockNPM
    .get('/components.json')
    .query(IGNORE_QUERY_PARAMS)
    .reply(200, {
      components: [
        {
          name: 'Package publishing',
          status: 'operational',
        },
      ],
    });

  const package_publishing = await NPMStatusHelper.getPackagePublishingStatus();
  t.true(package_publishing.name.length > 0);
  t.true(package_publishing.status.length > 0);
});

test('isPackagePublishingOperational', async (t) => {
  nockNPM
    .get('/components.json')
    .query(IGNORE_QUERY_PARAMS)
    .reply(200, {
      components: [
        {
          name: 'Package publishing',
          status: 'operational',
        },
      ],
    });

  let operational = await NPMStatusHelper.isPackagePublishingOperational();
  t.true(operational);

  process.env.LOG_ERRORS = '0';
  nockNPM
    .get('/components.json')
    .query(IGNORE_QUERY_PARAMS)
    .replyWithError('Test error handling');

  operational = await NPMStatusHelper.isPackagePublishingOperational();
  t.false(operational);
});
