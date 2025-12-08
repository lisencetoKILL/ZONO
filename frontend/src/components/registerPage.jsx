import React, { useState } from 'react'
import axios from 'axios';

const RegisterPage = () => {

    const [name, setUserName] = useState();
    const [email, setEmail] = useState();
    const [password, setPassword] = useState();
    const [confirmPassword, setConfirmPasword] = useState()

    const handleSubmit = (e) => {
        e.preventDefault();
        axios.post('http://localhost:3001/register', { name, email, password, confirmPassword })
            .then(result => console.log(result))
            .catch(err => console.log(JSON.stringify(err, null, 2)));  // Pretty-print the error JSON
    };

    return (
        <div className="bg-gray-100 flex justify-center items-center h-screen">
            <div className="w-full max-w-sm mx-auto">
                <div className="bg-white shadow-lg rounded-lg p-8">
                    <h2 className="text-2xl font-bold text-center mb-6">Register</h2>

                    {/* Register Form */}
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                                Username
                            </label>
                            <input
                                className="input input-bordered w-full"
                                id="username"
                                type="text"
                                placeholder="Enter your username"
                                required
                                onChange={(e) => setUserName(e.target.value)}
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                                Email
                            </label>
                            <input
                                className="input input-bordered w-full"
                                id="email"
                                type="email"
                                placeholder="Enter your email"
                                required
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                                Password
                            </label>
                            <input
                                className="input input-bordered w-full"
                                id="password"
                                type="password"
                                placeholder="Enter your password"
                                required
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <div className="mb-6">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirm-password">
                                Confirm Password
                            </label>
                            <input
                                className="input input-bordered w-full"
                                id="confirm-password"
                                type="password"
                                placeholder="Confirm your password"
                                required
                                onChange={(e) => setConfirmPasword(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <button className="btn btn-primary w-full" type="submit">
                                Register
                            </button>
                        </div>
                    </form>

                    {/* Footer */}
                    <div className="text-center mt-4">
                        <a href="/login" className="text-sm text-blue-500 hover:underline">
                            Already have an account? Login
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RegisterPage
