import React, {useState} from 'react';
import Join from './pages/Join';
import VideoCall from './pages/VideoCall';
import Create from './pages/Create';
import {Router, Route, Switch, Redirect} from './components/Router';

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
        <Route path={'/create'}>
          <Create />
        </Route>
        <Route path={'/:channel'}>
          <VideoCall />
        </Route>
      </Switch>
    </Router>
  );
};
export default App;
