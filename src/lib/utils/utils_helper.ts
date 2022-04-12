import { simpleLogger as defaultLogger } from '../debug';
import { ILogger } from '../debug/log_helper';

/**
 * Checks if 2 strings are equals (ignore case)
 *
 * @param str1
 * @param str2
 */
export const iEquals = (str1: string, str2: string) =>
  str1.toUpperCase() === str2.toUpperCase();

/**
 * Checks and logs the keys of the given object.
 * Throws an error in case of undefined values
 *
 * @param object
 */
export const requireAndLogsKeys = (
  object: Record<string, unknown>,
  logger?: ILogger
) => {
  // default to debug logger
  logger = logger || defaultLogger();

  // eslint-disable-next-line functional/no-loop-statement
  for (const v in object) {
    logger.debug(`${v}:`, object[v]);

    if (typeof object[v] === 'undefined') {
      // eslint-disable-next-line functional/no-throw-statement
      throw new Error(`${v} is not defined`);
    }
  }
};

export const getBool = (val: unknown = false) => {
  return !!JSON.parse(String(val).toLowerCase());
};
