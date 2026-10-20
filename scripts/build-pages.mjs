import { copyFile, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { minify as minifyHtml } from 'html-minifier-terser';
import { minify as minifyJs } from 'terser';

const root = process.cwd();
const output = resolve(root, 'dist');
const excluded = new Set([
  '.git',
  '.github',
  '.vscode',
  'dist',
  'monochrome',
  'node_modules',
  'scripts',
  '.wrangler',
]);

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

async function copySite(sourceDirectory) {
  for (const entry of await readdir(sourceDirectory, { withFileTypes: true })) {
    const sourcePath = join(sourceDirectory, entry.name);
    const relativePath = relative(root, sourcePath);
    const destinationPath = join(output, relativePath);

    if (relativePath === entry.name && excluded.has(entry.name)) continue;
    if (extname(entry.name).toLowerCase() === '.map') continue;

    if (entry.isDirectory()) {
      await mkdir(destinationPath, { recursive: true });
      await copySite(sourcePath);
      continue;
    }

    await mkdir(dirname(destinationPath), { recursive: true });
    const extension = extname(entry.name).toLowerCase();

    if (extension === '.js') {
      const result = await minifyJs(await readFile(sourcePath, 'utf8'), {
        compress: true,
        mangle: true,
        format: { comments: /^!/ },
      });
      await writeFile(destinationPath, result.code ?? '');
    } else if (extension === '.html' && relativePath !== 'index.html') {
      const result = await minifyHtml(await readFile(sourcePath, 'utf8'), {
        collapseWhitespace: true,
        minifyCSS: true,
        minifyJS: {
          compress: true,
          mangle: true,
          format: { comments: /^!/ },
        },
      });
      await writeFile(destinationPath, result);
    } else {
      await copyFile(sourcePath, destinationPath);
    }
  }
}

await copySite(root);
console.log(`Cloudflare Pages output created at ${output}`);
