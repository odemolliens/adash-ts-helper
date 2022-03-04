import { simpleLogger as logger } from '../debug';
import { NetworkHelper } from '../network';
import { iEquals } from '../utils/utils_helper';

const COMPONENTS_ENDPOINT = 'https://status.npmjs.org/api/v2/components.json';
const PACKAGE_PUBLISHING_COMPONENT = 'Package publishing';
const STATUS_OPERATIONAL = 'operational';

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
 * Calls the npm status /components api
 * for more info check https://status.npmjs.org/api#components
 */
const getComponentsStatus = async (): Promise<ComponentsStatusResponse> => {
  logger().debug('Retrive NPM Status components');
  return await NetworkHelper.get(COMPONENTS_ENDPOINT);
};

/**
 * Retrieves the Publish Packaging API status,
 */
export const getPackagePublishingStatus = async () => {
  try {
    const { data } = await getComponentsStatus();

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
 * Checks if Publish Packaging API status is operational
 */
export const isPackagePublishingOperational = async () => {
  logger().debug('Checks if Publish Packaging API status is operational');

  const package_publishing = await getPackagePublishingStatus();
  return iEquals(package_publishing.status, STATUS_OPERATIONAL);
};
