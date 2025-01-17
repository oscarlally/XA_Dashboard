import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css'; // Import the CSS file for styling

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://10.189.108.198:3000/api/login', { username, password });
            const token = response.data.token;
            localStorage.setItem('token', token);
            localStorage.setItem('loginTime', Date.now()); // Save the login time
            navigate('/dashboard');
        } catch (err) {
            setError('Incorrect Username or Password');
        }
    };

    return (
        <div className="login-container">
            <h2 className="login-header">MRI Physics Dashboard</h2>
            <form onSubmit={handleSubmit} className="login-form">
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="login-input"
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="login-input"
                />
                <button type="submit" className="login-button">Login</button>
                {error && <p className="login-error">{error}</p>}
            </form>
        </div>
    );
};

export default Login;





// import React, { useState } from 'react';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';
// import './Login.css'; // Import the CSS file for styling

// const Login = () => {
//     const [username, setUsername] = useState('');
//     const [password, setPassword] = useState('');
//     const [error, setError] = useState('');
//     const navigate = useNavigate();

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         try {
//             const response = await axios.post('http://localhost:3000/api/login', { username, password });
//             localStorage.setItem('token', response.data.token);
//             navigate('/dashboard');
//         } catch (err) {
//             setError('Invalid credentials');
//         }
//     };

//     return (
//         <div className="login-container">
//             <h2 className="login-header">Welcome to the Dashboard</h2>
//             <form onSubmit={handleSubmit} className="login-form">
//                 <input
//                     type="text"
//                     placeholder="Username"
//                     value={username}
//                     onChange={(e) => setUsername(e.target.value)}
//                     required
//                     className="login-input"
//                 />
//                 <input
//                     type="password"
//                     placeholder="Password"
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     required
//                     className="login-input"
//                 />
//                 <button type="submit" className="login-button">Login</button>
//                 {error && <p className="login-error">{error}</p>}
//             </form>
//         </div>
//     );
// };

// export default Login;







// // import React, { useState } from 'react';
// // import axios from 'axios';
// // import { useNavigate } from 'react-router-dom';

// // const Login = () => {
// //     const [username, setUsername] = useState('');
// //     const [password, setPassword] = useState('');
// //     const [error, setError] = useState('');
// //     const navigate = useNavigate();

// //     const handleSubmit = async (e) => {
// //         e.preventDefault();
// //         try {
// //             const response = await axios.post('http://localhost:3000/api/login', { username, password });
// //             localStorage.setItem('token', response.data.token);
// //             navigate('/dashboard');
// //         } catch (err) {
// //             setError('Invalid credentials');
// //         }
// //     };

// //     return (
// //         <form onSubmit={handleSubmit}>
// //             <input
// //                 type="text"
// //                 placeholder="Username"
// //                 value={username}
// //                 onChange={(e) => setUsername(e.target.value)}
// //                 required
// //             />
// //             <input
// //                 type="password"
// //                 placeholder="Password"
// //                 value={password}
// //                 onChange={(e) => setPassword(e.target.value)}
// //                 required
// //             />
// //             <button type="submit">Login</button>
// //             {error && <p>{error}</p>}
// //         </form>
// //     );
// // };

// // export default Login;

