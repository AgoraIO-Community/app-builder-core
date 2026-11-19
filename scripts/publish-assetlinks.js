const {copyFileSync, mkdirSync, writeFileSync} = require('node:fs');
const path = require('node:path');

const configuredAssociation = process.env.APPBUILDER_ANDROID_ASSET_LINKS_JSON;
const gitPreview = process.env.VERCEL_ENV === 'preview' && process.env.VERCEL_BRANCH_URL;

if (configuredAssociation || gitPreview) {
  const root = path.resolve(__dirname, '..');
  const output = path.join(root, 'template', 'dist', '.well-known');
  const destination = path.join(output, 'assetlinks.json');
  mkdirSync(output, {recursive: true});

  if (configuredAssociation) {
    const statements = JSON.parse(configuredAssociation);
    if (!Array.isArray(statements)) {
      throw new Error('APPBUILDER_ANDROID_ASSET_LINKS_JSON must be a JSON array.');
    }
    writeFileSync(destination, JSON.stringify(statements, null, 2) + '\n');
  } else {
    copyFileSync(
      path.join(root, 'docs', 'android-app-links', 'preview', 'assetlinks.json'),
      destination,
    );
  }
}
