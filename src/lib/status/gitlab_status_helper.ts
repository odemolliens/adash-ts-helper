import * as cheerio from 'cheerio';

import { simpleLogger as logger } from '../debug';
import { NetworkHelper } from '../network';
import { iEquals } from '../utils/utils_helper';

export const BASE_URL = 'https://status.gitlab.com';

/**
 * Retrieves Gitlab status
 */
export const getStatus = async () => {
  logger().debug('Check Gitlab status');

  try {
    const { data } = await NetworkHelper.get(BASE_URL);
    const $ = cheerio.load(data);
    const status = $('#statusbar_text').text();
    return {
      status: iEquals(status, 'All Systems Operational')
        ? 'operational'
        : status,
    };
  } catch (e) {
    logger().error(e);
    return { status: 'Cannot retrieve the status' };
  }
};

/**
 * Checks if Gitlab status is operational
 */
export const isOperational = async () => {
  logger().debug('Check Gitlab status');

  try {
    const gitlabStatus = await getStatus();
    return iEquals(gitlabStatus.status, 'operational');
  } catch (e) {
    logger().error(e);
    return false;
  }
};
