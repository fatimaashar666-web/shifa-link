
"use client";

import React, { Component, type ReactNode } from "react";
import {
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(
    error: Error
  ): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("ShifaLink Error Boundary:", error);
    console.error("Component Stack:", info.componentStack);

    // Later: Send error details to your monitoring service.
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-[250px] items-center justify-center rounded-xl bg-blue-50 p-6">
          <div className="max-w-sm text-center">

            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle
                size={30}
                className="text-red-500"
              />
            </div>

            <h2 className="text-xl font-bold text-gray-800">
              Something Went Wrong
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              This section could not be loaded.
              Please try again.
            </p>

            <button
              onClick={this.handleReset}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <RefreshCw size={16} />
              Try Again
            </button>

          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
