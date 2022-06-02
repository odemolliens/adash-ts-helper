import test from 'ava';
import nock from 'nock';
import { simpleLogger } from '../debug';
import fs from 'fs'
import BitriseHelper, {
  ABORT_APP_BUILD_ENDPOINT,
  APP_BUILDS_ENDPOINT,
  ARTIFACTS_ENDPOINT,
  ARTIFACT_ENDPOINT,
  BASE_URL,
  BUILDS_ENDPOINT,
} from './bitrise_helper';
import { FileHelper } from '../native';

const IGNORE_QUERY_PARAMS = true;

const nockBitrise = nock(BASE_URL);
const nockDownload = nock('http://download.file/')

const appSlug = 'slug1';

const bitriseHelperInstance = BitriseHelper({
  logger: simpleLogger(),
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

test('downloadBuildArtifactByName', async (t) => {
  const appSlug = '049b16e2758f63c7';
  const buildSlug = 'slug1';
  const artifactName = 'quality_report.json'
  const artifactPath = `/tmp/test_artifact.json`
  const downloadPath = `/tmp/download_artifact_${Date.now()}.json`;

  nockBitrise
    .get(ARTIFACTS_ENDPOINT(appSlug, buildSlug))
    .matchHeader(
      'authorization',
      bitriseHelperInstance.opts.defaultHeaders['authorization']
    )
    .query(IGNORE_QUERY_PARAMS)
    .reply(200, {
      data: [{ title: artifactName, slug: 'slug' + artifactName }],
    });

  nockBitrise
    .get(ARTIFACT_ENDPOINT(appSlug, buildSlug, 'slug' + artifactName))
    .matchHeader(
      'authorization',
      bitriseHelperInstance.opts.defaultHeaders['authorization']
    )
    .query(IGNORE_QUERY_PARAMS)
    .reply(200, {
      data: { expiring_download_url: `http://download.file/${artifactName}` },
    });

  await FileHelper.writeFile('test data', artifactPath)

  nockDownload.get(`/${artifactName}`).replyWithFile(200, artifactPath)

  await bitriseHelperInstance.downloadBuildArtifactByName(
    appSlug,
    buildSlug, artifactName, downloadPath
  );

  t.true(fs.existsSync(downloadPath));
});

test('downloadBuildArtifactByName no artifact for name', async (t) => {
  const appSlug = '049b16e2758f63c7';
  const buildSlug = 'slug1';
  const artifactName = 'quality_report.json'
  const artifactPath = `/tmp/test_artifact.json`
  const downloadPath = `/tmp/download_artifact_${Date.now()}.json`;

  nockBitrise
    .get(ARTIFACTS_ENDPOINT(appSlug, buildSlug))
    .matchHeader(
      'authorization',
      bitriseHelperInstance.opts.defaultHeaders['authorization']
    )
    .query(IGNORE_QUERY_PARAMS)
    .reply(200, {
      data: [{ title: artifactName, slug: 'slug' + artifactName }],
    });

  nockBitrise
    .get(ARTIFACT_ENDPOINT(appSlug, buildSlug, 'slug' + artifactName))
    .matchHeader(
      'authorization',
      bitriseHelperInstance.opts.defaultHeaders['authorization']
    )
    .query(IGNORE_QUERY_PARAMS)
    .reply(200, {
      data: { expiring_download_url: `http://download.file/${artifactName}` },
    });

  await FileHelper.writeFile('test data', artifactPath)

  nockDownload.get(`/${artifactName}`).replyWithFile(200, artifactPath)

  const error = await t.throwsAsync(async () => {
    await bitriseHelperInstance.downloadBuildArtifactByName(
      appSlug,
      buildSlug, 'NOT EXISTS', downloadPath
    );
  })

  t.is(error.message, 'No artifact found for 049b16e2758f63c7/slug1/NOT EXISTS')
  t.false(fs.existsSync(downloadPath));
});