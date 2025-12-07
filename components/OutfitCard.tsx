import React from 'react';
import { Outfit, ClothingItem } from '../types';

interface OutfitCardProps {
  outfit: Outfit;
  wardrobe: ClothingItem[];
}

export const OutfitCard: React.FC<OutfitCardProps> = ({ outfit, wardrobe }) => {
  // Map IDs back to full item objects
  const outfitItems = outfit.itemIds
    .map(id => wardrobe.find(item => item.id === id))
    .filter((item): item is ClothingItem => item !== undefined);

  if (outfitItems.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6 last:mb-0 hover:shadow-md transition-shadow">
      <div className="p-5 border-b border-gray-50">
        <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-bold text-gray-900">{outfit.name}</h3>
            <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold">
                {outfit.style}
            </span>
        </div>
        <p className="text-sm text-gray-500">{outfit.description}</p>
      </div>
      
      {/* Scrollable container for outfit items */}
      <div className="p-5 bg-gray-50/50">
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
            {outfitItems.map((item) => (
                <div key={item.id} className="flex-shrink-0 w-32 flex flex-col items-center">
                    <div className="w-32 h-40 rounded-lg overflow-hidden bg-white shadow-sm border border-gray-100 mb-2 relative">
                        <img 
                            src={item.imageUrl} 
                            alt={item.description} 
                            className="w-full h-full object-cover"
                        />
                         <span className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm text-[10px] font-bold text-gray-700 text-center py-1 uppercase tracking-wider">
                            {item.category}
                        </span>
                    </div>
                    <p className="text-xs text-center text-gray-600 line-clamp-2 w-full px-1">
                        {item.description}
                    </p>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};