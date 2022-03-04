import test from 'ava';
import nock from 'nock';

import { BASE_URL } from './gitlab_status_helper';

import { GitlabStatusHelper } from './index';

const nockGitlabStatus = nock(BASE_URL);

test('isOperational true', async (t) => {
  nockGitlabStatus
    .get('/')
    .reply(200, '<strong id="statusbar_text">All Systems Operational</strong>');
  const gitlab_operational = await GitlabStatusHelper.isOperational();
  t.true(gitlab_operational);
});

test('isOperational false', async (t) => {
  process.env.LOG_ERRORS = '0';

  nockGitlabStatus.get('/').replyWithError('Test error handling');
  const gitlab_not_operational = await GitlabStatusHelper.isOperational();
  t.false(gitlab_not_operational);
});
