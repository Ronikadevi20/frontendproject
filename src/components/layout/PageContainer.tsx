
import { ReactNode } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

interface PageContainerProps {
  children: ReactNode;
  fullWidth?: boolean;
}

const PageContainer = ({ children, fullWidth = false }: PageContainerProps) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className={`flex-grow w-full ${!fullWidth && 'max-w-7xl mx-auto'}`}>
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default PageContainer;
