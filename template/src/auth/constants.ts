const BACKEND_URL = $config.BACKEND_ENDPOINT;
const VERCEL_URL =
  'https://app-builder-core-git-api-managed-service-backend-agoraio.vercel.app';
const AUTH_ENDPOINT_URL = `${$config.BACKEND_ENDPOINT}/idp/login`;
const AUTH_REDIRECT_URL = `${VERCEL_URL}/authorize`;

export {BACKEND_URL, VERCEL_URL, AUTH_ENDPOINT_URL, AUTH_REDIRECT_URL};
