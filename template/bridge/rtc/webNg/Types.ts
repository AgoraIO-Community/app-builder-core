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
export enum VideoRenderMode {
  Hidden = 1,
  Fit,
  Adaptive,
}
/**
 *
 * The latency level of an audience member in a live interactive streaming. Takes effect only when the user role is `"audience"`.
 * - `1`: Low latency.
 * - `2`: (Default) Ultra low latency.
 */

export const enum AudienceLatencyLevelType {
  /**
   * Low latency.
   */
  AUDIENCE_LEVEL_LOW_LATENCY = 1,
  /**
   * Ultra-low latency.
   */
  AUDIENCE_LEVEL_ULTRA_LOW_LATENCY = 2,
  /**
   * @ignore
   */
  AUDIENCE_LEVEL_SYNC_LATENCY = 3,
}

export interface ClientRoleOptions {
  /**
   * The latency level of an audience member in a live interactive streaming.
   *
   * > Note:
   * > - Takes effect only when the user role is `"audience"`.
   * > - Levels affect prices.
   */
  level: AudienceLatencyLevelType;
}
