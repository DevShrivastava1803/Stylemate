import React from 'react';
import { ClothingItem } from '../types';
import { TrashIcon, PlusIcon } from './Icons';

interface ClothingCardProps {
  item: ClothingItem;
  onDelete: (id: string) => void;
  onAddTag: (id: string, tag: string) => void;
  onRemoveTag: (id: string, tag: string) => void;
}

export const ClothingCard: React.FC<ClothingCardProps> = ({ item, onDelete, onAddTag, onRemoveTag }) => {
  const handleAddTagClick = () => {
    const tag = prompt("Enter a new tag for this item (e.g., 'Summer', 'Work'):");
    if (tag && tag.trim()) {
      onAddTag(item.id, tag.trim());
    }
  };

  return (
    <div className="group relative bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col h-full">
      <div className="aspect-[4/5] w-full bg-gray-50 relative overflow-hidden">
        <img 
          src={item.imageUrl} 
          alt={item.description} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
        <button
          onClick={() => onDelete(item.id)}
          className="absolute top-2 right-2 bg-white/90 p-2 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:text-red-500 z-10"
          title="Delete Item"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-1">
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 text-[10px] font-medium text-gray-600 uppercase tracking-wide">
             {item.category}
          </span>
        </div>
        <p className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug mb-3">
          {item.description}
        </p>
        
        {/* Tags Section */}
        <div className="mt-auto pt-2 flex flex-wrap gap-1.5">
            {item.tags?.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-medium border border-indigo-100">
                    {tag}
                    <button 
                        onClick={() => onRemoveTag(item.id, tag)}
                        className="hover:text-red-500 rounded-full p-0.5"
                    >
                        &times;
                    </button>
                </span>
            ))}
            <button 
                onClick={handleAddTagClick}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-50 text-gray-500 border border-gray-200 text-[10px] hover:bg-gray-100 transition-colors"
            >
                <PlusIcon className="w-3 h-3" />
                Tag
            </button>
        </div>
      </div>
    </div>
  );
};