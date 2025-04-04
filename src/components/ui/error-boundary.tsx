import { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from './button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './card';
import { AlertTriangle } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((props: { error: Error; reset: () => void }) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary component to catch and handle React errors
 *
 * Usage:
 * ```jsx
 * <ErrorBoundary>
 *   <ComponentThatMightError />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to an error reporting service
    console.error('Error caught by ErrorBoundary:', error, errorInfo);

    // Update state with error info
    this.setState({
      errorInfo,
    });

    // Call onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // If a custom fallback is provided, use it
      if (this.props.fallback) {
        // Check if fallback is a function
        if (typeof this.props.fallback === 'function') {
          // Cast to the correct function type and call it
          const FallbackFn = this.props.fallback as (props: { error: Error; reset: () => void }) => ReactNode;
          return FallbackFn({
            error: this.state.error || new Error('Unknown error'),
            reset: this.handleReset
          });
        }
        // If it's a ReactNode, just return it
        return this.props.fallback;
      }

      // Default error UI
      return (
        <Card className="w-full max-w-md mx-auto border-red-200 shadow-md">
          <CardHeader className="bg-red-50 text-red-800 border-b border-red-200">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Something went wrong
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 pb-4">
            <div className="text-sm text-gray-700 mb-4">
              <p>An error occurred in this component.</p>
              {this.state.error && (
                <div className="mt-2 p-2 bg-gray-100 rounded text-xs font-mono overflow-auto max-h-32">
                  {this.state.error.toString()}
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2 bg-gray-50 border-t border-gray-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
            >
              Reload Page
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={this.handleReset}
            >
              Try Again
            </Button>
          </CardFooter>
        </Card>
      );
    }

    // When there's no error, render children normally
    return this.props.children;
  }
}

/**
 * Async Boundary component to catch and handle async errors
 *
 * Usage:
 * ```jsx
 * <AsyncBoundary
 *   pendingFallback={<LoadingSpinner />}
 *   rejectedFallback={({ error, reset }) => (
 *     <div>
 *       Error: {error.message}
 *       <button onClick={reset}>Retry</button>
 *     </div>
 *   )}
 * >
 *   <ComponentWithAsyncOperation />
 * </AsyncBoundary>
 * ```
 */
export function AsyncBoundary({
  children,
  pendingFallback,
  rejectedFallback,
}: {
  children: ReactNode;
  pendingFallback: ReactNode;
  rejectedFallback: (props: { error: Error; reset: () => void }) => ReactNode;
}) {
  // Create a fallback component that calls the rejectedFallback function
  const FallbackComponent = ({ error, reset }: { error: Error; reset: () => void }) => {
    return rejectedFallback({ error, reset });
  };

  return (
    <ErrorBoundary
      fallback={FallbackComponent}
    >
      {children}
    </ErrorBoundary>
  );
}
