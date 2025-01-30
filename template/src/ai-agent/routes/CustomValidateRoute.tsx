import React, {useContext, useEffect} from 'react';
import {useHistory, Loading} from 'customization-api';
import {AgentContext} from '../components/AgentControls/AgentContext';

const CustomValidateRoute = () => {
  const history = useHistory();
  const {setAgentAuthToken} = useContext(AgentContext);

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    queryParams.forEach((value, key) => {
      console.log(`${key}: ${value}`);
    });
    // check for success login from url param and redirect to create using custom param

    if (queryParams.has('token')) {
      // Redirect to create using custom param only if token exists
      setAgentAuthToken(queryParams.get('token') || '');
      history.push('/create?auth=success');
    }
  }, []);
  return <Loading text="" />;
};

export default CustomValidateRoute;
