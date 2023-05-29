import React from 'react';
import {ToolbarPreset, customize} from 'customization-api';
import AINSButton from './AINS/AINSButton';
import VBButtons from './VB/VBButton';
import WhiteboardButton from './whiteboard/WhiteboardButton';
import CustomLayout from './CustomLayout';
import WhiteboardConfigure from './whiteboard/WhiteboardConfigure';

const CustomBottomBar = () => {
  return (
    <ToolbarPreset
      align="bottom"
      customItems={[
        {align: 'end', component: AINSButton, hide: 'no', order: 0},
        {align: 'end', component: VBButtons, hide: 'no', order: 0},
        {align: 'end', component: WhiteboardButton, hide: 'no', order: 1},
      ]}
    />
  );
};
const data = customize({
  components: {
    videoCall: {
      wrapper: WhiteboardConfigure,
      bottomToolBar: CustomBottomBar,
      customLayout: (layouts) => {
        return layouts.concat({
          component: CustomLayout,
          label: 'Whiteboard',
          icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEgAAABICAYAAABV7bNHAAAACXBIWXMAACE4AAAhOAFFljFgAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAGCSURBVHgB7drdTYRAFIbhM1SwJWAJVmC2E61AO1BLsCKwgrUDKMEOxkPAS+a7YeCweZ9ksle7OXn3jzBjBgDA3co5X3y9++ryNm6+ns82w9pgra8h1zFMrx99hiSGG/yhtXpGX48ppV8LOkOz9qw8fwRbq6v19WaBZ2jWn2evto8nCzzD6lds+oLaTvzjnaLO0BiKCCQQSCCQQCCBQAKBBAIJBBIIJBBIIJBAIIFAAoEEAgmlQL3t48cCKwX6tn18WWClW64Xf7hZ5R0Fv9P5YOszxL3lumyDXG3eFqlhXF4/tOKPtEf6f4dfbLvfit7Xp817UaMFlywwdjVOgEACgQQCCQQSZKAc9fDSTtT5oNYfOqtzNT36upauhSL8zYc+QBX6OijC4aUIoh+gOhwHqMQM/M0LBBIIJBBIIJBAIIFAAoEEAgkEEggkEEggkEAggUACgYToB6h6O3iG6AeoDp8h+gGqw2cIfYDqNIe4pi2gZUd0C52vj+XTcaoZAAA4lz9x+tmcZ0GmbAAAAABJRU5ErkJggg==',
          name: 'whiteboard',
        });
      },
    },
  },
});
export default data;
