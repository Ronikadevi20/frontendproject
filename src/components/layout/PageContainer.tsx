
import { ReactNode } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

interface PageContainerProps {
  title?: string; // ✅ Add this line
  children: ReactNode;
  fullWidth?: boolean;
}

export const PageContainer = ({ title, children, fullWidth = false }: PageContainerProps) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className={`flex-grow w-full ${!fullWidth && 'max-w-7xl mx-auto'}`}>
        {/* ✅ Conditionally render title */}
        {title && <h1 className="text-2xl font-bold mt-6 mb-4 px-4">{title}</h1>}
        {children}
      </main>
      <Footer />
    </div>
  );
};
