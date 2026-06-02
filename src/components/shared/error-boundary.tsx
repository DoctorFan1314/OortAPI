"use client";

import { Component, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorBoundaryLabels {
  title: string;
  description: string;
  retry: string;
}

const DEFAULT_LABELS: ErrorBoundaryLabels = {
  title: "Something went wrong",
  description: "An unexpected error occurred",
  retry: "Try again",
};

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  labels?: Partial<ErrorBoundaryLabels>;
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

      const labels = { ...DEFAULT_LABELS, ...this.props.labels };

      return (
        <div className="flex flex-col items-center justify-center min-h-[200px] p-8 text-center">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mb-4">
            <AlertTriangle className="h-6 w-6 text-red-400" />
          </div>
          <h3 className="text-sm font-semibold text-foreground mb-1">{labels.title}</h3>
          <p className="text-xs text-muted-foreground mb-4 max-w-md">
            {this.state.error?.message || labels.description}
          </p>
          <button
            onClick={this.handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-secondary border border-border hover:bg-muted transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            {labels.retry}
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
