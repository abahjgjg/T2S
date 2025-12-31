import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { telemetryService } from '../services/telemetryService';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    telemetryService.logError(error, `ErrorBoundary: ${errorInfo.componentStack?.slice(0, 50)}...`);
  }

  private handleReload = () => {
    // Attempt to recover by reloading page, or reset state if we passed a reset handler
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center animate-[fadeIn_0.5s_ease-out]">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl max-w-md w-full">
            <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Something went wrong</h2>
            <p className="text-slate-400 mb-6 text-sm">
              The application encountered an unexpected error. This might be due to a temporary glitch or data issue.
            </p>
            
            {this.state.error && (
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-left mb-6 overflow-hidden">
                <code className="text-xs text-red-400 font-mono break-all block">
                  {this.state.error.message}
                </code>
              </div>
            )}

            <button
              onClick={this.handleReload}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCcw className="w-4 h-4" />
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}