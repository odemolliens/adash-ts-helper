import test from 'ava';
import nock from 'nock';

import {
  AUTOMATE_COMPONENT,
  BASE_URL,
  COMPONENTS_ENDPOINT,
  LIVE_COMPONENT,
  STATUS_OPERATIONAL,
} from './browserstack_status_helper';

import { BrowserStackStatusHelper } from './index';

const IGNORE_QUERY_PARAMS = true;

const nockBrowserStack = nock(BASE_URL);

test('getLiveStatus', async (t) => {
  nockBrowserStack
    .get(COMPONENTS_ENDPOINT)
    .query(IGNORE_QUERY_PARAMS)
    .reply(200, {
      components: [
        {
          name: LIVE_COMPONENT,
          status: STATUS_OPERATIONAL,
        },
      ],
    });

  const live = await BrowserStackStatusHelper.getLiveStatus();
  t.true(live.name.length > 0);
  t.true(live.status.length > 0);
});

test('isBuildProcessingOperational', async (t) => {
  nockBrowserStack
    .get(COMPONENTS_ENDPOINT)
    .query(IGNORE_QUERY_PARAMS)
    .reply(200, {
      components: [
        {
          name: LIVE_COMPONENT,
          status: STATUS_OPERATIONAL,
        },
      ],
    });

  let operational = await BrowserStackStatusHelper.isLiveOperational();
  t.true(operational);

  process.env.LOG_ERRORS = '0';

  nockBrowserStack
    .get(COMPONENTS_ENDPOINT)
    .query(IGNORE_QUERY_PARAMS)
    .replyWithError('Test error handling');

  operational = await BrowserStackStatusHelper.isLiveOperational();
  t.false(operational);
});

test('getAutomateStatus', async (t) => {
  nockBrowserStack
    .get(COMPONENTS_ENDPOINT)
    .query(IGNORE_QUERY_PARAMS)
    .reply(200, {
      components: [
        {
          name: AUTOMATE_COMPONENT,
          status: STATUS_OPERATIONAL,
        },
      ],
    });

  const automate = await BrowserStackStatusHelper.getAutomateStatus();
  t.true(automate.name.length > 0);
  t.true(automate.status.length > 0);
});

test('isStepIssueOperational', async (t) => {
  nockBrowserStack
    .get(COMPONENTS_ENDPOINT)
    .query(IGNORE_QUERY_PARAMS)
    .reply(200, {
      components: [
        {
          name: AUTOMATE_COMPONENT,
          status: STATUS_OPERATIONAL,
        },
      ],
    });

  let operational = await BrowserStackStatusHelper.isAutomateOperational();
  t.true(operational);

  process.env.LOG_ERRORS = '0';

  nockBrowserStack
    .get(COMPONENTS_ENDPOINT)
    .query(IGNORE_QUERY_PARAMS)
    .replyWithError('Test error handling');

  operational = await BrowserStackStatusHelper.isAutomateOperational();
  t.false(operational);
});
