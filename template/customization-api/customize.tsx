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
import React from 'react';
import {AI_AGENT_CUSTOMIZATION} from '../src/ai-agent';
import {LogSource, logger} from '../src/logger/AppBuilderLogger';
import {CustomizationApiInterface} from './typeDefinition';
import ReactIs from 'react-is';
/**
 *
 * @param config customization options to override the UI components and customize the application
 * @returns customization options
 */

function isString(data: any) {
  if (data && typeof data === 'string') {
    return true;
  }
  return false;
}

function isFunction(data: any) {
  if (data && typeof data === 'function') {
    return true;
  }
  return false;
}

function isObject(data: any) {
  if (data && typeof data === 'object') {
    return true;
  }
  return false;
}

function isComponent(data: any) {
  if (data && ReactIs.isValidElementType(data)) {
    return true;
  }
  return false;
}

//These keys value are not react component. so doing indexOf and checking whether its function or not
const ignoreTheseKeys = ['customLayout'];

function validateComponents(components: any) {
  for (const key in components) {
    if (ignoreTheseKeys.indexOf(key) === -1) {
      let comp = components[key];
      if (comp) {
        if (isComponent(comp) || isObject(comp)) {
          if (isObject(comp)) {
            validateComponents(comp);
          }
        } else {
          logger.error(
            LogSource.CustomizationAPI,
            'Log',
            `Error ${key} should be a react component or object`,
          );
        }
      }
    } else {
      let comp = components[key];
      if (comp && !isFunction(comp)) {
        logger.error(
          LogSource.CustomizationAPI,
          'Log',
          `Error ${key} should be an function`,
        );
      }
    }
  }
}

function validateLifecycle(data: any) {
  for (const key in data) {
    const callback = data[key];
    if (callback && !isFunction(callback)) {
      logger.error(
        LogSource.CustomizationAPI,
        'Log',
        `Error ${key} should be a function that return async function`,
      );
    }
  }
}

function validateCustomRoutes(routes: any) {
  if (routes && !Array.isArray(routes)) {
    logger.error(
      LogSource.CustomizationAPI,
      'Log',
      'Error customRoutes should be an array',
    );
  }
}

function validatei18n(data: any) {
  if (data) {
    if (!Array.isArray(data)) {
      logger.error(
        LogSource.CustomizationAPI,
        'Log',
        'Error i18n should be an array',
      );
    } else {
      data.map(item => {
        const langData = item.data;
        for (const key in langData) {
          const value = langData[key];
          if (value) {
            if (!(isString(value) || isFunction(value))) {
              logger.error(
                LogSource.CustomizationAPI,
                'Log',
                `Error ${item.locale} ${key} should be a string or function`,
              );
            }
          }
        }
      });
    }
  }
}

const mergeCustomization = (
  externalConfig: CustomizationApiInterface,
  aiAgentConfig: CustomizationApiInterface,
) => {
  //check if any external config passed
  if (
    !externalConfig ||
    (externalConfig && !Object.keys(externalConfig)?.length)
  ) {
    logger.log(
      LogSource.CustomizationAPI,
      'AI_AGENT_CUSTOMIZATION',
      'Applied default customization',
    );
    //if not then return the aiAgentConfig
    return aiAgentConfig;
  }

  //merging config
  const mergedData: CustomizationApiInterface = mergeDeep(
    aiAgentConfig,
    externalConfig,
  );

  logger.log(
    LogSource.CustomizationAPI,
    'EXTERNAL_CUSTOMIZATION',
    'Applied EXTERNAL_CUSTOMIZATION with AI_AGENT_CUSTOMZATION',
  );
  //override the app root
  if (externalConfig?.components?.appRoot) {
    const AiAgentAppRoot = aiAgentConfig.components.appRoot;
    const ExternalAppRoot = externalConfig.components.appRoot;
    mergedData.components.appRoot = props => (
      <AiAgentAppRoot>
        <ExternalAppRoot>{props.children}</ExternalAppRoot>
      </AiAgentAppRoot>
    );
    logger.log(
      LogSource.CustomizationAPI,
      'EXTERNAL_CUSTOMIZATION',
      'Applied appRoot with aiAgent appRoot',
    );
  }

  if (externalConfig?.components?.videoCall?.wrapper) {
    const AiAgentVideoCallWrapper = aiAgentConfig.components.videoCall.wrapper;
    const ExternalVideoCallWrapper =
      externalConfig.components.videoCall.wrapper;
    mergedData.components.videoCall.wrapper = props => (
      <AiAgentVideoCallWrapper>
        <ExternalVideoCallWrapper>{props.children}</ExternalVideoCallWrapper>
      </AiAgentVideoCallWrapper>
    );
  }

  //override the i18n
  if (externalConfig?.i18n && externalConfig?.i18n?.length) {
    mergedData.i18n = externalConfig.i18n;
  } else if (
    (!externalConfig?.i18n || !externalConfig?.i18n?.length) &&
    aiAgentConfig?.i18n?.length
  ) {
    mergedData.i18n = aiAgentConfig.i18n;
  }

  return mergedData;
};

export const customize = (config: CustomizationApiInterface) => {
  let newConfig: CustomizationApiInterface = {};

  try {
    //check if is ai agent and merge agent and user config
    if ($config.ENABLE_CONVERSATIONAL_AI) {
      newConfig = mergeCustomization(config, AI_AGENT_CUSTOMIZATION);
    } else {
      newConfig = config;
    }

    //validating the components
    newConfig?.components && validateComponents(newConfig.components);

    //validating the custom routes
    config?.customRoutes && validateCustomRoutes(config.customRoutes);

    //validating the i18n
    newConfig?.i18n && validatei18n(newConfig.i18n);

    //validating the lifecycle
    config?.lifecycle && validateLifecycle(config?.lifecycle);
  } catch (error) {
    logger.error(
      LogSource.CustomizationAPI,
      'Log',
      'Error on applying the customization',
      error,
    );
  }

  return newConfig;
};

/**
 * Performs a deep merge of objects and returns new object. Does not modify
 * objects (immutable) and merges arrays via concatenation.
 *
 * @param {...object} objects - Objects to merge
 * @returns {object} New object with merged key/values
 */
function mergeDeep(...objects) {
  const isObject = obj => obj && typeof obj === 'object';

  return objects.reduce((prev, obj) => {
    Object.keys(obj).forEach(key => {
      const pVal = prev[key];
      const oVal = obj[key];

      if (Array.isArray(pVal) && Array.isArray(oVal)) {
        prev[key] = pVal.concat(...oVal);
      } else if (isObject(pVal) && isObject(oVal)) {
        prev[key] = mergeDeep(pVal, oVal);
      } else {
        prev[key] = oVal;
      }
    });

    return prev;
  }, {});
}
