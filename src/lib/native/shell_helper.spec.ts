import test from 'ava';

import { shell } from '.';

test('runCmd', async (t) => {
  const shDryRun = shell({ dryRun: true });
  let output = shDryRun`pwd`;
  t.is(output, 'dryRun pwd');

  const sh = shell();
  const filename = __filename.split('/').pop();
  output = sh`basename ${filename}`;
  t.is(output.trimEnd(), filename);
});
