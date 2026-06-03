"use client";

import { Component, type ReactNode } from "react";
import { BarChart3 } from "lucide-react";
import { useI18n } from "@/contexts/i18n-context";

interface Props {
  children: ReactNode;
  title?: string;
}

interface State {
  hasError: boolean;
}

class ChartErrorBoundaryInner extends Component<Props & { defaultTitle: string }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-muted-foreground">
          <BarChart3 className="h-8 w-8 mb-2 opacity-40" />
          <p className="text-xs">{this.props.title || this.props.defaultTitle}</p>
        </div>
      );
    }
    return this.props.children;
  }
}

export function ChartErrorBoundary({ children, title }: Props) {
  const { t } = useI18n();
  return (
    <ChartErrorBoundaryInner title={title} defaultTitle={t.error.chartUnavailable}>
      {children}
    </ChartErrorBoundaryInner>
  );
}
