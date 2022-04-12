import { ILogger } from '../debug/log_helper';
import { NetworkHelper } from '../network';

export const BASE_URL = 'https://api.codemagic.io';
export const APPS_ENDPOINT = `/apps`;
export const APP_ENDPOINT = (appId: string) => `/apps/${appId}`;
export const BUILD_STATUS_ENDPOINT = (buildId: string) => `/builds/${buildId}`;

export const BUILDS_ENDPOINT = `/builds`;

export type Build = {
  readonly slug: string;
  readonly status: number;
};

type CodeMagicHelperOpts = {
  readonly defaultHeaders?: Record<string, string>;
  readonly logger?: ILogger;
};

const CodeMagicHelper = (opts?: CodeMagicHelperOpts) => {
  const { logger, defaultHeaders } = opts;

  async function getApplications(
    params?: Record<string, unknown>,
    headers?: Record<string, string>
  ) {
    logger?.debug('Retrive CodeMagic applications');

    const { data } = await NetworkHelper.get(`${BASE_URL}${APPS_ENDPOINT}`, {
      headers: {
        ...defaultHeaders,
        ...headers,
      },
      params: { ...params },
    });

    return data;
  }

  async function getApplication(
    appId: string,
    params?: Record<string, unknown>,
    headers?: Record<string, string>
  ) {
    logger?.debug('Retrive CodeMagic application');

    const { data } = await NetworkHelper.get(
      `${BASE_URL}${APP_ENDPOINT(appId)}`,
      {
        headers: {
          ...defaultHeaders,
          ...headers,
        },
        params: { ...params },
      }
    );

    return data;
  }

  async function getBuilds(
    params?: Record<string, unknown>,
    headers?: Record<string, string>
  ) {
    logger?.debug('Retrive CodeMagic build queue');

    const { data } = await NetworkHelper.get(`${BASE_URL}${BUILDS_ENDPOINT}`, {
      headers: {
        ...defaultHeaders,
        ...headers,
      },
      params: { ...params },
    });

    return data;
  }

  async function getBuildStatus(
    buildId: string,
    params?: Record<string, unknown>,
    headers?: Record<string, string>
  ) {
    logger?.debug('Retrive CodeMagic build queue');

    const { data } = await NetworkHelper.get(
      `${BASE_URL}${BUILD_STATUS_ENDPOINT(buildId)}`,
      {
        headers: {
          ...defaultHeaders,
          ...headers,
        },
        params: { ...params },
      }
    );

    return data;
  }

  return {
    opts,
    getApplications,
    getApplication,
    getBuilds,
    getBuildStatus,
  };
};

export default CodeMagicHelper;
