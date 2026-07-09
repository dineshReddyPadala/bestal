import { AppRouter } from './app/router';
import { AppProviders } from './providers/AppProviders';

export function App() {
  return (
    <AppProviders>
      <AppRouter />
    </AppProviders>
  );
}
