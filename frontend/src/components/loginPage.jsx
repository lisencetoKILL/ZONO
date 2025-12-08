import React, { useState } from 'react';
import loginImg from '../loginImg.png';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const LoginPage = () => {
    const navigate = useNavigate();

    const [email, setEmail] = useState(''); // Initial value as an empty string
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // Include credentials to send cookies
        axios.post('http://localhost:3001/login', { email, password }, { withCredentials: true })
            .then(result => {
                console.log(result.data);
                if (result.data.message === "Success") {
                    // Redirect to homepage
                    navigate('/home');
                }
            })
            .catch(err => console.log(err));
    }

    return (
        <div className="bg-white flex h-screen">
            <div className="w-2/5 flex justify-start items-center">
                <img
                    src={loginImg}
                    alt="Login Illustration"
                    className="object-cover h-full w-full"
                />
            </div>
            <div className="w-3/5 flex justify-center items-center bg-[#f3f4f6]">
                <div className="w-full p-10 bg-white shadow-xl rounded-lg ml-32 mr-32">
                    <h2 className="text-3xl text-center mb-6">Welcome Back!</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-lg font-bold mb-2" htmlFor="email">
                                Email
                            </label>
                            <input
                                className="input input-bordered w-full h-12 text-lg"
                                id="email"
                                type="email"
                                placeholder="Enter your email"
                                required
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="mb-6">
                            <label className="block text-gray-700 text-lg font-bold mb-2" htmlFor="password">
                                Password
                            </label>
                            <input
                                className="input input-bordered w-full h-12 text-lg"
                                id="password"
                                type="password"
                                placeholder="Enter your password"
                                required
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <button className="btn btn-success w-full h-12 text-lg" type="submit">
                                Log In
                            </button>
                        </div>
                    </form>

                    <div className="text-center mt-4">
                        <button className="text-sm text-[#1E40AF] hover:underline">
                            Forgot Password?
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
