import React, { useRef, useState } from 'react';
import { UserProfile } from '../types';
import { analyzeUserProfile } from '../services/geminiService';
import { storageService } from '../services/storageService';
import { UserIcon, UploadIcon, LoaderIcon, SparklesIcon } from '../components/Icons';

interface ProfilePageProps {
    profile: UserProfile | null;
    onProfileUpdate: (profile: UserProfile | null) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ profile, onProfileUpdate }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64String = reader.result as string;
            const base64Data = base64String.split(',')[1];
            
            setIsAnalyzing(true);
            try {
                // 1. Analyze for traits
                const traits = await analyzeUserProfile(base64Data);
                
                // 2. Create Profile Object
                const newProfile: UserProfile = {
                    id: 'user-profile',
                    imageUrl: base64String,
                    traits: traits
                };

                // 3. Save
                await storageService.saveUserProfile(newProfile);
                onProfileUpdate(newProfile);

            } catch (e) {
                console.error("Profile update failed", e);
                alert("Could not analyze photo. Please try another one.");
            } finally {
                setIsAnalyzing(false);
            }
        };
        reader.readAsDataURL(file);
        
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleRemoveProfile = async () => {
        if(window.confirm("Delete profile photo and traits?")) {
            await storageService.saveUserProfile({ id: 'user-profile', imageUrl: null, traits: {} });
            onProfileUpdate(null);
        }
    };

    return (
        <div className="max-w-xl mx-auto py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">Your Style Profile</h2>
                    <p className="text-gray-500 mt-2">
                        Upload a photo to let AI analyze your features (skin tone, hair color, body type) for personalized recommendations.
                    </p>
                </div>

                <div className="flex flex-col items-center">
                    <div className="relative group mb-6">
                        <div className={`w-32 h-32 rounded-full overflow-hidden border-4 ${profile?.imageUrl ? 'border-blue-100' : 'border-gray-100 bg-gray-50'} flex items-center justify-center relative`}>
                            {profile?.imageUrl ? (
                                <img src={profile.imageUrl} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <UserIcon className="w-12 h-12 text-gray-300" />
                            )}
                            
                            {isAnalyzing && (
                                <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                                    <LoaderIcon className="w-8 h-8 text-blue-600 animate-spin" />
                                </div>
                            )}
                        </div>
                        
                        {profile?.imageUrl && (
                            <button 
                                onClick={handleRemoveProfile}
                                className="absolute bottom-0 right-0 bg-white shadow-md border border-gray-200 p-2 rounded-full text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors"
                            >
                                <span className="sr-only">Delete</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                            </button>
                        )}
                    </div>

                    <div className="w-full text-center">
                         <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handlePhotoUpload} 
                            accept="image/*" 
                            className="hidden" 
                        />
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isAnalyzing}
                            className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-70"
                        >
                            {isAnalyzing ? 'Analyzing...' : (profile?.imageUrl ? 'Update Photo' : 'Upload Photo')}
                            {!isAnalyzing && <UploadIcon className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                {profile?.imageUrl && (
                    <div className="mt-10 border-t border-gray-100 pt-8">
                        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <SparklesIcon className="w-4 h-4 text-amber-500" />
                            AI Extracted Traits
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-center">
                                <span className="block text-xs text-gray-500 mb-1">Skin Tone</span>
                                <span className="font-medium text-gray-900">{profile.traits.skinTone || 'Unknown'}</span>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-center">
                                <span className="block text-xs text-gray-500 mb-1">Hair Color</span>
                                <span className="font-medium text-gray-900">{profile.traits.hairColor || 'Unknown'}</span>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-center">
                                <span className="block text-xs text-gray-500 mb-1">Body Type</span>
                                <span className="font-medium text-gray-900">{profile.traits.bodyType || 'Unknown'}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
