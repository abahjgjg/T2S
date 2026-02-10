import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { telemetryService } from '../services/telemetryService';
import { THEME_COLORS, THEME_RADIUS, THEME_SHADOWS, THEME_TYPOGRAPHY } from '../constants/themeConfig';
import { ANIMATION_DURATION, ANIMATION_EASING } from '../constants/animationConfig';
import { UI_TEXT } from '../constants/uiTextConfig';

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

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    telemetryService.logError(error, `ErrorBoundary: ${errorInfo.componentStack?.slice(0, 50)}...`);
  }

  private handleReload = () => {
    // Attempt to recover by reloading page, or reset state if we passed a reset handler
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className={`min-h-screen bg-${THEME_COLORS.background.DEFAULT} flex flex-col items-center justify-center p-4 text-center animate-[fadeIn_${ANIMATION_DURATION.standard.slow}ms_${ANIMATION_EASING.default}]`}>
          <div className={`bg-${THEME_COLORS.background.card} border border-${THEME_COLORS.border.DEFAULT} p-8 ${THEME_RADIUS.xl} ${THEME_SHADOWS.lg} max-w-md w-full`}>
            <div className={`w-16 h-16 bg-${THEME_COLORS.status.error.bg} rounded-full flex items-center justify-center mx-auto mb-6`}>
              <AlertTriangle className={`w-8 h-8 text-${THEME_COLORS.status.error.DEFAULT}`} />
            </div>
            <h2 className={`text-2xl font-bold text-${THEME_COLORS.text.primary} mb-2`}>{UI_TEXT.errors.genericTitle}</h2>
            <p className={`text-${THEME_COLORS.text.secondary} mb-6 text-sm`}>
              {UI_TEXT.errors.genericDescription}
            </p>
            
            {this.state.error && (
              <div className={`bg-${THEME_COLORS.background.DEFAULT} p-3 ${THEME_RADIUS.md} border border-${THEME_COLORS.border.DEFAULT} text-left mb-6 overflow-hidden`}>
                <code className={`text-xs text-${THEME_COLORS.status.error.text} font-mono break-all block`}>
                  {this.state.error.message}
                </code>
              </div>
            )}

            <button
              onClick={this.handleReload}
              className={`w-full bg-${THEME_COLORS.primary.dark} hover:bg-${THEME_COLORS.primary.DEFAULT} text-white font-bold py-3 ${THEME_RADIUS.md} transition-colors flex items-center justify-center gap-2`}
            >
              <RefreshCcw className="w-4 h-4" />
              {UI_TEXT.errors.reloadButton}
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}