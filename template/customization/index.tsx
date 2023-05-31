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
      //buttons are added directly in the Controls.tsx more menu button
      //bottomToolBar: CustomBottomBar,
      customLayout: (layouts) => {
        return layouts.concat({
          component: CustomLayout,
          label: 'Whiteboard',
          //icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEgAAABICAYAAABV7bNHAAAACXBIWXMAACE4AAAhOAFFljFgAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAGCSURBVHgB7drdTYRAFIbhM1SwJWAJVmC2E61AO1BLsCKwgrUDKMEOxkPAS+a7YeCweZ9ksle7OXn3jzBjBgDA3co5X3y9++ryNm6+ns82w9pgra8h1zFMrx99hiSGG/yhtXpGX48ppV8LOkOz9qw8fwRbq6v19WaBZ2jWn2evto8nCzzD6lds+oLaTvzjnaLO0BiKCCQQSCCQQCCBQAKBBAIJBBIIJBBIIJBAIIFAAoEEAgmlQL3t48cCKwX6tn18WWClW64Xf7hZ5R0Fv9P5YOszxL3lumyDXG3eFqlhXF4/tOKPtEf6f4dfbLvfit7Xp817UaMFlywwdjVOgEACgQQCCQQSZKAc9fDSTtT5oNYfOqtzNT36upauhSL8zYc+QBX6OijC4aUIoh+gOhwHqMQM/M0LBBIIJBBIIJBAIIFAAoEEAgkEEggkEEggkEAggUACgYToB6h6O3iG6AeoDp8h+gGqw2cIfYDqNIe4pi2gZUd0C52vj+XTcaoZAAA4lz9x+tmcZ0GmbAAAAABJRU5ErkJggg==',
          icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAABeElEQVRIie3Uz4tNcRjH8c/XlRgjkiKzUNyr/EjK1n/g/5C/wI8F+ROklNjMjZKysrDT2GuahcjCxqCIJMKUppfFPeo6fWfuGZrdfDbn9Dzf8/48z3POeZINTVBpB7Avybkkp5IsJ3me5GYp5c1/u+EQPuMXnuEplvAVJ1d4poddXQ0OYojjY7EZvMewcn6AV1jG5X/t6gA+4E4ld8vfurQW8F5cw098xNGxXK+5bsHDMYMvXcC7G/D35l0MsX8sP8BLnK6YPJgEP4x3DXgW/VZ+gLcN7FvL5CqmJhncbcZxpJIbh2ubrKRNlVhJMt2GJ5lLMtM6O53kwqpVt0B9vMYL7Fil8j+amziWisl27FkXeMuoExw71xN+Ap9wD1u7wvtdx4JtuGi0Kq50Nbi+1pkbLcZHtVztM+1VYk+SnCml/GiBp3A+ybEkC107uDGpcpzFvNGPxmhVVLvbXInNJlls7peS3G5X3mgxyeMk90sp852q31BNvwGhl1TXx/9xfQAAAABJRU5ErkJggg==',
          name: 'whiteboard',
        });
      },
    },
  },
});
export default data;
