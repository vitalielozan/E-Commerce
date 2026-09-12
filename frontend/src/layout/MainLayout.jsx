import { Outlet } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';

function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main
        id="main"
        className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 md:px-6 md:py-10"
      >
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default MainLayout;
