import { BookingProvider } from './context/BookingContext.jsx';
import Home from './pages/Home.jsx';

function App() {
  return (
    <BookingProvider>
      <Home />
    </BookingProvider>
  );
}

export default App;
