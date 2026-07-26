import {
  BrowserRouter as Router,
} from 'react-router-dom';

import Header from './Header';
import Pages from './Pages';

function App() {
  return (
    <>
      <Router>
        <main className="flex flex-col h-[100vh]">
          <Header />
          <Pages />
        </main>
      </Router>
    </>
  );
}

export default App
