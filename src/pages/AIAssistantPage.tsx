import React, { useState, useEffect } from 'react';
import { WardrobeItem, WishlistStatus, UserActionStatus } from '../types';
import { DetectedTags } from '../services/formAutoPopulation/types';
import { detectImageTags } from '../services/ximilarService';
import { claudeService } from '../services/claudeService';
import { useWardrobe } from '../context/WardrobeContext';
import { getScenarioNamesForFilters } from '../utils/scenarioUtils';
import { mockHistoryItems } from '../mocks/aiAssistantMockData';
import PageHeader from '../components/layout/Header/Header';
import AIHistoryDashboard from '../components/features/ai-assistant/AIHistoryDashboard/AIHistoryDashboard';
import AICheckCard from '../components/features/ai-assistant/AICheckCard/AICheckCard';
import AIRecommendationCard from '../components/features/ai-assistant/AIRecommendationCard/AIRecommendationCard';
import AIHistorySection from '../components/features/ai-assistant/AIHistorySection/AIHistorySection';
import WishlistSelectionModal from '../components/features/ai-assistant/modals/WishlistSelectionModal/WishlistSelectionModal';
import AICheckResultModal from '../components/features/ai-assistant/modals/AICheckResultModal/AICheckResultModal';
import RecommendationModal from '../components/features/ai-assistant/modals/RecommendationModal/RecommendationModal';
import HistoryDetailModal from '../components/features/ai-assistant/modals/HistoryDetailModal/HistoryDetailModal';
import { PageContainer } from '../components/layout/PageContainer';
import {
  CardsContainer,
} from './AIAssistantPage.styles';

const AIAssistantPage: React.FC = () => {
  const { items, addItem } = useWardrobe();
  
  // State for AI Check
  const [imageLink, setImageLink] = useState('');
  const [itemCheckResponse, setItemCheckResponse] = useState<string | null>(null);
  const [isFileUpload, setIsFileUpload] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // State for Wishlist Selection Modal
  const [isWishlistModalOpen, setIsWishlistModalOpen] = useState(false);
  
  // State for AI Check Result Modal
  const [isCheckResultModalOpen, setIsCheckResultModalOpen] = useState(false);
  const [itemCheckScore, setItemCheckScore] = useState<number | undefined>(undefined);
  const [itemCheckStatus, setItemCheckStatus] = useState<WishlistStatus | undefined>(undefined);
  
  // States for error information from Claude API
  const [errorType, setErrorType] = useState<string>('');
  const [errorDetails, setErrorDetails] = useState<string>('');

  // State for Recommendation Modal
  const [isRecommendationModalOpen, setIsRecommendationModalOpen] = useState(false);
  const [recommendationText, setRecommendationText] = useState('');
  
  // State for History Detail Modal
  const [isHistoryDetailModalOpen, setIsHistoryDetailModalOpen] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<any>(null);
  
  // State for AI Recommendation
  // Removed unused state variables: occasion, season, preferences
  const [error, setError] = useState<string>('');
  const [isCheckLoading, setIsCheckLoading] = useState<boolean>(false);
  const [isRecommendationLoading, setIsRecommendationLoading] = useState<boolean>(false);
  
  // State for extracted tags
  const [extractedTags, setExtractedTags] = useState<DetectedTags | null>(null);
  
  // Season and Scenario state for AI Recommendation
  const [selectedSeason, setSelectedSeason] = useState<string>('all');
  const [selectedScenario, setSelectedScenario] = useState<string>('all');
  const [scenarioOptions, setScenarioOptions] = useState<string[]>([]);
  const [loadingScenarios, setLoadingScenarios] = useState(false);
  
  // History view state
  const [showFullHistory, setShowFullHistory] = useState(false);
  
  // State for filtering activities
  const [activityFilter, setActivityFilter] = useState('all');
  const [checkStatusFilter, setCheckStatusFilter] = useState('all');
  const [userActionFilter, setUserActionFilter] = useState('all');
  
  // Load scenario options when component mounts
  useEffect(() => {
    const loadScenarioOptions = async () => {
      setLoadingScenarios(true);
      try {
        const options = await getScenarioNamesForFilters();
        setScenarioOptions(options);
      } catch (err) {
        console.error('Error loading scenario options:', err);
      } finally {
        setLoadingScenarios(false);
      }
    };
    
    loadScenarioOptions();
  }, []);
  
  // State for history data
  const [historyItems, setHistoryItems] = useState(mockHistoryItems);

  const handleCheckItem = async () => {
    if (!imageLink.trim()) {
      setError('Please provide an image link to check.');
      return;
    }

    setIsCheckLoading(true);
    setError('');
    setItemCheckResponse(null);
    setItemCheckScore(undefined);
    setItemCheckStatus(undefined);
    setExtractedTags(null);

    try {
      setIsCheckLoading(true);
      setError('');
      
      // Define an async function to perform the check
      const performCheck = async () => {
        try {
          // Will store our analysis result from Claude
          let analysisResult = '';
          let score = 0;
          let status: WishlistStatus = WishlistStatus.NOT_REVIEWED;
          let base64Image = ''; // Store the base64 image data for use throughout the function
          
          // First we'll extract tags from the image using Ximilar API
          let detectedTags: DetectedTags | null = null;
          
          // Extract real tags using the ximilarService
          try {
            // First fetch and convert the image to base64 to avoid URL access errors
            const fetchImageAsBase64 = async (url: string) => {
              try {
                // Validate URL before attempting to fetch
                if (!url || !url.match(/^(http|https|data|blob):/i)) {
                  throw new Error(`Invalid image URL format: ${url}`);
                }

                // Special handling for data URLs (already base64)
                if (url.startsWith('data:')) {
                  console.log('[AIAssistantPage] URL is already a data URL, returning as-is');
                  return url;
                }

                // Special handling for blob URLs - fetch them directly without proxy
                if (url.startsWith('blob:')) {
                  console.log('[AIAssistantPage] Processing blob URL:', url);
                  console.log('[AIAssistantPage] Blob URL details - origin:', new URL(url).origin, 'pathname:', new URL(url).pathname);
                  try {
                    console.log('[AIAssistantPage] Attempting to fetch blob URL directly');
                    const response = await fetch(url);
                    
                    // Log response details for debugging
                    console.log('[AIAssistantPage] Blob fetch response status:', response.status);
                    console.log('[AIAssistantPage] Blob fetch response headers:', JSON.stringify(Array.from(response.headers.entries())));
                    
                    if (!response.ok) {
                      throw new Error(`Blob URL fetch failed with status: ${response.status}`);
                    }
                    
                    const blobData = await response.blob();
                    console.log('[AIAssistantPage] Blob URL fetch successful, size:', blobData.size);
                    
                    if (blobData.size === 0) {
                      throw new Error('Fetched blob has zero size');
                    }
                    
                    // Convert blob to base64
                    return new Promise((resolve, reject) => {
                      const reader = new FileReader();
                      reader.onload = () => {
                        const result = reader.result as string;
                        console.log('[AIAssistantPage] Blob to base64 conversion successful, length:', result.length);
                        resolve(result);
                      };
                      reader.onerror = (e) => {
                        console.error('[AIAssistantPage] FileReader error for blob URL:', e);
                        reject(new Error('Failed to convert blob URL to base64'));
                      };
                      reader.readAsDataURL(blobData);
                    });
                  } catch (error: any) {
                    console.error('[AIAssistantPage] Error processing blob URL:', error);
                    throw new Error(`Failed to process blob URL: ${error?.message || 'Unknown error'}`);
                  }
                }

                let blob: Blob;
                
                // First try with direct fetch
                try {
                  console.log('[AIAssistantPage] Attempting direct fetch of image');
                  const response = await fetch(url, { 
                    mode: 'cors',
                    headers: {
                      'Accept': 'image/*'
                    }
                  });
                  
                  if (!response.ok) {
                    throw new Error(`Direct fetch failed with status: ${response.status}`);
                  }
                  
                  // Get content type to verify it's an image
                  const contentType = response.headers.get('Content-Type');
                  if (!contentType || !contentType.startsWith('image/')) {
                    throw new Error(`URL did not return an image: ${contentType}`);
                  }
                  
                  blob = await response.blob();
                  console.log('[AIAssistantPage] Direct fetch successful, blob size:', blob.size);
                  
                  // Verify blob has content
                  if (blob.size === 0) {
                    throw new Error('Fetched image has zero size');
                  }
                } catch (error) {
                  console.log('[AIAssistantPage] Direct fetch failed, trying proxy:', error);
                  
                  // If direct fetch fails, try using the imageProxyService
                  console.log('[AIAssistantPage] Using imageProxyService as fallback');
                  const { fetchImageSafely } = await import('../services/imageProxyService');
                  const result = await fetchImageSafely(url);
                  
                  if (!result || !result.blob) {
                    throw new Error('Image proxy service returned no data');
                  }
                  
                  blob = result.blob;
                  console.log('[AIAssistantPage] Proxy fetch successful, blob size:', blob.size);
                  
                  // Verify blob has content
                  if (blob.size === 0) {
                    throw new Error('Proxied image has zero size');
                  }
                }
                
                // Convert blob to base64
                return new Promise((resolve, reject) => {
                  const reader = new FileReader();
                  reader.onload = () => {
                    const result = reader.result as string;
                    console.log('[AIAssistantPage] Base64 conversion successful, length:', result.length);
                    resolve(result);
                  };
                  reader.onerror = (e) => {
                    console.error('[AIAssistantPage] FileReader error:', e);
                    reject(new Error('Failed to convert image to base64'));
                  };
                  reader.readAsDataURL(blob);
                });
              } catch (error) {
                console.error('[AIAssistantPage] Error fetching image as base64:', error);
                throw error;
              }
            };
            
            // Validate imageLink before attempting to fetch
            if (!imageLink || typeof imageLink !== 'string' || !imageLink.trim()) {
              console.error('[AIAssistantPage] Invalid image URL:', imageLink);
              throw new Error('Invalid image URL. Please check the image source.');
            }
            
            // Convert image URL to base64 first
            console.log('[AIAssistantPage] Converting image to base64 before sending to Ximilar:', imageLink);
            base64Image = await fetchImageAsBase64(imageLink) as string;
            
            // Check if base64Image has adequate data
            if (!base64Image || typeof base64Image !== 'string' || base64Image.length < 100) {
              console.error('[AIAssistantPage] Converted base64 image is too small or invalid:', 
                typeof base64Image === 'string' ? `Length: ${base64Image.length}` : 'not a string');
              throw new Error('Image conversion failed or produced invalid data.');
            }
            
            console.log('[AIAssistantPage] Image converted to base64 successfully. Length:', base64Image.length);
            
            // Now use the base64 image for tag detection instead of the URL
            console.log('[AIAssistantPage] Sending base64 image to Ximilar API');
            
            // Use extractTopTags approach from useImageHandling for consistent tag extraction
            try {
              // Get the tag response
              const tagResponse = await detectImageTags(base64Image);
              console.log('[AIAssistantPage] Raw ximilar tag response:', tagResponse);
              
              // Use the extractTopTags helper function for consistent tag extraction
              const { extractTopTags } = await import('../services/ximilarService');
              const topTags = extractTopTags(tagResponse);
              console.log('[AIAssistantPage] Extracted top tags:', topTags);
              
              // Convert to DetectedTags format
              const detectedTags: DetectedTags = {};
              
              // Map extracted tags to our DetectedTags format (consistent with WardrobeItemForm)
              Object.entries(topTags).forEach(([key, value]) => {
                // Map known keys to our format
                switch(key) {
                  case 'category':
                    detectedTags.category = value;
                    break;
                  case 'subcategory':
                    detectedTags.subcategory = value;
                    break;
                  case 'color':
                    detectedTags.color = value;
                    break;
                  case 'pattern':
                    detectedTags.pattern = value;
                    break;
                  case 'material':
                    detectedTags.material = value;
                    break;
                  case 'brand':
                    detectedTags.brand = value;
                    break;
                  case 'style':
                    detectedTags.style = value;
                    break;
                  case 'sleeve_length':
                    detectedTags.sleeve = value;
                    break;
                  case 'neckline':
                    detectedTags.neckline = value;
                    break;
                  default:
                    // For any other tags, add them as-is
                    detectedTags[key] = value;
                    break;
                }
              });
              
              // Add a description based on the collected tags
              const descriptionParts = [];
              if (detectedTags.color) descriptionParts.push(detectedTags.color);
              if (detectedTags.material) descriptionParts.push(detectedTags.material);
              if (detectedTags.sleeve) descriptionParts.push(detectedTags.sleeve);
              if (detectedTags.neckline) descriptionParts.push(detectedTags.neckline);
              if (detectedTags.subcategory) descriptionParts.push(detectedTags.subcategory);
              
              if (descriptionParts.length > 0) {
                detectedTags.description = descriptionParts.join(' ');
              }
              
              // Log the extracted tags
              console.log('[AIAssistantPage] Final processed tags:', detectedTags);
              
              // Store the extracted tags for potential use in the form
              setExtractedTags(detectedTags);
            } catch (error) {
              console.error('[AIAssistantPage] Error detecting or processing tags:', error);
              // Create a minimal tag object with fallback values instead of empty object
              const fallbackTags: DetectedTags = {
                category: 'Unknown',
                description: 'Item details could not be detected'
              };
              console.log('[AIAssistantPage] Using fallback tags:', fallbackTags);
              setExtractedTags(fallbackTags);
              detectedTags = fallbackTags;
            }
          } catch (tagError) {
            console.error('[AIAssistantPage] Error in tag extraction process:', tagError);
            // Use consistent fallback tags here too
            const fallbackTags: DetectedTags = {
              category: 'Unknown',
              description: 'Item details could not be detected'
            };
            console.log('[AIAssistantPage] Using fallback tags after error:', fallbackTags);
            setExtractedTags(fallbackTags);
            detectedTags = fallbackTags;
          }
            
          // Reset error information state
          setErrorType('');
          setErrorDetails('');
            
          try {
            console.log('[AIAssistantPage] Calling Claude API for wardrobe item analysis');
              
            // Call Claude API to analyze the image with the base64 data, not the URL
            const claudeResult = await claudeService.analyzeWardrobeItem(base64Image, detectedTags || undefined);
              
            // Check if there's an error from Claude service
            if (claudeResult.error) {
              console.warn('[AIAssistantPage] Claude service returned error:', claudeResult.error, claudeResult.details);
              setErrorType(claudeResult.error);
              setErrorDetails(claudeResult.details || 'No additional details provided');
              analysisResult = 'We encountered an issue analyzing this item. See details below.';
              score = 5.0;
              status = WishlistStatus.POTENTIAL_ISSUE;
            } else {
              // Extract analysis, score and determine status
              analysisResult = claudeResult.analysis + '\n\n' + claudeResult.feedback;
              score = claudeResult.score;
                
              // Set status based on score - binary outcome (either APPROVED or POTENTIAL_ISSUE)
              if (score >= 7) {
                status = WishlistStatus.APPROVED;
              } else {
                status = WishlistStatus.POTENTIAL_ISSUE;
              }
                
              console.log('[AIAssistantPage] Claude analysis complete:', { analysisResult, score, status });
            }
          } catch (claudeError: any) {
            console.error('[AIAssistantPage] Error calling Claude API:', claudeError);
            analysisResult = 'We were unable to analyze this item properly. Please try again or try with a different image.';
            score = 5.0;
            status = WishlistStatus.POTENTIAL_ISSUE;
              
            // Extract error information if available
            setErrorType(claudeError.error || 'unknown_error');
            setErrorDetails(claudeError.details || claudeError.message || 'An unexpected error occurred');
          }
            
          // Update state with Claude's response and any error information
          setItemCheckResponse(analysisResult);
          setItemCheckScore(score);
          setItemCheckStatus(status);
          setIsCheckResultModalOpen(true);
        } catch (checkError) {
          console.error('Error in check process:', checkError);
          setError('An error occurred while processing this item. Please try again.');
        } finally {
          setIsCheckLoading(false);
        }
      };
      
      // Simulate a delay and then perform the check
      setTimeout(() => {
        performCheck();
      }, 1500);
      
    } catch (err) {
      setError('An error occurred while checking this item. Please try again.');
      console.error('Error checking item:', err);
      setIsCheckLoading(false);
    }
  };

  const handleGetRecommendation = async () => {
    if (!items || items.length === 0) {
      setError('You need to add some items to your wardrobe first!');
      return;
    }

    setError('');
    setIsRecommendationLoading(true);
    
    // Simulate API delay for realistic loading behavior
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate a mock recommendation
    const mockRecommendations = [
      "For a casual day out, try pairing your navy blue jeans with the white cotton t-shirt and layer with the denim jacket. Complete the look with white sneakers for a relaxed, comfortable style.",
      "Create an elegant evening look by combining your black dress with the leather jacket. Add heeled boots and minimal jewelry for a sophisticated yet edgy appearance.",
      "For a professional setting, pair your tailored blazer with dark trousers and a crisp white shirt. Add leather loafers and a classic watch to complete this polished business look.",
      "Weekend vibes call for your favorite sweater with comfortable joggers. Layer with a casual cardigan and finish with your go-to sneakers for the perfect cozy-chic ensemble.",
      "Make a statement with your printed midi dress paired with ankle boots and a structured handbag. Add a light scarf for both style and versatility."
    ];
    
    const randomRecommendation = mockRecommendations[Math.floor(Math.random() * mockRecommendations.length)];
    setRecommendationText(randomRecommendation);
    setIsRecommendationLoading(false);
    setIsRecommendationModalOpen(true);
  };

  // handleGenerateCapsule function removed to fix ESLint warning

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('File uploaded:', file.name);
      // Create a local URL for preview
      const url = URL.createObjectURL(file);
      setImageLink(url);
      setIsFileUpload(true);
      setUploadedFile(file);
    }
  };

  // Handle processed image from background removal
  const handleProcessedImageChange = (processedImageUrl: string, processedImageBlob: Blob) => {
    console.log('Processed image received from background removal');
    // Update the image link to the processed image URL
    setImageLink(processedImageUrl);
    
    // Create a new File object from the blob for potential API uploads
    if (uploadedFile) {
      const processedFile = new File([processedImageBlob], uploadedFile.name, {
        type: processedImageBlob.type || uploadedFile.type
      });
      setUploadedFile(processedFile);
    }
  };

  // Handle view all click
  const handleViewAllHistory = () => {
    setShowFullHistory(true);
  };

  // Handle back to main view
  const handleBackToMain = () => {
    setShowFullHistory(false);
  };

  // Filter history items based on selected filter
  const getFilteredHistoryItems = (items: typeof historyItems) => {
    let filtered = items;
    
    // Filter by activity type
    if (activityFilter !== 'all') {
      filtered = filtered.filter(item => item.type === activityFilter);
    }
    
    // Filter by check status (only applies to check items)
    if (checkStatusFilter !== 'all') {
      filtered = filtered.filter(item => {
        // Only show check items with matching status
        if (item.type === 'check') {
          return item.status === checkStatusFilter;
        }
        // Hide recommendation items when check status filter is active
        return false;
      });
    }
    
    // Filter by user action status (applies to all items)
    if (userActionFilter !== 'all') {
      filtered = filtered.filter(item => item.userActionStatus === userActionFilter);
    }
    
    return filtered;
  };
  
  // Get filtered history items for dashboard view
  const filteredHistoryItems = getFilteredHistoryItems(historyItems);

  // Wishlist modal handlers
  const handleOpenWishlistModal = () => {
    setIsWishlistModalOpen(true);
  };

  const handleCloseWishlistModal = () => {
    setIsWishlistModalOpen(false);
  };

  const handleSelectWishlistItem = (item: WardrobeItem) => {
    if (item.imageUrl) {
      setImageLink(item.imageUrl);
    }
    // Clear any previous check response when selecting new item
    setItemCheckResponse(null);
    setError('');
  };

  const handleCloseCheckResultModal = () => {
    setIsCheckResultModalOpen(false);
  };

  // AI Check Result Modal Action Handlers
  const handleAddToWishlist = () => {
    if (!itemCheckResponse || !itemCheckScore || !itemCheckStatus) {
      console.error('Missing check result data');
      return;
    }
    
    // Create a temporary item from the analysis
    const tempItem: WardrobeItem = {
      id: `temp-${Date.now()}`,
      name: 'AI Analyzed Item',
      category: 'other' as any,
      color: 'Unknown',
      season: ['ALL_SEASON'] as any,
      imageUrl: imageLink,
      dateAdded: new Date().toISOString(),
      timesWorn: 0,
      wishlist: true,
      wishlistStatus: itemCheckStatus || WishlistStatus.NOT_REVIEWED
    };
    
    // Add to wardrobe as wishlist item
    addItem(tempItem);
    
    // Add history entry with user action status
    addHistoryEntry('Added to wishlist', UserActionStatus.SAVED);
    console.log('Added item to wishlist:', tempItem);
  };

  const handleSkipItem = () => {
    // Add history entry with user action status
    addHistoryEntry('Skipped item', UserActionStatus.DISMISSED);
    console.log('User skipped the item');
  };

  const handleDecideLater = () => {
    // Add history entry with user action status
    addHistoryEntry('Will decide later', UserActionStatus.PENDING);
    console.log('User decided to decide later');
  };

  // Helper function to add history entries with user action status
  const addHistoryEntry = (description: string, userActionStatus: UserActionStatus) => {
    if (!itemCheckResponse || !itemCheckScore || !itemCheckStatus) return;

    const newHistoryItem = {
      id: `check-${Date.now()}`,
      type: 'check' as const,
      title: 'Outfit Check: Current Analysis',
      description: `"${itemCheckResponse}"`,
      summary: `Score: ${itemCheckScore}/10`,
      score: itemCheckScore,
      image: imageLink || undefined,
      date: new Date(),
      status: itemCheckStatus,
      userActionStatus: userActionStatus
    };

    setHistoryItems(prev => [newHistoryItem, ...prev]);
  };

  // Recommendation Modal Handlers
  const handleCloseRecommendationModal = () => {
    setIsRecommendationModalOpen(false);
  };

  const handleSaveRecommendation = () => {
    console.log('User saved the recommendation:', recommendationText);
    
    // Add history entry with user action status
    addRecommendationHistoryEntry('Saved recommendation', UserActionStatus.SAVED);
  };

  const handleSkipRecommendation = () => {
    console.log('User skipped the recommendation');
    
    // Add history entry with user action status
    addRecommendationHistoryEntry('Dismissed recommendation', UserActionStatus.DISMISSED);
  };

  // Helper function to add recommendation history entries with user action status
  const addRecommendationHistoryEntry = (description: string, userActionStatus: UserActionStatus) => {
    const newHistoryItem = {
      id: `recommendation-${Date.now()}`,
      type: 'recommendation' as const,
      title: 'AI Recommendation: Current Suggestion',
      description: description,
      summary: 'All Season • General',
      date: new Date(),
      season: 'All Season',
      scenario: 'General',
      userActionStatus: userActionStatus
    };

    setHistoryItems(prev => [newHistoryItem, ...prev]);
  };

  // History Detail Modal Handlers
  const handleHistoryItemClick = (item: any) => {
    setSelectedHistoryItem(item);
    setIsHistoryDetailModalOpen(true);
  };

  const handleCloseHistoryDetailModal = () => {
    setIsHistoryDetailModalOpen(false);
    setSelectedHistoryItem(null);
  };

  const handleMoveToWishlist = (item: any) => {
    console.log('Moving item to wishlist:', item);
    
    // Update the history item's user action status to SAVED
    setHistoryItems(prev => 
      prev.map(historyItem => 
        historyItem.id === item.id 
          ? { ...historyItem, userActionStatus: UserActionStatus.SAVED }
          : historyItem
      )
    );
    
    // Close the modal
    handleCloseHistoryDetailModal();
  };

  const handleDismissHistoryItem = (item: any) => {
    console.log('Dismissing history item:', item);
    
    // Update the history item's user action status to DISMISSED
    setHistoryItems(prev => 
      prev.map(historyItem => 
        historyItem.id === item.id 
          ? { ...historyItem, userActionStatus: UserActionStatus.DISMISSED }
          : historyItem
      )
    );
    
    // Close the modal
    handleCloseHistoryDetailModal();
  };

  return (
    <>
      <PageHeader title="AI Wardrobe Assistant" />
      <PageContainer>
        {showFullHistory ? (
          <AIHistoryDashboard
            activityFilter={activityFilter}
            onFilterChange={setActivityFilter}
            checkStatusFilter={checkStatusFilter}
            onCheckStatusFilterChange={setCheckStatusFilter}
            userActionFilter={userActionFilter}
            onUserActionFilterChange={setUserActionFilter}
            filteredHistoryItems={filteredHistoryItems}
            onBackToMain={handleBackToMain}
            onHistoryItemClick={handleHistoryItemClick}
          />
        ) : (
          <>
            {/* Main View - Show AI cards and limited history */}
            <CardsContainer>
              <AICheckCard
                imageLink={imageLink}
                onImageLinkChange={setImageLink}
                onFileUpload={handleFileUpload}
                onCheckItem={handleCheckItem}
                onOpenWishlistModal={handleOpenWishlistModal}
                isLoading={isCheckLoading}
                error={error}
                itemCheckResponse={itemCheckResponse}
                isFileUpload={isFileUpload}
                uploadedFile={uploadedFile}
                onProcessedImageChange={handleProcessedImageChange}
              />
              
              <AIRecommendationCard
                selectedSeason={selectedSeason}
                onSeasonChange={setSelectedSeason}
                selectedScenario={selectedScenario}
                onScenarioChange={setSelectedScenario}
                scenarioOptions={scenarioOptions}
                loadingScenarios={loadingScenarios}
                onGetRecommendation={handleGetRecommendation}
                isLoading={isRecommendationLoading}
                error={error}
              />
        </CardsContainer>
        
            {/* History Section - Limited Items */}
            <AIHistorySection
              historyItems={historyItems}
              onViewAllHistory={handleViewAllHistory}
              onHistoryItemClick={handleHistoryItemClick}
            />
          </>
        )}
      </PageContainer>
      
      {/* Wishlist Selection Modal */}
      <WishlistSelectionModal
        isOpen={isWishlistModalOpen}
        onClose={handleCloseWishlistModal}
        items={items}
        onSelectItem={handleSelectWishlistItem}
      />

      {/* AI Check Result Modal - Only render when needed */}
      {(isCheckResultModalOpen || itemCheckResponse) && (
        <AICheckResultModal
          isOpen={isCheckResultModalOpen}
          onClose={handleCloseCheckResultModal}
          analysisResult={itemCheckResponse || ''}
          score={itemCheckScore}
          status={itemCheckStatus}
          imageUrl={imageLink}
          extractedTags={extractedTags}
          onAddToWishlist={handleAddToWishlist}
          error={errorType}
          errorDetails={errorDetails}
          onSkip={handleSkipItem}
          onDecideLater={handleDecideLater}
        />
      )}

      {/* Recommendation Modal */}
      <RecommendationModal
        isOpen={isRecommendationModalOpen}
        onClose={handleCloseRecommendationModal}
        recommendation={recommendationText}
        onSave={handleSaveRecommendation}
        onSkip={handleSkipRecommendation}
      />

      {/* History Detail Modal */}
      <HistoryDetailModal
        isOpen={isHistoryDetailModalOpen}
        onClose={handleCloseHistoryDetailModal}
        item={selectedHistoryItem}
        onMoveToWishlist={handleMoveToWishlist}
        onDismiss={handleDismissHistoryItem}
      />
    </>
  );
};

export default AIAssistantPage;
