
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./components/theme/theme-provider";
import { initEnvValidation } from "./utils/env";
import { HelmetProvider } from "react-helmet-async";
import { applySecurityHeaders } from "./middleware/securityHeaders";

// Import i18n
import "./i18n";

// Apply security headers in development environment
// In production, these are handled by nginx
applySecurityHeaders();

// Validate all environment variables
try {
  // Validate all environment variables defined in ENV_VAR_CONFIGS
  // Set strict mode to true in production, false in development
  const isProduction = import.meta.env.PROD;
  initEnvValidation(undefined, isProduction);

  // Log successful validation
  console.log('Environment validation successful');
} catch (error) {
  console.error('Environment validation failed:', error);

  // In production, we might want to prevent the app from loading with invalid config
  // For now, we'll continue loading but some features might not work
}

// Initialize Tempo devtools if enabled
if (import.meta.env.VITE_TEMPO === "true") {
  try {
    // Use dynamic import to avoid issues with missing exports
    // Note: We're using a type assertion to avoid TypeScript errors
    import("tempo-devtools").then((tempoModule: any) => {
      // Check if tempo has any initialization method
      if (tempoModule.TempoDevtools && typeof tempoModule.TempoDevtools.init === 'function') {
        tempoModule.TempoDevtools.init();
      } else if (tempoModule.default && typeof tempoModule.default.init === 'function') {
        (tempoModule.default as any).init();
      } else {
        console.warn('Tempo devtools initialization method not found');
      }
    }).catch(err => {
      console.warn('Failed to load Tempo devtools:', err);
    });
  } catch (error) {
    console.warn('Error initializing Tempo devtools:', error);
  }
}

const basename = import.meta.env.BASE_URL;

ReactDOM.createRoot(document.getElementById("root")!).render(
  // Removed StrictMode to avoid warnings from third-party libraries
  <HelmetProvider>
    <ThemeProvider defaultTheme="light" storageKey="ninio-theme">
      <AuthProvider>
        <BrowserRouter basename={basename}>
          <App />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  </HelmetProvider>
);
