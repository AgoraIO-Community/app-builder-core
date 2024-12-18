import React from 'react';
import {logger, LogSource} from '../logger/AppBuilderLogger';

class ErrorBoundary extends React.Component<{fallback: JSX.Element}> {
  constructor(props) {
    super(props);
    this.state = {hasError: false};
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return {hasError: true};
  }

  componentDidCatch(error, info) {
    logger.error(
      LogSource.Internals,
      'VIDEO_CALL_ROOM',
      'Application crashed',
      {
        errorMessage: error?.message,
        errorStack: info?.componentStack,
      },
    );
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return this.props.fallback;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
