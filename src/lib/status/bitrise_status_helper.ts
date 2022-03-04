import { simpleLogger as logger } from '../debug';
import { NetworkHelper } from '../network';
import { iEquals } from '../utils/utils_helper';

export const BASE_URL = 'https://status.bitrise.io/api/v2';
export const COMPONENTS_ENDPOINT = '/components.json';
export const BUILD_PROCESSING_COMPONENT = 'Build Processing';
export const STEP_ISSUE_COMPONENT = 'Step Issue';
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
 * Calls the Bitrise status /components api
 * for more info check https://status.bitrise.io/api#components
 */
const getComponentsStatus = async (): Promise<ComponentsStatusResponse> => {
  logger().debug('Retrive Bitrise Status components');
  return await NetworkHelper.get(`${BASE_URL}${COMPONENTS_ENDPOINT}`);
};

/**
 * Retrieves the Build Processing API status,
 */
export const getBuildProcessingStatus = async () => {
  try {
    const { data } = await getComponentsStatus();

    logger().debug(`Find component ${BUILD_PROCESSING_COMPONENT}`);
    return data.components.find((s) =>
      iEquals(s.name, BUILD_PROCESSING_COMPONENT)
    );
  } catch (e) {
    logger().error(e);
    return { status: 'Cannot retrieve the status' };
  }
};

/**
 * Checks if Build Processing API status is operational
 */
export const isBuildProcessingOperational = async () => {
  const build_processing = await getBuildProcessingStatus();

  logger().debug(`Check ${STATUS_OPERATIONAL} status`);
  return iEquals(build_processing.status, STATUS_OPERATIONAL);
};

/**
 * Retrieves the Step Issue API status,
 */
export const getStepIssueStatus = async () => {
  try {
    const { data } = await getComponentsStatus();

    logger().debug(`Find component ${BUILD_PROCESSING_COMPONENT}`);
    return data.components.find((s) => iEquals(s.name, STEP_ISSUE_COMPONENT));
  } catch (e) {
    logger().error(e);
    return { status: 'Cannot retrieve the status' };
  }
};

/**
 * Checks if Step Issue API status is operational
 */
export const isStepIssueOperational = async () => {
  const step_issue = await getStepIssueStatus();

  logger().debug(`Check ${STATUS_OPERATIONAL} status`);
  return iEquals(step_issue.status, STATUS_OPERATIONAL);
};
