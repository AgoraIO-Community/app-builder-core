import CustomPreCall from "./custom-components/PreCall";
import { installFPE,  } from "fpe-api";
import CustomPage1 from "./custom-pages/CustomPage1";

export const installPlugin = () => {
  /**we can pass components and subcomponents to override the UI elements or screen */
  return installFPE({
    components: {
      //createMeetingScreen: CustomPreCall
      //PreCallScreen: CustomPreCall
    },
    subcomponents:{
      //Chat: CustomPage1
      //Controls: CustomPage1
      //ParticipantsView: CustomPage1
      //SettingsView: CustomPage1
      // PreCallTextInput: CustomPage1,
      // PreCallJoinBtn: CustomPreCall
      //PreCallVideoPreview: CustomPreCall
      //ShareLink: CustomPreCall
    },
    custom_routes:[
      {
        path: '/test',
        component: CustomPage1,
        exact: true
      }
    ]
  })
}
//TODO:hari need to fix on fpe folder name