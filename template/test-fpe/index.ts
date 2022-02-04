import CustomPreCall from "./custom-components/PreCall";
import { installFPE,  } from "fpe-api";

export const installPlugin = () => {
  /**we can pass components and subcomponents to override the UI elements or screen */
  return installFPE({
    components: {
      //PreCallScreen: CustomPreCall
    },
    subcomponents:{
      //PreCallVideoPreview: CustomPreCall
    }
  })
}
//TODO:hari need to fix on fpe folder name