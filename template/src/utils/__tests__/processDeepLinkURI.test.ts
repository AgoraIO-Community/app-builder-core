import {processDeepLinkURI} from '../common';

describe('processDeepLinkURI', () => {
  const frontend = $config.FRONTEND_ENDPOINT.replace(/\/+$/, '');
  const path = '/meeting-id?source=invite';

  it('routes an HTTP app link for the configured HTTPS frontend', () => {
    const httpFrontend = frontend.replace(/^https:/, 'http:');
    expect(processDeepLinkURI(httpFrontend + path)).toBe(path);
  });

  it('preserves HTTPS meeting links and the native login callback', () => {
    expect(processDeepLinkURI(frontend + path)).toBe(path);
    expect(
      processDeepLinkURI(
        `${$config.PRODUCT_ID.toLowerCase()}://my-host/authorize?token=example`,
      ),
    ).toBe('/authorize?token=example');
  });

  it('preserves URLs from a different host', () => {
    const url = `${frontend}.example${path}`;
    expect(processDeepLinkURI(url)).toBe(url);
  });
});
