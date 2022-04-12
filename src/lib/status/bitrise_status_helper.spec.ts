import test from 'ava';
import nock from 'nock';

import {
  BASE_URL,
  BUILD_PROCESSING_COMPONENT,
  COMPONENTS_ENDPOINT,
  STATUS_OPERATIONAL,
  STEP_ISSUE_COMPONENT,
} from './bitrise_status_helper';

import { BitriseStatusHelper } from './index';

const IGNORE_QUERY_PARAMS = true;

const nockBitrise = nock(BASE_URL);

test('getBuildProcessingStatus', async (t) => {
  nockBitrise
    .get(COMPONENTS_ENDPOINT)
    .query(IGNORE_QUERY_PARAMS)
    .reply(200, {
      components: [
        {
          name: BUILD_PROCESSING_COMPONENT,
          status: STATUS_OPERATIONAL,
        },
      ],
    });

  const build_processing = await BitriseStatusHelper.getBuildProcessingStatus();
  t.true(build_processing.name.length > 0);
  t.true(build_processing.status.length > 0);
});

test('isBuildProcessingOperational', async (t) => {
  nockBitrise
    .get(COMPONENTS_ENDPOINT)
    .query(IGNORE_QUERY_PARAMS)
    .reply(200, {
      components: [
        {
          name: BUILD_PROCESSING_COMPONENT,
          status: STATUS_OPERATIONAL,
        },
      ],
    });

  const operational = await BitriseStatusHelper.isBuildProcessingOperational();
  t.true(operational);

  process.env.LOG_ERRORS = '0';

  nockBitrise
    .get(COMPONENTS_ENDPOINT)
    .query(IGNORE_QUERY_PARAMS)
    .replyWithError('Test error handling');

  const notOperational =
    await BitriseStatusHelper.isBuildProcessingOperational();
  t.false(notOperational);
});

test('getStepIssueStatus', async (t) => {
  nockBitrise
    .get(COMPONENTS_ENDPOINT)
    .query(IGNORE_QUERY_PARAMS)
    .reply(200, {
      components: [
        {
          name: STEP_ISSUE_COMPONENT,
          status: STATUS_OPERATIONAL,
        },
      ],
    });

  const step_issue = await BitriseStatusHelper.getStepIssueStatus();
  t.true(step_issue.name.length > 0);
  t.true(step_issue.status.length > 0);
});

test('isStepIssueOperational', async (t) => {
  nockBitrise
    .get(COMPONENTS_ENDPOINT)
    .query(IGNORE_QUERY_PARAMS)
    .reply(200, {
      components: [
        {
          name: STEP_ISSUE_COMPONENT,
          status: STATUS_OPERATIONAL,
        },
      ],
    });

  let operational = await BitriseStatusHelper.isStepIssueOperational();
  t.true(operational);

  process.env.LOG_ERRORS = '0';

  nockBitrise
    .get(COMPONENTS_ENDPOINT)
    .query(IGNORE_QUERY_PARAMS)
    .replyWithError('Test error handling');

  operational = await BitriseStatusHelper.isStepIssueOperational();
  t.false(operational);
});
