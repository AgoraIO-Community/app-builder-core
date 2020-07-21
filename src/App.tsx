import React, {useRef, useState} from 'react';
import Join from './pages/Join';
import VideoCall from './pages/VideoCall';
import {Router, Route, Switch, Redirect, useHistory} from './components/Router';
const App: React.FC = () => {
  const [channel, onChangeChannel] = useState('');
  const [password, onChangePassword] = useState('');

  return (
    <Router>
      <Switch>
        <Route exact path={'/'}>
          <Redirect to={'/join'} />
        </Route>
        <Route exact path={'/join'}>
          <Join
            channel={channel}
            onChangeChannel={onChangeChannel}
            password={password}
            onChangePassword={onChangePassword}
          />
        </Route>
        <Route path={'/:channel'}>
          <VideoCall />
        </Route>
      </Switch>
    </Router>
  );
};
export default App;
