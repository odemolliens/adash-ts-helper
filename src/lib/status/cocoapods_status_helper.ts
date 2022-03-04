import { simpleLogger as logger } from '../debug';
import { NetworkHelper } from '../network';
import { iEquals } from '../utils/utils_helper';

export const BASE_URL = 'https://status.cocoapods.org/api/v2';
export const COMPONENTS_ENDPOINT = '/components.json';
export const PACKAGE_PUBLISHING_COMPONENT = 'CDN';
export const STATUS_OPERATIONAL = 'operational';

type ComponentStatus = {
  readonly name?: string;
  readonly status: string;
};

type ComponentsStatusResponse = {
  readonly data: {
    readonly components: readonly ComponentStatus[];
  };
};

/**
 * Calls the cocoapods status /components api
 * for more info check https://status.cocoapods.org/api#components
 */
const getComponentsStatus = async (): Promise<ComponentsStatusResponse> => {
  logger().debug('Retrive CocoaPods Status components');
  return await NetworkHelper.get(`${BASE_URL}${COMPONENTS_ENDPOINT}`);
};

/**
 * Retrieves the CDN API status,
 */
export const getCDNStatus = async () => {
  try {
    const { data } = await getComponentsStatus();
    logger().debug(data);
    logger().debug(`Find component ${PACKAGE_PUBLISHING_COMPONENT}`);
    return data.components.find((s) =>
      iEquals(s.name, PACKAGE_PUBLISHING_COMPONENT)
    );
  } catch (e) {
    logger().error(e);
    return { status: 'Cannot retrieve the status' };
  }
};

/**
 * Checks if CDN API status is operational
 */
export const isCDNOperational = async () => {
  logger().debug('Checks if CDN API status is operational');

  const package_publishing = await getCDNStatus();
  return iEquals(package_publishing.status, STATUS_OPERATIONAL);
};
