import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ element: Component }) => {
    const token = localStorage.getItem('token');

    if (!token) {
        return <Navigate to="/login" />;
    }

    // Decode the token to check expiration
    try {
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Date.now() / 1000;

        // If token is expired, navigate to login
        if (decodedToken.exp < currentTime) {
            localStorage.removeItem('token'); // Optionally remove expired token
            return <Navigate to="/login" />;
        }
    } catch (error) {
        // If there's an error decoding the token, navigate to login
        localStorage.removeItem('token'); // Optionally remove invalid token
        return <Navigate to="/login" />;
    }

    return Component;
};

export default ProtectedRoute;


// import React from 'react';
// import { Navigate } from 'react-router-dom';

// const ProtectedRoute = ({ element: Component }) => {
//     const token = localStorage.getItem('token');
//     if (!token) {
//         return <Navigate to="/login" />;
//     }

//     // Decode the token to check expiration
//     const decodedToken = JSON.parse(atob(token.split('.')[1]));
//     const currentTime = Date.now() / 1000;

//     // If token is expired, navigate to login
//     if (decodedToken.exp < currentTime) {
//         return <Navigate to="/login" />;
//     }

//     return Component; // Render the component
// };

// export default ProtectedRoute;


// import React from 'react';
// import { Navigate } from 'react-router-dom';

// const ProtectedRoute = ({ element: Component }) => {
//     const token = localStorage.getItem('token');
//     if (!token) {
//         return <Navigate to="/login" />;
//     }
//     return Component // Render the component
// };

// export default ProtectedRoute;


