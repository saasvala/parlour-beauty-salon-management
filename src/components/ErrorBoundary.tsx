import React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  async componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('error_logs').insert({
        user_id: user?.id ?? null,
        error_type: 'react_error_boundary',
        error_message: error.message,
        error_stack: error.stack ?? null,
        metadata: { componentStack: info.componentStack, path: window.location.pathname },
      });
    } catch (e) {
      console.error('Failed to log error to error_logs:', e);
    }
  }

  reset = () => this.setState({ hasError: false, error: null });

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-6">
          <div className="max-w-md w-full text-center space-y-4 p-8 rounded-2xl border border-border bg-card">
            <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-destructive" />
            </div>
            <h1 className="font-serif text-2xl">Something went wrong</h1>
            <p className="text-sm text-muted-foreground">
              An unexpected error occurred. Our team has been notified.
            </p>
            {this.state.error?.message && (
              <p className="text-xs text-muted-foreground/70 font-mono break-all">
                {this.state.error.message}
              </p>
            )}
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={this.reset}>Try again</Button>
              <Button onClick={() => (window.location.href = '/')}>Go home</Button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
