import AppRoutes from './routes/AppRoutes.jsx';
import { usePageMeta } from './hooks/usePageMeta.js';

function App() {
  // Titlul implicit și atributul lang; paginile individuale îl suprascriu.
  usePageMeta();

  return <AppRoutes />;
}

export default App;
