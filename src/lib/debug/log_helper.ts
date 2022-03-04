import 'colors';
import { getBool } from '../utils/utils_helper';

export type ILogger = {
  readonly info: (log: unknown, ...rest: readonly unknown[]) => void;
  readonly debug: (log: unknown, ...rest: readonly unknown[]) => void;
  readonly error: (log: unknown, ...rest: readonly unknown[]) => void;
};

type SimpleLoggerOpts = {
  readonly showInfo?: boolean;
  readonly showDebug?: boolean;
  readonly showError?: boolean;
};

const SimpleLogger = (opts?: SimpleLoggerOpts): ILogger => {
  opts = {
    showInfo: getBool(process.env.LOG_INFO || true),
    showDebug: Boolean(process.env.DEBUG || process.env.LOG_DEBUG),
    showError: getBool(process.env.LOG_ERRORS || true),
    ...opts,
  };

  return {
    // eslint-disable-next-line functional/functional-parameters
    info(log: unknown, ...rest: readonly unknown[]) {
      if (opts.showInfo) {
        console.info('ℹ️:', log, ...rest);
      }
    },

    // eslint-disable-next-line functional/functional-parameters
    debug(log: unknown, ...rest: readonly unknown[]) {
      if (opts.showDebug) {
        console.debug('🔧:', log, ...rest);
      }
    },

    // eslint-disable-next-line functional/functional-parameters
    error(log: unknown, ...rest: readonly unknown[]) {
      if (opts.showError) {
        console.error('🚨:', log, ...rest);
      }
    },
  };
};

export default SimpleLogger;
