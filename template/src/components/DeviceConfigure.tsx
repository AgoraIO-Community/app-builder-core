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
import React, {useState, useContext, useEffect} from 'react';
import {RtcContext, ClientRole} from '../../agora-rn-uikit';
import DeviceContext from './DeviceContext';

interface Props {
  userRole: ClientRole;
}
const DeviceConfigure: React.FC<Props> = (props: any) => {
  const {userRole} = props;
  const [selectedCam, setSelectedCam] = useState('');
  const [selectedMic, setSelectedMic] = useState('');
  const [deviceList, setDeviceList] = useState([]);
  const rtc = useContext(RtcContext);

  useEffect(() => {
    const updateDevices = () => {
      rtc.RtcEngine.getDevices(function (devices: any) {
        console.log('set devices');
        setDeviceList(devices);
        for (const i in devices) {
          if (devices[i].kind === 'videoinput') {
            setSelectedCam(devices[i].deviceId);
            break;
          }
        }
        for (const i in devices) {
          if (devices[i].kind === 'audioinput') {
            setSelectedMic(devices[i].deviceId);
            break;
          }
        }
      });
    };
    if ($config.EVENT_MODE) {
      if (userRole == ClientRole.Broadcaster) {
        updateDevices();
      }
    } else {
      updateDevices();
    }
  }, [userRole]);

  useEffect(() => {
    if (selectedCam.length !== 0) {
      rtc.RtcEngine.changeCamera(
        selectedCam,
        () => {},
        (e: any) => console.log(e),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCam]);

  useEffect(() => {
    if (selectedCam.length !== 0) {
      rtc.RtcEngine.changeMic(
        selectedMic,
        () => {},
        (e: any) => console.log(e),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMic]);

  return (
    <DeviceContext.Provider
      value={{
        selectedCam,
        setSelectedCam,
        selectedMic,
        setSelectedMic,
        deviceList,
        setDeviceList,
      }}>
      {true ? props.children : <></>}
    </DeviceContext.Provider>
  );
};

export default DeviceConfigure;
