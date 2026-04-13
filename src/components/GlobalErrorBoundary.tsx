import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "./Button";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class GlobalErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);

        // Auto-reload on ChunkLoadError (deployment mismatch)
        const isChunkError = error.message && (
            error.message.includes('Failed to fetch dynamically imported module') ||
            error.message.includes('Importing a module script failed')
        );

        if (isChunkError) {
            const storageKey = 'chunk_load_error_reload';
            const lastReload = sessionStorage.getItem(storageKey);

            // Only reload if we haven't done so in the last 10 seconds
            if (!lastReload || Date.now() - parseInt(lastReload) > 10000) {
                sessionStorage.setItem(storageKey, Date.now().toString());
                window.location.reload();
            }
        }
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">
                        Uups! Etwas ist schief gelaufen.
                    </h1>
                    <p className="text-gray-600 mb-6 max-w-md">
                        Es gab einen unerwarteten Fehler beim Laden der Seite. Wir arbeiten bereits daran.
                    </p>
                    <div className="p-4 bg-gray-100 rounded-lg mb-6 text-left w-full max-w-md overflow-auto text-xs font-mono text-red-600">
                        {this.state.error?.toString()}
                    </div>
                    <Button onClick={() => window.location.reload()} variant="primary">
                        Seite neu laden
                    </Button>
                    <br />
                    <Button onClick={() => window.location.href = '/'} variant="outline" className="mt-2">
                        Zur Startseite
                    </Button>
                </div>
            );
        }

        return this.props.children;
    }
}
