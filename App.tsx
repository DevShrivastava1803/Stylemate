import React, { useState, useEffect } from 'react';
import { ClothingItem, Outfit, UserProfile } from './types';
import { storageService } from './services/storageService';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { WardrobePage } from './pages/WardrobePage';
import { ProfilePage } from './pages/ProfilePage';
import { OutfitsPage } from './pages/OutfitsPage';
import { LoaderIcon } from './components/Icons';
import { initGoogleAuth, signOutGoogle, type AuthUser } from './services/authService';
import { LoginPage } from './pages/LoginPage';

function App() {
  const [activeTab, setActiveTab] = useState<'wardrobe' | 'profile' | 'outfits'>('wardrobe');
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [loadedItems, loadedOutfits, loadedProfile] = await Promise.all([
          storageService.getAllItems(),
          storageService.getAllOutfits(),
          storageService.getUserProfile()
        ]);
        
        setItems(loadedItems);
        setOutfits(loadedOutfits);
        setProfile(loadedProfile);
      } catch (e) {
        console.error("Failed to load data from storage", e);
      } finally {
        setIsInitializing(false);
      }
    };
    
    loadData();
  }, []);

  useEffect(() => {
    // Initialize Google Sign-In and render the button into header
    const buttonEl = document.getElementById('google-signin-button') || undefined;
    initGoogleAuth((u) => setUser(u), buttonEl);
  }, []);

  const handleSignOut = () => {
    signOutGoogle();
    setUser(null);
  };

  if (isInitializing) {
      return (
          <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
              <LoaderIcon className="w-8 h-8 text-blue-600 animate-spin mb-4" />
              <p className="text-gray-500 font-medium">Loading StyleMate...</p>
          </div>
      );
  }

  if (!user) {
    // Gate the app behind authentication
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-20">
      <Header user={user} onSignOut={handleSignOut} />
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} itemsCount={items.length} />

      <main className="max-w-4xl mx-auto w-full px-4 py-8">
        {activeTab === 'wardrobe' && (
          <WardrobePage items={items} onItemsUpdate={setItems} />
        )}
        {activeTab === 'profile' && (
          <ProfilePage profile={profile} onProfileUpdate={setProfile} />
        )}
        {activeTab === 'outfits' && (
          <OutfitsPage items={items} outfits={outfits} profile={profile} onOutfitsUpdate={setOutfits} />
        )}
      </main>
    </div>
  );
}

export default App;
