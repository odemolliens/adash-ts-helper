import test from 'ava';
import nock from 'nock';

import BitriseHelper, {
  ABORT_APP_BUILD_ENDPOINT,
  APP_BUILDS_ENDPOINT,
  BASE_URL,
  BUILDS_ENDPOINT,
} from './bitrise_helper';

const IGNORE_QUERY_PARAMS = true;

const nockBitrise = nock(BASE_URL);

const appSlug = 'slug1';

const bitriseHelperInstance = BitriseHelper({
  defaultHeaders: {
    authorization: `token BITRISE_API_ACCESS_TOKEN`,
  },
});

test('getBuilds', async (t) => {
  nockBitrise
    .get(APP_BUILDS_ENDPOINT(appSlug))
    .matchHeader(
      'authorization',
      bitriseHelperInstance.opts.defaultHeaders['authorization']
    )
    .query(IGNORE_QUERY_PARAMS)
    .reply(200, {
      data: [{ slug: 'slug1' }],
    });

  const builds = await bitriseHelperInstance.getBuildsByAppSlug(appSlug);
  t.is(builds.data.length, 1);
});

test('getBuildQueueSize', async (t) => {
  nockBitrise
    .get(BUILDS_ENDPOINT)
    .matchHeader(
      'authorization',
      bitriseHelperInstance.opts.defaultHeaders['authorization']
    )
    .query(IGNORE_QUERY_PARAMS)
    .reply(200, {
      data: [{ slug: 'slug1' }],
    });

  const queue_size = await bitriseHelperInstance.getBuildQueueSize();
  t.is(queue_size, 1);
});

test('getBuildQueueSizeByAppSlug', async (t) => {
  const appSlug = '049b16e2758f63c7';

  nockBitrise
    .get(APP_BUILDS_ENDPOINT(appSlug))
    .matchHeader(
      'authorization',
      bitriseHelperInstance.opts.defaultHeaders['authorization']
    )
    .query(IGNORE_QUERY_PARAMS)
    .reply(200, {
      data: [{ slug: 'slug1' }, { slug: 'slug2' }, { slug: 'slug3' }],
    });

  const queue_size = await bitriseHelperInstance.getBuildQueueSizeByAppSlug(
    appSlug
  );
  t.is(queue_size, 3);
});

test('cancelAppBuildBySlug', async (t) => {
  const appSlug = '049b16e2758f63c7';
  const buildSlug = 'slug1';

  nockBitrise
    .post(ABORT_APP_BUILD_ENDPOINT(appSlug, buildSlug))
    .matchHeader(
      'authorization',
      bitriseHelperInstance.opts.defaultHeaders['authorization']
    )
    .query(IGNORE_QUERY_PARAMS)
    .reply(200, {
      slug: 'slug1',
    });

  const data = await bitriseHelperInstance.cancelAppBuildBySlug(
    appSlug,
    buildSlug
  );
  t.is(data.slug, buildSlug);
});
