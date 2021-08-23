import React from 'react';
import {Prompt} from './Router.native'

interface PreventNavigationProps {
  message: string
}

const PreventNavigation: React.FC<PreventNavigationProps> = ({message}) => {
  return <Prompt message={message}/>;
};

export default PreventNavigation;
