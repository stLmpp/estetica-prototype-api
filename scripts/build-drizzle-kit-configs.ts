import { glob } from 'glob';
import esbuild from 'esbuild';

const files = await glob('src/database/**/*-drizzle.config.ts');

await esbuild.build({
  entryPoints: files,
  outdir: 'migrations/dist',
  bundle: true,
  platform: 'node',
  target: 'node22',
  format: 'esm',
  packages: 'external',
});
