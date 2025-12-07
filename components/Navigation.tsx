import React from 'react';

interface NavigationProps {
  activeTab: 'wardrobe' | 'profile' | 'outfits';
  setActiveTab: (tab: 'wardrobe' | 'profile' | 'outfits') => void;
  itemsCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab, itemsCount }) => {
  const tabs = [
    { id: 'wardrobe', label: `Wardrobe (${itemsCount})` },
    { id: 'profile', label: 'Profile' },
    { id: 'outfits', label: 'Outfits' },
  ] as const;

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-4 flex gap-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 pt-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};
