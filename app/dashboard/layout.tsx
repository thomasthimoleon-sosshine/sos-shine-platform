// Import React and React types
import React, { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

// Define the Layout component
const Layout = ({ children }: LayoutProps) => {
  return (
    <div>
      <header>Header Section</header>
      <main>{children}</main>
      <footer>Footer Section</footer>
    </div>
  );
};

// Export the Layout component
export default Layout;