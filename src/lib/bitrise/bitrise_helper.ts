import { ILogger } from '../debug/log_helper';
import { NetworkHelper } from '../network';

export const BASE_URL = 'https://api.bitrise.io/v0.1';
export const BUILDS_ENDPOINT = `/builds`;
export const APP_BUILDS_ENDPOINT = (appSlug: string) =>
  `/apps/${appSlug}/builds`;
export const ABORT_APP_BUILD_ENDPOINT = (appSlug: string, buildSlug: string) =>
  `/apps/${appSlug}/builds/${buildSlug}/abort`;

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

  return {
    getBuildQueue,
    getBuildQueueSize,
    getBuildsByAppSlug,
    getBuildQueueByAppSlug,
    getBuildQueueSizeByAppSlug,
    cancelAppBuildBySlug,
    opts,
  };
};

export default BitriseHelper;
