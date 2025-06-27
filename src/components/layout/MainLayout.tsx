
import React from 'react';
import TopNavigation from '@/components/navigation/TopNavigation';
import Footer from '@/components/navigation/Footer';
import Breadcrumb from '@/components/navigation/Breadcrumb';

interface MainLayoutProps {
  children: React.ReactNode;
  showBreadcrumb?: boolean;
  showFooter?: boolean;
}

const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, 
  showBreadcrumb = true, 
  showFooter = true 
}) => {
  return (
    <div className="min-h-screen flex flex-col">
      <TopNavigation />
      {showBreadcrumb && <Breadcrumb />}
      
      <main className="flex-1 bg-gray-50">
        {children}
      </main>
      
      {showFooter && <Footer />}
    </div>
  );
};

export default MainLayout;
