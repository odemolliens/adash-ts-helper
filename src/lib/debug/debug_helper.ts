import { NetworkHelper } from '../network';

import { simpleLogger } from './';

export const activateDebugNetwork = () => {
  const logDebug = simpleLogger({ showDebug: true });

  NetworkHelper.interceptors.request.use(
    (config) => {
      logDebug.debug(
        `Request ${config.method.toUpperCase()} ${config.url}\n`,
        JSON.stringify(config)
      );
      return config;
    },
    (error) => {
      logDebug.error(
        `Request error ${error.config.method.toUpperCase()} ${
          error.config.url
        }:\n`,
        JSON.stringify(error)
      );
      return Promise.reject(error);
    }
  );

  NetworkHelper.interceptors.response.use(
    (response) => {
      logDebug.debug(
        `Response ${response.config.method.toUpperCase()} ${
          response.config.url
        }:\n`,
        JSON.stringify(response.data)
      );
      return response;
    },
    (error) => {
      logDebug.error(
        `Response error ${error.config.method.toUpperCase()} ${
          error.config.url
        }:\n`,
        JSON.stringify(error)
      );
      return Promise.reject(error);
    }
  );
};
