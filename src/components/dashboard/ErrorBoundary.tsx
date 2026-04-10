import React, { Component, ErrorInfo, ReactNode } from 'react';
import { DashIcons as Icons } from '../../constants/dashboard';

interface Props {
  children: ReactNode;
  navigate: (path: string) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught component error:', error, errorInfo);
  }

  private handleSoftReset = () => {
    this.setState({ hasError: false, error: null });
  };

  private handleReturnToHome = () => {
    this.setState({ hasError: false, error: null });
    this.props.navigate('#/dashboard');
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center p-6 font-sans relative overflow-hidden">
            {/* Background Orbs */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-red-500/10 rounded-full blur-[100px] pointer-events-none -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-brand-blue/10 rounded-full blur-[120px] pointer-events-none translate-x-1/3 translate-y-1/3" />
            
            <div className="bg-white/70 backdrop-blur-3xl border border-arch-border/50 rounded-3xl p-12 max-w-2xl w-full shadow-[0_20px_50px_rgba(26,43,60,0.05)] relative z-10 slide-up text-center">
                <div className="w-20 h-20 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-inner relative">
                    <Icons.Settings className="w-10 h-10 animate-spin absolute" style={{ animationDuration: '4s' }} />
                    <span className="text-3xl relative z-10 block opacity-50">!</span>
                </div>
                
                <h1 className="text-3xl font-bold tracking-tight text-arch-text mb-4">Interrupción de Interfaz</h1>
                <p className="text-arch-text-muted font-light mb-8 max-w-lg mx-auto leading-relaxed">
                    El portal ha encontrado un error en la renderización del módulo. Sus datos y el estado de la base de datos están seguros.
                </p>

                <div className="bg-white/50 backdrop-blur-md p-6 rounded-xl border border-red-500/10 text-left mb-10 overflow-x-auto shadow-inner">
                    <p className="text-[10px] font-mono text-red-500/80 font-bold whitespace-pre-wrap tracking-wider leading-relaxed">
                        {this.state.error?.message || 'Error Desconocido'}
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button 
                        onClick={this.handleSoftReset}
                        className="bg-brand-green/20 hover:bg-brand-green/40 text-brand-dark-green border border-brand-green/30 px-8 py-4 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all hover:scale-105"
                    >
                        Try Again
                    </button>
                    <button 
                        onClick={this.handleReturnToHome}
                        className="bg-arch-text hover:bg-brand-ink text-white shadow-[0_4px_14px_rgba(26,43,60,0.3)] hover:shadow-[0_6px_20px_rgba(26,43,60,0.4)] px-8 py-4 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all hover:-translate-y-1"
                    >
                        Return to Home
                    </button>
                </div>
            </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
