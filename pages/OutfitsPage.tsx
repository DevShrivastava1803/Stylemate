import React, { useState } from 'react';
import { Outfit, ClothingItem, UserProfile, GeneratedOutfitRaw } from '../types';
import { generateOutfitsFromWardrobe } from '../services/geminiService';
import { storageService } from '../services/storageService';
import { OutfitCard } from '../components/OutfitCard';
import { EmptyState } from '../components/EmptyState';
import { SparklesIcon, LoaderIcon } from '../components/Icons';

interface OutfitsPageProps {
    items: ClothingItem[];
    outfits: Outfit[];
    profile: UserProfile | null;
    onOutfitsUpdate: (outfits: Outfit[]) => void;
}

const generateId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const OutfitsPage: React.FC<OutfitsPageProps> = ({ items, outfits, profile, onOutfitsUpdate }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [styleRequest, setStyleRequest] = useState('');

    const handleGenerate = async () => {
        if (items.length < 2) {
            alert("Please add more items to your wardrobe first.");
            return;
        }

        setIsGenerating(true);
        try {
            // Prepare inputs
            const userPhotoData = profile?.imageUrl ? profile.imageUrl.split(',')[1] : undefined;
            const userTraits = profile?.traits;

            const generatedRaw = await generateOutfitsFromWardrobe(items, userPhotoData, userTraits, styleRequest.trim() || undefined);
            
            const newOutfits: Outfit[] = generatedRaw.map(raw => ({
                id: generateId(),
                name: raw.name,
                style: raw.styleTags.join(', '), // Map array to string for display consistency if needed, or update Outfit type to use array
                tags: raw.styleTags,
                description: raw.reasoning,
                itemIds: raw.itemIds
            }));

            // Save all
            for (const o of newOutfits) {
                await storageService.saveOutfit(o);
            }

            // Replace current list to show fresh batch
            onOutfitsUpdate(newOutfits);
        } catch (e) {
            console.error("Generation failed", e);
            alert("Failed to generate outfits. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
             <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Outfits</h2>
                    <p className="text-gray-500">AI-curated looks for you</p>
                </div>
                <div className="flex w-full sm:w-auto items-center gap-3">
                  <input
                    value={styleRequest}
                    onChange={(e) => setStyleRequest(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && items.length >= 2 && !isGenerating) handleGenerate();
                    }}
                    disabled={isGenerating}
                    placeholder="Add a request (e.g., wedding guest, warm colors)"
                    className="flex-1 sm:w-96 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                  {items.length >= 2 && (
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-md shadow-blue-100 flex items-center gap-2 transition-all disabled:opacity-70"
                    >
                        {isGenerating ? <LoaderIcon className="w-4 h-4 animate-spin" /> : <SparklesIcon className="w-4 h-4" />}
                        {isGenerating ? 'Styling...' : 'Generate New Looks'}
                    </button>
                  )}
                </div>
             </div>

            {outfits.length === 0 && !isGenerating ? (
                <div className="mt-12">
                    <EmptyState 
                        message="No outfits generated yet" 
                        subMessage={items.length < 2 ? "Add at least 2 items to your wardrobe to get started." : "Click the button above to create your first looks."} 
                    />
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-8">
                     {/* Show loading skeleton overlay or similar if needed, but button state covers it */}
                     {outfits.map(outfit => (
                         <OutfitCard key={outfit.id} outfit={outfit} wardrobe={items} />
                     ))}
                </div>
            )}
        </div>
    );
};
