import { ILogger } from '../debug/log_helper';
import { NetworkHelper } from '../network';

export const BASE_URL = 'https://api.browserstack.com';
export const BUILDS_ENDPOINT = '/app-automate/builds.json';

export type Build = {
  readonly automation_build: {
    readonly name: string;
    readonly status: number;
    readonly hashed_id: string;
    readonly duration: number;
  };
};

type BrowserStackHelperOpts = {
  readonly defaultHeaders?: Record<string, string>;
  readonly auth: {
    readonly username: string;
    readonly password: string;
  };
  readonly logger?: ILogger;
};

const BrowserStackHelper = (opts?: BrowserStackHelperOpts) => {
  const { logger, defaultHeaders, auth } = opts;

  async function getBuilds(
    params?: Record<string, unknown>,
    headers?: Record<string, string>
  ) {
    logger?.debug('Retrive Browserstack Build list');

    const { data } = await NetworkHelper.get<readonly Build[]>(
      `${BASE_URL}${BUILDS_ENDPOINT}?limit=100`,
      {
        params,
        auth,
        headers: {
          ...defaultHeaders,
          ...headers,
        },
      }
    );

    return data;
  }

  return {
    getBuilds,
    opts,
  };
};

export default BrowserStackHelper;
