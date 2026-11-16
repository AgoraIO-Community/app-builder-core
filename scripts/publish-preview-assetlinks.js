const {copyFileSync, mkdirSync} = require('node:fs');
const path = require('node:path');

const previewHost = 'app-builder-core-git-fix-android-deep-link-agoraio.vercel.app';
if (
  process.env.VERCEL_ENV === 'preview' &&
  process.env.VERCEL_BRANCH_URL === previewHost
) {
  const root = path.resolve(__dirname, '..');
  const output = path.join(root, 'template', 'dist', '.well-known');
  mkdirSync(output, {recursive: true});
  copyFileSync(
    path.join(root, 'docs', 'android-app-links', 'preview', 'assetlinks.json'),
    path.join(output, 'assetlinks.json'),
  );
}
