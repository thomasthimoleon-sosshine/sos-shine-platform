// Import necessary components from React and Next.js
import { FC } from 'react';

// Define the Layout component
const Layout: FC = ({ children }) => {
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