import test from 'ava';
import nock from 'nock';

import CodeMagicHelper, {
  APP_ENDPOINT,
  APPS_ENDPOINT,
  BASE_URL,
  BUILD_STATUS_ENDPOINT,
  BUILDS_ENDPOINT,
} from './codemagic_helper';

const IGNORE_QUERY_PARAMS = true;

const nockCodeMagic = nock(BASE_URL);

const codeMagicHelperInstance = CodeMagicHelper({
  defaultHeaders: { 'x-auth-token': 'codeMagicUserToken' },
});

test('getApplications', async (t) => {
  nockCodeMagic
    .get(APPS_ENDPOINT)
    .matchHeader(
      'x-auth-token',
      codeMagicHelperInstance.opts.defaultHeaders['x-auth-token']
    )

    .query(IGNORE_QUERY_PARAMS)
    .reply(200, { applications: [{ id: 1 }, { id: 2 }] });

  const { applications } = await codeMagicHelperInstance.getApplications();
  t.is(applications.length, 2);
});

test('getApplication', async (t) => {
  const appId = 'appId';

  nockCodeMagic
    .get(APP_ENDPOINT(appId))
    .matchHeader(
      'x-auth-token',
      codeMagicHelperInstance.opts.defaultHeaders['x-auth-token']
    )

    .query(IGNORE_QUERY_PARAMS)
    .reply(200, { application: { id: appId } });

  const { application } = await codeMagicHelperInstance.getApplication(appId);
  t.is(application.id, appId);
});

test('getBuilds', async (t) => {
  nockCodeMagic
    .get(BUILDS_ENDPOINT)
    .matchHeader(
      'x-auth-token',
      codeMagicHelperInstance.opts.defaultHeaders['x-auth-token']
    )

    .query(IGNORE_QUERY_PARAMS)
    .reply(200, { builds: [{ id: 1 }, { id: 2 }] });

  const { builds } = await codeMagicHelperInstance.getBuilds();
  t.is(builds.length, 2);
});

test('getBuildStatus', async (t) => {
  const buildId = 'buildId';
  nockCodeMagic
    .get(BUILD_STATUS_ENDPOINT(buildId))
    .matchHeader(
      'x-auth-token',
      codeMagicHelperInstance.opts.defaultHeaders['x-auth-token']
    )

    .query(IGNORE_QUERY_PARAMS)
    .reply(200, { build: { id: buildId } });

  const { build } = await codeMagicHelperInstance.getBuildStatus(buildId);
  t.is(build.id, buildId);
});
