import React, { useEffect, useState } from 'react';
import {
  DemoTitle,
  DemoSubtitle,
  CTAButton,
  HeroBlock,
  CTABlock
} from '../DemoPage.styles';
import { DemoStep } from '../types';
import { getSelectedPersona, SelectedPersona } from '../utils/personaUtils';
import { getWardrobeItems } from '../../../services/wardrobe/items';
import { WardrobeItem, ItemCategory } from '../../../types';

interface WardrobeStepProps {
  onNext: () => void;
  markStepCompleted: (step: DemoStep) => void;
}

const WardrobeStep: React.FC<WardrobeStepProps> = ({ onNext, markStepCompleted }) => {
  const [selectedPersona, setSelectedPersona] = useState<SelectedPersona | null>(null);
  const [wardrobeItems, setWardrobeItems] = useState<WardrobeItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'items' | 'wishlist'>('items');
  
  // Filters state
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [seasonFilter, setSeasonFilter] = useState<string | string[]>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const persona = getSelectedPersona();
    setSelectedPersona(persona);
    
    if (persona) {
      console.log('Current persona in wardrobe step:', persona);
      loadWardrobeData(persona.userId);
    }
  }, []);

  const loadWardrobeData = async (userId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const items = await getWardrobeItems(userId); // Load all items
      setWardrobeItems(items);
      console.log(`Loaded ${items.length} items for ${userId}`);
    } catch (err: any) {
      console.error('Error loading wardrobe data:', err);
      setError(err.message || 'Failed to load wardrobe data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    markStepCompleted(DemoStep.WARDROBE);
    onNext();
  };

  const personaName = selectedPersona?.name || 'your selected persona';

  // Filter items based on active tab
  const filteredItems = wardrobeItems.filter(item => 
    activeTab === 'items' ? !item.wishlist : item.wishlist
  );

  return (
    <div>
      <HeroBlock>
        <DemoTitle>Explore {personaName}'s Wardrobe</DemoTitle>
        <DemoSubtitle>
          Browse through {personaName}'s real wardrobe items and wishlist
        </DemoSubtitle>
      </HeroBlock>

      {/* Demo Wardrobe Interface */}
      <div style={{ 
        background: 'white', 
        borderRadius: '16px', 
        padding: '24px', 
        margin: '20px 0',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
      }}>
        
        {/* Simple Tabs - Only Items and Wishlist */}
        <div style={{ 
          display: 'flex', 
          borderBottom: '1px solid #e5e7eb',
          marginBottom: '24px'
        }}>
          <button 
            onClick={() => setActiveTab('items')}
            style={{
              padding: '12px 16px',
              background: activeTab === 'items' ? '#4f46e5' : 'transparent',
              color: activeTab === 'items' ? 'white' : '#6b7280',
              border: 'none',
              borderRadius: '8px 8px 0 0',
              cursor: 'pointer',
              fontWeight: '500',
              marginRight: '8px'
            }}
          >
            📦 Wardrobe Items ({wardrobeItems.filter(item => !item.wishlist).length})
          </button>
          <button 
            onClick={() => setActiveTab('wishlist')}
            style={{
              padding: '12px 16px',
              background: activeTab === 'wishlist' ? '#4f46e5' : 'transparent',
              color: activeTab === 'wishlist' ? 'white' : '#6b7280',
              border: 'none',
              borderRadius: '8px 8px 0 0',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            ❤️ Wishlist ({wardrobeItems.filter(item => item.wishlist).length})
          </button>
        </div>

        {/* Filters */}
        <div style={{ 
          display: 'flex', 
          gap: '16px', 
          marginBottom: '24px',
          flexWrap: 'wrap'
        }}>
          <input
            type="text"
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              minWidth: '200px'
            }}
          />
          <select 
            value={categoryFilter} 
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '8px'
            }}
          >
            <option value="all">All Categories</option>
            {Object.values(ItemCategory).map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        {/* Loading/Error States */}
        {isLoading && <div style={{ textAlign: 'center', padding: '40px' }}>Loading {personaName}'s wardrobe...</div>}
        {error && <div style={{ color: '#ef4444', textAlign: 'center', padding: '20px' }}>{error}</div>}

        {/* Items Grid */}
        {!isLoading && !error && (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
            gap: '20px' 
          }}>
            {filteredItems
              .filter(item => 
                (categoryFilter === 'all' || item.category === categoryFilter) &&
                (searchQuery === '' || item.name.toLowerCase().includes(searchQuery.toLowerCase()))
              )
              .map(item => (
                <div key={item.id} style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  backgroundColor: '#fff'
                }}>
                  {/* Image */}
                  <div style={{ height: '200px', backgroundColor: '#f3f4f6', position: 'relative' }}>
                    {item.imageUrl ? (
                      <img 
                        src={item.imageUrl} 
                        alt={item.name}
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          objectFit: 'cover' 
                        }}
                      />
                    ) : (
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        height: '100%',
                        color: '#9ca3af'
                      }}>
                        No Image
                      </div>
                    )}
                  </div>
                  
                  {/* Content */}
                  <div style={{ padding: '16px' }}>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '500' }}>
                      {item.name}
                    </h4>
                    
                    {/* Season Tags */}
                    {item.season && item.season.length > 0 && (
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {item.season.flatMap(season => 
                          season === 'spring/fall' ? ['Spring', 'Fall'] : [season]
                        ).map(displaySeason => (
                          <span 
                            key={displaySeason}
                            style={{
                              background: '#e0f2fe',
                              color: '#0369a1',
                              padding: '4px 8px',
                              borderRadius: '12px',
                              fontSize: '12px',
                              textTransform: 'capitalize'
                            }}
                          >
                            {displaySeason}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            }
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredItems.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
            No {activeTab === 'items' ? 'wardrobe items' : 'wishlist items'} found
          </div>
        )}
      </div>

      <CTABlock>
        <CTAButton onClick={handleNext}>
          Continue to AI Check
        </CTAButton>
      </CTABlock>
    </div>
  );
};

export default WardrobeStep;
