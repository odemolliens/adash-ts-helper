import { ILogger } from '../debug/log_helper';
import { NetworkHelper, NetworkUtils } from '../network';

export const BASE_URL = 'https://api.bitrise.io/v0.1';

export const BUILDS_ENDPOINT = `/builds`;

export const APP_BUILDS_ENDPOINT = (appSlug: string) =>
  `/apps/${appSlug}/builds`;

export const ABORT_APP_BUILD_ENDPOINT = (appSlug: string, buildSlug: string) =>
  `/apps/${appSlug}/builds/${buildSlug}/abort`;

export const ARTIFACTS_ENDPOINT = (appSlug: string, buildSlug: string) => `/apps/${appSlug}/builds/${buildSlug}/artifacts`

export const ARTIFACT_ENDPOINT = (appSlug: string, buildSlug: string, artifactSlug: string) => `/apps/${appSlug}/builds/${buildSlug}/artifacts/${artifactSlug}`

const STATUS_NOT_FINISHED = 0;

export type Build = {
  readonly slug: string;
  readonly status: number;
};

type BuildQueue = {
  readonly data: readonly Build[];
  readonly paging: { readonly total_item_count: number };
};

type BitriseHelperOpts = {
  readonly defaultHeaders?: Record<string, string>;
  readonly logger?: ILogger;
};

const BitriseHelper = (opts?: BitriseHelperOpts) => {
  const { logger, defaultHeaders } = opts;

  /**
   * Retrive Bitrise builds
   */
  async function getBuildsByAppSlug(
    appSlug: string,
    params?: Record<string, unknown>,
    headers?: Record<string, string>
  ): Promise<BuildQueue> {
    logger?.debug('Retrive Bitrise build queue');

    const { data } = await NetworkHelper.get(
      `${BASE_URL}${APP_BUILDS_ENDPOINT(appSlug)}`,
      {
        headers: {
          ...defaultHeaders,
          ...headers,
        },
        params,
      }
    );

    return data;
  }

  /**
   * Retrive Bitrise build queue
   */
  async function getBuildQueue(
    params?: Record<string, unknown>,
    headers?: Record<string, string>
  ): Promise<BuildQueue> {
    logger?.debug('Retrive Bitrise build queue');

    const { data } = await NetworkHelper.get(`${BASE_URL}${BUILDS_ENDPOINT}`, {
      headers: {
        ...defaultHeaders,
        ...headers,
      },
      params: { status: STATUS_NOT_FINISHED, ...params },
    });

    return data;
  }

  /**
   * Retrive Bitrise build queue size
   */
  async function getBuildQueueSize(
    params?: Record<string, unknown>,
    headers?: Record<string, string>
  ): Promise<number> {
    logger?.debug('Retrive Bitrise build queue size');

    const { data } = await getBuildQueue(params, headers);
    return data.length;
  }

  /**
   * Cancels App build
   */
  async function cancelAppBuildBySlug(
    appSlug: string,
    buildSlug: string,
    params?: Record<string, unknown>,
    headers?: Record<string, string>
  ) {
    logger?.debug(
      `Cancel Bitrise build for app slug: ${appSlug} and build slug: ${buildSlug}`
    );

    const payload = {
      abort_reason: 'Build cancelled. There is a new commit on the same branch',
      abort_with_success: false,
      skip_notifications: true,
      ...params,
    };

    const { data } = await NetworkHelper.post(
      `${BASE_URL}${ABORT_APP_BUILD_ENDPOINT(appSlug, buildSlug)}`,
      payload,
      {
        headers: {
          ...defaultHeaders,
          ...headers,
        },
      }
    );
    return data;
  }

  /**
   * Retrive Bitrise build queue for the given app slug
   *
   * @param appSlug
   */
  async function getBuildQueueByAppSlug(
    appSlug: string,
    params?: Record<string, unknown>,
    headers?: Record<string, string>
  ): Promise<readonly Build[]> {
    logger?.debug(`Retrive Bitrise build queue size for app slug ${appSlug}`);

    const { data } = await NetworkHelper.get(
      `${BASE_URL}${APP_BUILDS_ENDPOINT(appSlug)}`,
      {
        headers: {
          ...defaultHeaders,
          ...headers,
        },
        params: { ...params, status: STATUS_NOT_FINISHED },
      }
    );

    return data.data;
  }

  /**
   * Retrive Bitrise build queue size for the given app slug
   */
  async function getBuildQueueSizeByAppSlug(
    appSlug: string,
    params?: Record<string, unknown>,
    headers?: Record<string, string>
  ): Promise<number> {
    logger?.debug(`Retrive Bitrise build queue size for app slug ${appSlug}`);

    const data = await getBuildQueueByAppSlug(appSlug, params, headers);
    return data.length;
  }

  async function downloadBuildArtifactByName(appSlug: string, buildSlug: string, artifactName: string, downloadPath: string, params?: Record<string, unknown>,
    headers?: Record<string, string>) {

    logger?.debug(`Download Bitrise build artifact by name ${appSlug}/${buildSlug}/${artifactName}`);

    const { data } = await NetworkHelper.get(
      `${BASE_URL}${ARTIFACTS_ENDPOINT(appSlug, buildSlug)}`,
      {
        headers: {
          ...defaultHeaders,
          ...headers,
        },
        params: { ...params, status: STATUS_NOT_FINISHED },
      })

    logger?.debug(data)

    const artifactSlug = (data.data as Record<string, any>[]).find(artifact => artifact.title === artifactName)?.slug

    if (artifactSlug) {
      return downloadBuildArtifactBySlug(appSlug, buildSlug, artifactSlug, downloadPath)
    }

    throw new Error(`No artifact found for ${appSlug}/${buildSlug}/${artifactName}`)
  }

  async function downloadBuildArtifactBySlug(appSlug: string, buildSlug: string, artifactSlug: string, downloadPath: string, params?: Record<string, unknown>,
    headers?: Record<string, string>) {
    logger?.debug(`Download Bitrise build artifact by slug ${appSlug}/${buildSlug}/${artifactSlug}`);

    const { data } = await NetworkHelper.get(
      `${BASE_URL}${ARTIFACT_ENDPOINT(appSlug, buildSlug, artifactSlug)}`,
      {
        headers: {
          ...defaultHeaders,
          ...headers,
        },
        params: { ...params, status: STATUS_NOT_FINISHED },
      })

    if (data.data?.expiring_download_url) {
      await NetworkUtils.downloadFile(data.data?.expiring_download_url, downloadPath)
    }

    logger?.debug(`Saving artifact to  ${downloadPath}`);
  }

  return {
    getBuildQueue,
    getBuildQueueSize,
    getBuildsByAppSlug,
    getBuildQueueByAppSlug,
    getBuildQueueSizeByAppSlug,
    cancelAppBuildBySlug,
    downloadBuildArtifactByName,
    downloadBuildArtifactBySlug,
    opts,
  };
};

export default BitriseHelper;
