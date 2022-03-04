import { simpleLogger as logger } from '../debug';
import { NetworkHelper } from '../network';
import { iEquals } from '../utils/utils_helper';

export const BASE_URL = 'https://status.gradle.com/api/v2';
export const STATUS_ENDPOINT = '/status.json';
export const STATUS_OPERATIONAL = 'All Systems Operational';

type Status = {
  readonly name: string;
  readonly description: string;
};

type StatusResponse = {
  readonly data: {
    readonly status: Status;
  };
};

/**
 * Calls the Gradle /status api
 * for more info check https://status.gradle.com/api#status
 */
const getProviderStatus = async (): Promise<StatusResponse> => {
  logger().debug('Retrive Gradle Status');
  return await NetworkHelper.get(`${BASE_URL}${STATUS_ENDPOINT}`);
};

export const getStatus = async () => {
  logger().debug('Retrive Gradle Status');

  try {
    const { data } = await getProviderStatus();
    const status = data.status.description;
    return {
      status: iEquals(data.status.description, STATUS_OPERATIONAL)
        ? 'operational'
        : status,
    };
  } catch (e) {
    logger().error(e);
    return { status: 'Cannot retrieve the status' };
  }
};

/**
 * Checks if Status is operational
 */
export const isStatusOperational = async () => {
  try {
    const { status } = await getStatus();

    logger().debug(`Check ${STATUS_OPERATIONAL} status`);
    return status === 'operational';
  } catch (e) {
    logger().error(e);
    return false;
  }
};
