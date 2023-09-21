import {customize} from 'customization-api';
import ActiveSpeakerLayout from './custom-layout/active-speaker-layout';
import CustomGridLayout from './custom-layout/grid-layout';
import CustomTopBar from './toolbar/customTopBar';
import {CustomWrapperProvider} from './custom-context/CustomWrapper';
const userCustomization = customize({
  components: {
    videoCall: {
      //@ts-ignore
      wrapper: CustomWrapperProvider,
      topToolBar: CustomTopBar,
      customLayout: () => {
        return [
          {
            name: 'grid',
            component: CustomGridLayout,
            icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEgAAABICAYAAABV7bNHAAAACXBIWXMAACE4AAAhOAFFljFgAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAFOSURBVHgB7drBTcNAEIXhWVeQEkwJVIDohA6gA2iBigIVhA6cEuhgGGNfd1+kZK1x9H/SyidbT0/ry+6YAQBwt9z9EOs91tFv4xTrZW8ZasHGWJP3Mc3fz56hiHBTPEbr5xzrsZTya0kzDLW3fNmCo/U1xnqzxBmG+nv2att4ssQZqr/Y/IPaRmJ7l6wZBkMTBQkUJFCQQEECBQkUJFCQQEECBQkUJFCQQEECBQkUJFCQ0Croy7bxY4kztAr6tm18WuIMrSPXQzxO1vlGIU46HyxxhuoOWq9Bnm25FunhvH7fMme4yHz94stt5C0cY32su2NXGQAAuDPOAFUzGANUIhwDVLW3nAGqfwxQiQwMUIkMnCgKFCRQkEBBAgUJFCRQkEBBAgUJFCRQkEBBAgUJFCRQkEBBAgNUIgMDVCIDA1QMUF2X4SLOABUAADv0Bxz9l6sMoGOZAAAAAElFTkSuQmCC',
            label: 'Grid View',
          },
          {
            name: 'pinned',
            component: ActiveSpeakerLayout,
            icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEgAAABICAYAAABV7bNHAAAACXBIWXMAACE4AAAhOAFFljFgAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAGCSURBVHgB7drdTYRAFIbhM1SwJWAJVmC2E61AO1BLsCKwgrUDKMEOxkPAS+a7YeCweZ9ksle7OXn3jzBjBgDA3co5X3y9++ryNm6+ns82w9pgra8h1zFMrx99hiSGG/yhtXpGX48ppV8LOkOz9qw8fwRbq6v19WaBZ2jWn2evto8nCzzD6lds+oLaTvzjnaLO0BiKCCQQSCCQQCCBQAKBBAIJBBIIJBBIIJBAIIFAAoEEAgmlQL3t48cCKwX6tn18WWClW64Xf7hZ5R0Fv9P5YOszxL3lumyDXG3eFqlhXF4/tOKPtEf6f4dfbLvfit7Xp817UaMFlywwdjVOgEACgQQCCQQSZKAc9fDSTtT5oNYfOqtzNT36upauhSL8zYc+QBX6OijC4aUIoh+gOhwHqMQM/M0LBBIIJBBIIJBAIIFAAoEEAgkEEggkEEggkEAggUACgYToB6h6O3iG6AeoDp8h+gGqw2cIfYDqNIe4pi2gZUd0C52vj+XTcaoZAAA4lz9x+tmcZ0GmbAAAAABJRU5ErkJggg==',
            label: 'Active Speaker View',
          },
        ];
      },
    },
  },
});

export default userCustomization;
