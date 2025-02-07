import React, { Suspense } from 'react';
import LoadingSpinner from './LoadingSpinner';
import ErrorBoundary from './ErrorBoundary';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const AsyncComponent: React.FC<Props> = ({ children, fallback }) => {
  return (
    <ErrorBoundary>
      <Suspense fallback={fallback || <LoadingSpinner className="p-8" />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
};

export default AsyncComponent;