import React from 'react';
import { Monitor, LogIn, X } from 'lucide-react';

interface DeviceConflictModalProps {
    onForceLogin: () => void;
    onCancel: () => void;
    isLoading?: boolean;
}

const DeviceConflictModal: React.FC<DeviceConflictModalProps> = ({
    onForceLogin,
    onCancel,
    isLoading = false,
}) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl relative">

                {/* Close button */}
                <button
                    onClick={onCancel}
                    className="absolute top-4 right-4 p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Icon */}
                <div className="flex justify-center mb-5">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                        <Monitor className="w-8 h-8 text-orange-500" />
                    </div>
                </div>

                {/* Text */}
                <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
                    Already Logged In
                </h2>
                <p className="text-gray-500 text-center text-sm mb-6 leading-relaxed">
                    Your account is currently active on another device. You can either go back, or force login here which will log out the other device.
                </p>

                {/* Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        disabled={isLoading}
                        className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onForceLogin}
                        disabled={isLoading}
                        className="flex-1 py-3 rounded-xl bg-orange-500 text-white font-medium hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isLoading ? (
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <LogIn className="w-4 h-4" />
                        )}
                        Login Anyway
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeviceConflictModal;