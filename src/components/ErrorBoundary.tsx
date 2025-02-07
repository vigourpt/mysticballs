import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error);
    console.error('Component stack:', errorInfo.componentStack);
    
    this.setState({
      error,
      errorInfo
    });
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined
    });
  };

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-[400px] flex items-center justify-center p-4">
          <div className="text-center p-8 rounded-xl bg-red-50 dark:bg-red-900/20 shadow-lg max-w-md mx-auto w-full">
            <div className="flex justify-center mb-4">
              <AlertTriangle className="w-12 h-12 text-red-500 dark:text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-red-600 dark:text-red-300 mb-4">
              Oops! Something went wrong
            </h2>
            <p className="text-gray-600 dark:text-red-200 mb-6">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <div className="space-y-4">
              <button
                onClick={this.handleRetry}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    try {
      return this.props.children;
    } catch (error) {
      console.error('Render error:', error);
      this.setState({ hasError: true, error: error as Error });
      return null;
    }
  }
}

export default ErrorBoundary;