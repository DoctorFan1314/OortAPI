"use client";

import { Component, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex flex-col items-center justify-center min-h-[200px] p-8 text-center">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mb-4">
            <AlertTriangle className="h-6 w-6 text-red-400" />
          </div>
          <h3 className="text-sm font-semibold text-foreground mb-1">Something went wrong</h3>
          <p className="text-xs text-muted-foreground mb-4 max-w-md">
            {this.state.error?.message || "An unexpected error occurred"}
          </p>
          <button
            onClick={this.handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-secondary border border-border hover:bg-muted transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
