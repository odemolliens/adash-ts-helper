import { iEquals } from '../..';
import { simpleLogger as logger } from '../debug';
import { NetworkHelper } from '../network';

export const BASE_URL = 'https://status.browserstack.com/api/v2';
export const COMPONENTS_ENDPOINT = '/components.json';
export const LIVE_COMPONENT = 'Live';
export const AUTOMATE_COMPONENT = 'Automate';
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
 * Calls the BrowserStack status /components api
 * for more info check https://status.browserstack.com/api#components
 */
const getComponentsStatus = async (): Promise<ComponentsStatusResponse> => {
  logger().debug('Retrive BrowserStack Status components');
  return await NetworkHelper.get(`${BASE_URL}${COMPONENTS_ENDPOINT}`);
};

/**
 * Retrieves the Live API status,
 */
export const getLiveStatus = async () => {
  try {
    const { data } = await getComponentsStatus();

    logger().debug(`Find component ${LIVE_COMPONENT}`);
    return data.components.find((s) => iEquals(s.name, LIVE_COMPONENT));
  } catch (e) {
    logger().error(e);
    return { status: 'Cannot retrieve the status' };
  }
};

export const isLiveOperational = async () => {
  const live = await getLiveStatus();

  logger().debug(`Check ${STATUS_OPERATIONAL} status`);
  return iEquals(live.status, STATUS_OPERATIONAL);
};

/**
 * Retrieves the Automate API status,
 */
export const getAutomateStatus = async () => {
  try {
    const { data } = await getComponentsStatus();

    logger().debug(`Find component ${AUTOMATE_COMPONENT}`);
    return data.components.find((s) => iEquals(s.name, AUTOMATE_COMPONENT));
  } catch (e) {
    logger().error(e);
    return { status: 'Cannot retrieve the status' };
  }
};

export const isAutomateOperational = async () => {
  const automate = await getAutomateStatus();

  logger().debug(`Check ${STATUS_OPERATIONAL} status`);
  return iEquals(automate.status, STATUS_OPERATIONAL);
};
