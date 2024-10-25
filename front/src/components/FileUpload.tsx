"use client";

import React, {useState, useCallback, useEffect} from 'react';
import {Upload, X} from 'lucide-react';

interface UploadStatus {
    type: 'success' | 'error';
    message: string;
}

export function FileUpload() {
    const [fileContent, setFileContent] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string>('');
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [uploadStatus, setUploadStatus] = useState<UploadStatus | null>(null);
    const [dragCounter, setDragCounter] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        if (uploadStatus) {
            timeoutId = setTimeout(() => {
                setUploadStatus(null);
            }, 5000); // 5 secondes
        }

        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [uploadStatus]);

    const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDragIn = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragCounter(prev => prev + 1);
        if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
            setIsDragging(true);
        }
    }, []);

    const handleDragOut = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragCounter(prev => prev - 1);
        if (dragCounter - 1 === 0) {
            setIsDragging(false);
        }
    }, [dragCounter]);

    const handleFile = useCallback((file: File) => {
        if (file && file.type === 'text/plain') {
            setFileName(file.name);
            const reader = new FileReader();
            reader.onload = (e: ProgressEvent<FileReader>) => {
                const result = e.target?.result as string;
                setFileContent(result);
                setUploadStatus({
                    type: 'success',
                    message: 'File loaded successfully!'
                });
            };
            reader.onerror = () => {
                setUploadStatus({
                    type: 'error',
                    message: 'Error reading file.'
                });
            };
            reader.readAsText(file);
        } else {
            setUploadStatus({
                type: 'error',
                message: 'Please upload a valid text file (.txt)'
            });
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        setDragCounter(0);
        const file = e.dataTransfer.files[0];
        handleFile(file);
    }, [handleFile]);

    const resetFile = () => {
        setFileContent(null);
        setFileName('');
        setUploadStatus(null);
    };

    const handleSave = async () => {
        if (!fileContent || !fileName) {
            setUploadStatus({
                type: 'error',
                message: 'No file selected'
            });
            return;
        }

        setIsLoading(true);
        console.log('Starting upload process...');

        try {
            const response = await fetch('http://localhost:8080/api/upload', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    content: fileContent,
                    fileName: fileName
                })
            });

            console.log('Response status:', response.status);

            const text = await response.text();
            const data = text ? JSON.parse(text) : {};

            console.log('Response data:', data);

            if (response.ok) {
                setUploadStatus({
                    type: 'success',
                    message: `File uploaded successfully as ${data.fileName}`
                });
            } else {
                throw new Error(data.error || `Upload failed with status ${response.status}`);
            }
        } catch (error) {
            console.error('Error:', error);
            setUploadStatus({
                type: 'error',
                message: error instanceof Error ? error.message : 'An error occurred while uploading'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full transition-all duration-300">
            {/* Zone de dépôt */}
            <div
                onDragEnter={handleDragIn}
                onDragLeave={handleDragOut}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`
                    relative rounded-lg sm:rounded-xl lg:rounded-2xl 
                    border-2 border-dashed
                    transition-all duration-300 ease-in-out
                    p-4 sm:p-6 md:p-8 lg:p-12
                    min-h-[160px] sm:min-h-[200px] lg:min-h-[240px]
                    flex items-center justify-center
                    group
                    ${isDragging
                    ? 'border-blue-500 bg-blue-50 scale-[1.02] shadow-lg'
                    : 'border-gray-300 hover:border-gray-400 bg-white/50 hover:shadow-md'
                }
                `}
            >
                <input
                    type="file"
                    accept=".txt"
                    onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />

                <div className="flex flex-col items-center gap-3 sm:gap-4 md:gap-6">
                    <div className={`
                        p-3 sm:p-4 md:p-5
                        rounded-full bg-gray-100
                        transition-all duration-300
                        ${isDragging ? 'bg-blue-100 scale-110' : 'group-hover:bg-gray-200'}
                    `}>
                        <Upload className={`
                            h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10
                            transition-colors duration-300
                            ${isDragging ? 'text-blue-500' : 'text-gray-600 group-hover:text-gray-800'}
                        `}/>
                    </div>
                    <div className="text-center space-y-1 sm:space-y-2">
                        <p className="text-base sm:text-lg md:text-xl font-medium text-gray-700">
                            Drop your file here, or <span className="text-blue-500">browse</span>
                        </p>
                        <p className="text-xs sm:text-sm md:text-base text-gray-500">
                            Supports .txt files
                        </p>
                    </div>
                </div>
            </div>

            {/* Affichage du contenu du fichier */}
            {fileContent && (
                <div
                    className="mt-4 sm:mt-6 md:mt-8 bg-white rounded-lg sm:rounded-xl lg:rounded-2xl border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <div className="text-sm font-medium text-gray-900">{fileName}</div>
                            </div>
                            <button
                                onClick={resetFile}
                                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="h-5 w-5 text-gray-500"/>
                            </button>
                        </div>
                    </div>
                    <div className="p-3 sm:p-4 md:p-6">
                        <pre
                            className="whitespace-pre-wrap text-xs sm:text-sm md:text-base text-gray-700 max-h-48 sm:max-h-64 md:max-h-96 overflow-y-auto">
                            {fileContent}
                        </pre>
                        <div className="mt-4">
                            <button
                                onClick={handleSave}
                                disabled={isLoading}
                                className={`
                                    w-full py-2.5 sm:py-3 px-4 rounded-lg
                                    text-sm sm:text-base font-medium
                                    transition-all duration-200
                                    ${isLoading
                                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                                }
                                `}
                            >
                                {isLoading ? 'Uploading...' : 'Upload File'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Notification avec auto-dismiss */}
            {uploadStatus && (
                <div className={`
                    fixed top-4 right-4 
                    p-3 sm:p-4
                    rounded-lg shadow-lg
                    transition-all duration-300
                    max-w-[calc(100vw-2rem)] sm:max-w-sm
                    z-50 animate-notification
                    ${uploadStatus.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}
                `}>
                    <div className="flex items-center justify-between gap-2">
                        <p className="text-xs sm:text-sm md:text-base flex-1">
                            {uploadStatus.message}
                        </p>
                        <button
                            onClick={() => setUploadStatus(null)}
                            className="p-1 hover:bg-gray-200/20 rounded-full transition-colors"
                        >
                            <X className="h-4 w-4"/>
                        </button>
                    </div>
                    <div className="absolute bottom-0 left-0 h-1 bg-current opacity-20 w-full">
                        <div
                            className="h-full bg-current opacity-50 animate-progress"
                            style={{animationDuration: '5s'}}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
