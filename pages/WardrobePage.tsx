import React, { useRef, useState, useMemo } from 'react';
import { ClothingItem, Category } from '../types';
import { analyzeImageForClothing } from '../services/geminiService';
import { storageService } from '../services/storageService';
import { ClothingCard } from '../components/ClothingCard';
import { EmptyState } from '../components/EmptyState';
import { UploadIcon, LoaderIcon, SortAscIcon, PlusIcon } from '../components/Icons';

interface WardrobePageProps {
    items: ClothingItem[];
    onItemsUpdate: (newItems: ClothingItem[]) => void;
}

const generateId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const WardrobePage: React.FC<WardrobePageProps> = ({ items, onItemsUpdate }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [processingStatus, setProcessingStatus] = useState('');
    const [filterCategory, setFilterCategory] = useState<Category | 'All'>('All');
    const [sortOption, setSortOption] = useState<'newest' | 'oldest' | 'category'>('newest');

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;
    
        setIsUploading(true);
        const fileList = Array.from(files);
        
        // Copy current items to avoid stale closures
        let currentItems = [...items];
        
        try {
            for (let i = 0; i < fileList.length; i++) {
                const file = fileList[i];
                setProcessingStatus(`Analyzing image ${i + 1} of ${fileList.length}...`);
                
                await new Promise<void>((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = async () => {
                        const base64String = reader.result as string;
                        const base64Data = base64String.split(',')[1];
                        
                        try {
                            const identifiedItems = await analyzeImageForClothing(base64Data);
                            
                            const newItems: ClothingItem[] = identifiedItems.map(analysis => ({
                                id: generateId(),
                                imageUrl: base64String, 
                                category: analysis.category,
                                description: analysis.description,
                                createdAt: Date.now(),
                                tags: []
                            }));
                            
                            // Save individually
                            for(const item of newItems) {
                                await storageService.saveItem(item);
                            }

                            currentItems = [...newItems, ...currentItems];
                            onItemsUpdate(currentItems);

                        } catch (err) {
                            console.error("Error analyzing specific file", file.name, err);
                        }
                        resolve();
                    };
                    reader.readAsDataURL(file);
                });
            }
        } catch (error) {
          console.error("Upload process failed", error);
        } finally {
            setIsUploading(false);
            setProcessingStatus('');
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleDeleteItem = async (id: string) => {
        if (window.confirm("Delete this item?")) {
            await storageService.deleteItem(id);
            onItemsUpdate(items.filter(item => item.id !== id));
        }
    };

    const handleAddTag = async (id: string, tag: string) => {
        const item = items.find(i => i.id === id);
        if (item && !(item.tags || []).includes(tag)) {
            const updatedItem = { ...item, tags: [...(item.tags || []), tag] };
            await storageService.saveItem(updatedItem);
            onItemsUpdate(items.map(i => i.id === id ? updatedItem : i));
        }
    };

    const handleRemoveTag = async (id: string, tagToRemove: string) => {
        const item = items.find(i => i.id === id);
        if (item) {
            const updatedItem = { ...item, tags: (item.tags || []).filter(t => t !== tagToRemove) };
            await storageService.saveItem(updatedItem);
            onItemsUpdate(items.map(i => i.id === id ? updatedItem : i));
        }
    };

    const filteredAndSortedItems = useMemo(() => {
        let result = [...items];
        if (filterCategory !== 'All') {
            result = result.filter(item => item.category === filterCategory);
        }
        result.sort((a, b) => {
            switch (sortOption) {
                case 'newest': return b.createdAt - a.createdAt;
                case 'oldest': return a.createdAt - b.createdAt;
                case 'category': return a.category.localeCompare(b.category);
                default: return 0;
            }
        });
        return result;
    }, [items, filterCategory, sortOption]);

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Wardrobe</h2>
                    <p className="text-gray-500">Manage your digital closet</p>
                </div>
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm transition-all disabled:opacity-70"
                >
                    {isUploading ? <LoaderIcon className="w-4 h-4 animate-spin" /> : <PlusIcon className="w-4 h-4" />}
                    {isUploading ? processingStatus || 'Processing...' : 'Add Items'}
                </button>
                <input type="file" multiple ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
             </div>

             {items.length > 0 && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div className="flex overflow-x-auto no-scrollbar gap-2">
                        {['All', ...Object.values(Category)].map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setFilterCategory(cat as Category | 'All')}
                                className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                                    filterCategory === cat ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <SortAscIcon className="w-4 h-4" />
                        <select 
                            value={sortOption}
                            onChange={(e) => setSortOption(e.target.value as any)}
                            className="bg-transparent font-medium focus:outline-none cursor-pointer"
                        >
                            <option value="newest">Newest Added</option>
                            <option value="oldest">Oldest Added</option>
                            <option value="category">Category</option>
                        </select>
                    </div>
                </div>
             )}

             {items.length === 0 ? (
                 <div className="mt-12">
                     <EmptyState message="Your wardrobe is empty" subMessage="Upload photos to get started." />
                 </div>
             ) : (
                 <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {filteredAndSortedItems.map(item => (
                        <ClothingCard 
                            key={item.id} 
                            item={item} 
                            onDelete={handleDeleteItem} 
                            onAddTag={handleAddTag} 
                            onRemoveTag={handleRemoveTag} 
                        />
                    ))}
                 </div>
             )}
        </div>
    );
};
