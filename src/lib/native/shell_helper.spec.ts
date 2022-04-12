import test from 'ava';

import { shell } from '.';

test('runCmd', async (t) => {
  const shDryRun = shell({ dryRun: true });
  const pwd = shDryRun`pwd`;
  t.is(pwd, 'dryRun pwd');

  const sh = shell();
  const filename = __filename.split('/').pop();
  const basename = sh`basename ${filename}`;
  t.is(basename.trimEnd(), filename);
});
