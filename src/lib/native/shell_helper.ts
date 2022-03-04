import { execSync } from 'child_process';

import { trim } from 'lodash';

import { ILogger } from '../debug/log_helper';

type ShellOpts = {
  readonly dryRun?: boolean;
  readonly logger?: ILogger;
};

const Shell = (opts?: ShellOpts) => {
  opts = { ...opts };

  const runCmd = (cmd: string) => {
    const { logger, dryRun } = opts;

    logger?.debug(cmd);
    const output = dryRun ? `dryRun ${cmd}` : execSync(cmd);

    logger?.info(trim(output.toString()));
    return output.toString();
  };

  return (stringArray: TemplateStringsArray, ...values: readonly string[]) => {
    // convert tag style arguments to 1 string
    const cmd = stringArray.reduce((acc, str, i) => {
      return values[i] ? acc + str + values[i] : acc + str;
    }, '');
    return runCmd(cmd);
  };
};

export default Shell;
