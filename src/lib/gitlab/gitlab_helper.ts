import { ILogger } from '../debug/log_helper';
import { NetworkHelper } from '../network';

export const BASE_URL = 'https://gitlab.com/api/v4';
export const PROJECT_PIPELINES_ENDPOINT = (projectId: string) =>
  `/projects/${projectId}/pipelines`;
export const PROJECT_PIPELINE_SCHEDULES_ENDPOINT = (projectId: string) =>
  `/projects/${projectId}/pipeline_schedules`;
export const CANCEL_PROJECT_PIPELINE_ENDPOINT = (
  projectId: string,
  pipelineId: string
) => `/projects/${projectId}/pipelines/${pipelineId}/cancel`;
export const PROJECT_JOBS_ENDPOINT = (projectId: string) =>
  `/projects/${projectId}/jobs`;
export const PROJECT_MR_ENDPOINT = (projectId: string) =>
  `/projects/${projectId}/merge_requests`;
export const PROJECT_NEW_ISSUE_ENDPOINT = (projectId: string) =>
  `/projects/${projectId}/issues`;
export const PROJECT_ISSUES_ENDPOINT = (projectId: string) =>
  `/projects/${projectId}/issues`;

const SCOPE_NOT_FINISHED = ['running', 'pending'];
const STATUS_RUNNING = 'running';
const STATUS_PENDING = 'pending';
export const MERGE_REQUEST_STATE_OPENED = 'opened';
export const MERGE_REQUEST_STATE_CLOSED = 'closed';

export type Pipeline = {
  readonly id: string;
  readonly sha: string;
};

export type PipelineSchedule = {
  readonly id: string;
};

export type Job = {};

export type MergeRequest = {
  readonly target_branch: string;
  readonly source_branch: string;
};

export type IGitLabHelper = {
  readonly getPipelineQueue;
  readonly getPipelines;
  readonly getPipelineSchedules;
  readonly cancelProjectPipelineById;
  readonly getMergeRequests;
  readonly getMergeRequestsByVersionAndTeam;
  readonly getJobQueue;
  readonly listIssues;
  readonly newIssueWithLabels;
  readonly opts;
};

type GitLabHelperOpts = {
  readonly projectId: string;
  readonly defaultHeaders?: Record<string, string>;
  readonly logger?: ILogger;
};

const GitLabHelper = (opts: GitLabHelperOpts) => {
  const { projectId, defaultHeaders, logger } = opts;

  /**
   * Retrieves project pipelines
   */
  async function getPipelines(
    params?: Record<string, unknown>,
    headers?: Record<string, string>
  ): Promise<readonly Pipeline[]> {
    logger?.debug(
      `Retrive Gitlab pipeline queue for projectId: ${projectId} with params:`,
      params
    );

    const { data } = await NetworkHelper.get(
      `${BASE_URL}${PROJECT_PIPELINES_ENDPOINT(projectId)}`,
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
   * Retrieves project pipelines in state `pending` or `running`
   */
  async function getPipelineQueue(
    params?: Record<string, unknown>,
    headers?: Record<string, string>
  ) {
    logger?.debug(
      `Retrive Gitlab pipeline queue size for projectId: ${projectId}`
    );

    const queues = await Promise.all([
      getPipelines(
        { ...params, status: STATUS_RUNNING },
        {
          ...defaultHeaders,
          ...headers,
        }
      ),

      getPipelines(
        { ...params, status: STATUS_PENDING },
        {
          ...defaultHeaders,
          ...headers,
        }
      ),
    ]);

    return queues.flat();
  }

  /**
   * Retrieves project pipeline schedules
   */
  async function getPipelineSchedules(
    params?: Record<string, unknown>,
    headers?: Record<string, string>
  ): Promise<readonly PipelineSchedule[]> {
    logger?.debug(
      `Retrive Gitlab pipeline schedules for projectId: ${projectId} with params:`,
      params
    );

    const { data } = await NetworkHelper.get(
      `${BASE_URL}${PROJECT_PIPELINE_SCHEDULES_ENDPOINT(projectId)}`,
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
   * Cancels project pipeline
   */
  async function cancelProjectPipelineById(
    pipelineId: string,
    params?: Record<string, unknown>,
    headers?: Record<string, string>
  ) {
    logger?.debug(
      `Cancel Gitlab pipeline for projectId: ${projectId} and pipelineId ${pipelineId}`
    );

    const NO_PAYLOAD = {};

    const { data } = await NetworkHelper.post(
      `${BASE_URL}${CANCEL_PROJECT_PIPELINE_ENDPOINT(projectId, pipelineId)}`,
      NO_PAYLOAD,
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
   * Retrieves project jobs
   */
  async function getJobQueue(
    params?: Record<string, unknown>,
    headers?: Record<string, string>
  ) {
    logger?.debug(`Retrive Gitlab job queue for projectId: ${projectId}`);

    const { data } = await NetworkHelper.get<readonly Job[]>(
      `${BASE_URL}${PROJECT_JOBS_ENDPOINT(projectId)}`,
      {
        headers: {
          ...defaultHeaders,
          ...headers,
        },
        params: { scope: SCOPE_NOT_FINISHED, ...params },
      }
    );

    return data;
  }

  /**
   * Retrieves project merge requests
   */
  async function getMergeRequests(
    params?: Record<string, unknown>,
    headers?: Record<string, string>
  ) {
    logger?.debug(
      `Retrive Gitlab Merge Requests for projectId: ${projectId} with params:`,
      params
    );

    const { data } = await NetworkHelper.get<readonly MergeRequest[]>(
      `${BASE_URL}${PROJECT_MR_ENDPOINT(projectId)}`,
      {
        headers: {
          ...defaultHeaders,
          ...headers,
        },
        params: { per_page: 100, ...params },
      }
    );
    return data;
  }

  /**
   * Retrieves project merge requests for a specific app version and team (ex: SYST, BUPA...)
   */
  async function getMergeRequestsByVersionAndTeam(
    version: string,
    team: string,
    params?: Record<string, unknown>,
    headers?: Record<string, string>
  ) {
    logger?.debug(
      `Retrive Gitlab Merge Requests for projectId: ${projectId}, team: ${team}, version: ${version} with params:`,
      params
    );

    const searchParams = {
      ...params,
      search: team,
      in: 'title',
    };

    return await getMergeRequestsByVersion(version, searchParams, headers);
  }

  /**
   * Retrieves project merge requests for a specific app version
   */
  async function getMergeRequestsByVersion(
    version: string,
    params?: Record<string, unknown>,
    headers?: Record<string, string>
  ) {
    logger?.debug(
      `Retrive Gitlab Merge Requests for projectId: ${projectId}, version: ${version} with params:`,
      params
    );

    const data = await getMergeRequests(params, headers);
    const match_version = data.filter((mr) => {
      return (
        mr.target_branch.includes(version) && mr.source_branch.includes(version)
      );
    });

    return match_version;
  }

  async function listIssues(
    params?: Record<string, unknown>,
    headers?: Record<string, string>
  ) {
    logger?.debug(`List issues: ${projectId}`, params);

    return await NetworkHelper.get(
      `${BASE_URL}${PROJECT_ISSUES_ENDPOINT(projectId)}`,
      {
        headers: {
          ...defaultHeaders,
          ...headers,
        },
        params,
      }
    );
  }

  async function newIssueWithLabels(
    title: string,
    labels: readonly string[],
    payload?: Record<string, unknown>,
    params?: Record<string, unknown>,
    headers?: Record<string, string>
  ) {
    logger?.debug(
      `Create new issue: ${projectId}, title: ${title}, labels: ${labels}`
    );

    return await NetworkHelper.post(
      `${BASE_URL}${PROJECT_NEW_ISSUE_ENDPOINT(projectId)}`,
      {
        title,
        labels: labels.join(','),
        ...payload,
      },
      {
        headers: {
          ...defaultHeaders,
          ...headers,
        },
        params,
      }
    );
  }

  return {
    getPipelineQueue,
    getPipelines,
    getPipelineSchedules,
    cancelProjectPipelineById,
    getMergeRequests,
    getMergeRequestsByVersionAndTeam,
    getJobQueue,
    listIssues,
    newIssueWithLabels,
    opts,
  };
};

export default GitLabHelper;
