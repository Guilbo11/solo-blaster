import React from 'react';

type Props = {
  children: React.ReactNode;
};

type State = {
  hasError: boolean;
  errorMessage?: string;
};

export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(err: unknown): State {
    return {
      hasError: true,
      errorMessage: err instanceof Error ? err.message : String(err),
    };
  }

  componentDidCatch(err: unknown) {
    // eslint-disable-next-line no-console
    console.error('Unhandled error', err);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="page">
        <div className="card">
          <h2>Something went wrong</h2>
          <p className="muted">The app hit an unexpected error. Your data should still be safe in local storage.</p>
          {this.state.errorMessage ? (
            <pre style={{ whiteSpace: 'pre-wrap' }} className="muted small">
              {this.state.errorMessage}
            </pre>
          ) : null}
          <div className="row" style={{ gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
            <button className="btnSecondary" onClick={() => (window.location.href = '#/campaigns')}>Back to landing</button>
            <button className="btn" onClick={() => window.location.reload()}>Reload</button>
          </div>
        </div>
      </div>
    );
  }
}
