import React from 'react';
import logo from '../components/logo.png';
import landingImage from '../landing.jpg'; // Example image for the right-side

const Landing = () => {
    const navigation = [
        { name: 'Explore', href: '/' },
        { name: 'About', href: '/' },
        { name: 'Contact', href: '/' },
    ];

    return (
        <div className="bg-[#f3f4f6] min-h-screen">
            <header className="absolute inset-x-0 top-0 z-50">
                <nav aria-label="Global" className="flex items-center justify-between p-4 lg:px-6"> {/* Reduced padding */}
                    <div className="flex lg:flex-1">
                        <a href="/" className="-m-1.5 p-1.5">
                            <img
                                alt="Logo"
                                src={logo}
                                className="h-8 w-auto"
                            />
                        </a>
                    </div>

                    <div className="hidden lg:flex lg:gap-x-8"> {/* Reduced gap */}
                        {navigation.map((item) => (
                            <a key={item.name} href={item.href} className="text-sm font-semibold leading-6 text-gray-900">
                                {item.name}
                            </a>
                        ))}
                    </div>
                    <div className="hidden lg:flex lg:flex-1 lg:justify-end">
                        <a href="/login" className="text-sm font-semibold leading-6 text-gray-900">
                            Log in <span aria-hidden="true">&rarr;</span>
                        </a>
                    </div>
                </nav>
            </header>

            {/* Main Content */}
            <div className="relative isolate px-4 pt-14 lg:px-6"> {/* Reduced padding */}
                <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-4 py-24 sm:py-22 lg:py-22"> {/* Reduced padding */}
                    {/* Left Div (Text Content) */}
                    <div className="flex flex-col justify-center text-center lg:text-left">
                        <h1 className="text-4xl font-bold tracking-tight text-[#1f2937] sm:text-5xl">
                            Welcome to
                        </h1>

                        <h1 className="text-4xl font-bold tracking-tight text-[#1E40AF] sm:text-6xl">
                            'Scan In Step In'
                        </h1>

                        <p className="mt-4 text-xl leading-8 text-[#f97316] text-base-loose"> {/* Reduced margin */}
                            Scan Faster. Analyze Smarter.
                        </p>

                        <div className="mt-8 flex items-center justify-center lg:justify-start gap-x-6"> {/* Reduced margin */}
                            <a
                                href="/roles"
                                className="rounded-md bg-[#1E40AF] px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm 
                                             hover:bg-blue-900 transition duration-300 ease-in-out
                                                  focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                            >
                                Get Started
                            </a>
                        </div>
                    </div>

                    {/* Right Div (Image Content) */}
                    <div className="flex items-center justify-center lg:justify-end">
                        <img
                            src={landingImage}
                            alt="Landing"
                            className="w-full max-w-lg object-cover rounded-lg"
                        />
                    </div>



                </div>
            </div>
        </div>
    );
}

export default Landing;
