"use client";

import {FileUpload} from '@/components/FileUpload';

export default function Home() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-4 md:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="text-center space-y-3 sm:space-y-4 mb-8 sm:mb-12 lg:mb-16">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl
                         font-bold text-gray-900 tracking-tight
                         px-4 max-w-4xl mx-auto
                         transition-all duration-300">
                        Upload Your Files
                    </h1>
                    <p className="text-base sm:text-lg md:text-xl text-gray-500
                        max-w-xl sm:max-w-2xl mx-auto px-4
                        transition-all duration-300">
                        Seamlessly process and manage your text files
                    </p>
                </div>

                {/* Main Content */}
                <div
                    className="max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto">
                    <FileUpload/>
                </div>
            </div>
        </div>
    );
}
