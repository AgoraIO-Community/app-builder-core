/*
********************************************
 Copyright © 2021 Agora Lab, Inc., all rights reserved.
 AppBuilder and all associated components, source code, APIs, services, and documentation 
 (the “Materials”) are owned by Agora Lab, Inc. and its licensors. The Materials may not be 
 accessed, used, modified, or distributed for any purpose without a license from Agora Lab, Inc.  
 Use without a license or in violation of any license terms and conditions (including use for 
 any purpose competitive to Agora Lab, Inc.’s business) is strictly prohibited. For more 
 information visit https://appbuilder.agora.io. 
*********************************************
*/
const isSafariBrowser = () => {
  if (!('userAgent' in navigator)) {
    console.warn('unable to detect browser');
    return false;
  }

  const userAgentString = navigator.userAgent;
  // Detect Chrome
  const chromeAgent = userAgentString.indexOf('Chrome') > -1;
  // Detect Safari
  const safariAgent = userAgentString.indexOf('Safari') > -1;

  // One additional check is required in the case of the Safari browser
  // as the user-agent of the Chrome browser also includes the Safari browser’s user-agent.
  // If both the user-agents of Chrome and Safari are in the user-agent,
  // it means that the browser is Chrome, and hence the Safari browser value is discarded.

  if (chromeAgent && safariAgent) return false; // Discard Safari since it also matches Chrome
  return true;
};
export default isSafariBrowser;