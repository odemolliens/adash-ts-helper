import test from 'ava';
import nock from 'nock';

import GitLabHelper, {
  BASE_URL,
  CANCEL_PROJECT_PIPELINE_ENDPOINT,
  PROJECT_ISSUES_ENDPOINT,
  PROJECT_JOBS_ENDPOINT,
  PROJECT_MR_ENDPOINT,
  PROJECT_NEW_ISSUE_ENDPOINT,
  PROJECT_PIPELINES_ENDPOINT,
} from './gitlab_helper';

const IGNORE_QUERY_PARAMS = true;
const nockGitlab = nock(BASE_URL);

const projectId = '1';

const gitlabHelperInstance = GitLabHelper({
  projectId,
  defaultHeaders: {
    'PRIVATE-TOKEN': 'GITLAB_TOKEN',
  },
});

test('getPipelineQueue', async (t) => {
  nockGitlab
    .get(PROJECT_PIPELINES_ENDPOINT(projectId))
    .matchHeader(
      'PRIVATE-TOKEN',
      gitlabHelperInstance.opts.defaultHeaders['PRIVATE-TOKEN']
    )
    .query(IGNORE_QUERY_PARAMS)
    .times(2)
    .reply(200, [
      {
        id: 47,
        project_id: 1,
        status: 'pending',
      },
      {
        id: 48,
        project_id: 1,
        status: 'running',
      },
    ]);

  const queue = await gitlabHelperInstance.getPipelineQueue();
  t.is(queue.length, 4);
});

test('getJobQueue', async (t) => {
  nockGitlab
    .get(PROJECT_JOBS_ENDPOINT(projectId))
    .matchHeader(
      'PRIVATE-TOKEN',
      gitlabHelperInstance.opts.defaultHeaders['PRIVATE-TOKEN']
    )
    .query(IGNORE_QUERY_PARAMS)
    .reply(200, [
      {
        id: 7,
        name: 'teaspoon',
        status: 'failed',
      },
      {
        id: 6,
        name: 'rspec:other',
        status: 'failed',
      },
    ]);

  const queue = await gitlabHelperInstance.getJobQueue();
  t.is(queue.length, 2);
});

test('getMergeRequests', async (t) => {
  nockGitlab
    .get(PROJECT_MR_ENDPOINT(projectId))
    .matchHeader(
      'PRIVATE-TOKEN',
      gitlabHelperInstance.opts.defaultHeaders['PRIVATE-TOKEN']
    )
    .query(IGNORE_QUERY_PARAMS)
    .reply(200, [
      {
        id: 1,
        title: 'foo1',
        state: 'opened',
      },
      {
        id: 2,
        title: 'foo2',
        status: 'open',
      },
      {
        id: 3,
        title: 'foo3',
        status: 'closed',
      },
    ]);

  const mr = await gitlabHelperInstance.getMergeRequests();
  t.is(mr.length, 3);
});

test('getMergeRequestsByProjectIdAndVersionAndTeam', async (t) => {
  const team = 'TEAM';
  const version = '5.25.0';

  nockGitlab
    .get(PROJECT_MR_ENDPOINT(projectId))
    .matchHeader(
      'PRIVATE-TOKEN',
      gitlabHelperInstance.opts.defaultHeaders['PRIVATE-TOKEN']
    )
    .query(IGNORE_QUERY_PARAMS)
    .reply(200, [
      {
        id: 1,
        title: 'TEAM - foo bar',
        status: 'opened',
        target_branch: 'develop/5.25.0',
        source_branch: 'feat/TEAM/5.25.0/add-something',
      },
      {
        id: 2,
        title: 'TEAM - foo bar',
        status: 'closed',
        target_branch: 'develop/5.24.0',
        source_branch: 'feat/TEAM/5.24.0/add-something',
      },
    ]);

  const mr = await gitlabHelperInstance.getMergeRequestsByVersionAndTeam(
    version,
    team
  );
  t.is(mr.length, 1);
});

test('cancelProjectPipelineById', async (t) => {
  const pipelineId = '12';

  nockGitlab
    .post(CANCEL_PROJECT_PIPELINE_ENDPOINT(projectId, pipelineId))
    .matchHeader(
      'PRIVATE-TOKEN',
      gitlabHelperInstance.opts.defaultHeaders['PRIVATE-TOKEN']
    )
    .query(IGNORE_QUERY_PARAMS)
    .reply(200, {
      id: pipelineId,
      project_id: projectId,
      status: 'canceled',
      sha: '1a91957a858320c0e17f3a0eca7cfacbff50ea29a',
    });

  const cancelled = await gitlabHelperInstance.cancelProjectPipelineById(
    pipelineId
  );
  t.is(cancelled.status, 'canceled');
});

test('listIssues', async (t) => {
  nockGitlab
    .get(PROJECT_ISSUES_ENDPOINT(projectId))
    .query(IGNORE_QUERY_PARAMS)
    .matchHeader(
      'PRIVATE-TOKEN',
      gitlabHelperInstance.opts.defaultHeaders['PRIVATE-TOKEN']
    )
    .reply(200, [
      {
        id: 1,
      },
      {
        id: 2,
      },
    ]);

  const { data } = await gitlabHelperInstance.listIssues();
  t.is(data.length, 2);
});

test('newIssueWithLabels', async (t) => {
  nockGitlab
    .post(PROJECT_NEW_ISSUE_ENDPOINT(projectId), {
      title: 'issue_title',
      labels: 'label1,label2',
      issue_type: 'incident',
    })
    .matchHeader(
      'PRIVATE-TOKEN',
      gitlabHelperInstance.opts.defaultHeaders['PRIVATE-TOKEN']
    )
    .reply(200, {
      id: 1,
    });

  const { data } = await gitlabHelperInstance.newIssueWithLabels(
    'issue_title',
    ['label1', 'label2'],
    { issue_type: 'incident' }
  );
  t.is(data.id, 1);
});
