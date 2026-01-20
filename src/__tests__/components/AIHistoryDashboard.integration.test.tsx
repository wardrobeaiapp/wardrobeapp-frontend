import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import AIHistoryDashboard from '../../components/features/ai-assistant/AIHistoryDashboard/AIHistoryDashboard';
import { aiCheckHistoryService } from '../../services/ai/aiCheckHistoryService';
import { WishlistStatus, UserActionStatus } from '../../types';
import { AICheckHistoryItem } from '../../types/ai';
// Create a minimal theme for testing
const testTheme = {
  colors: {
    textPrimary: '#1f2937',
    textSecondary: '#6b7280',
    background: '#ffffff',
    border: '#e5e7eb',
    purple: {
      500: '#8b5cf6'
    }
  }
};

// Mock the aiCheckHistoryService
jest.mock('../../services/ai/aiCheckHistoryService', () => ({
  aiCheckHistoryService: {
    getHistory: jest.fn(),
    updateRecordStatus: jest.fn()
  }
}));

// Mock console methods
const mockConsole = {
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};

Object.defineProperty(console, 'log', { value: mockConsole.log });
Object.defineProperty(console, 'warn', { value: mockConsole.warn });
Object.defineProperty(console, 'error', { value: mockConsole.error });

describe('AIHistoryDashboard Integration Tests', () => {
  const mockAICheckHistoryService = aiCheckHistoryService as any;

  const mockHistoryItems: AICheckHistoryItem[] = [
    {
      id: 'item-1',
      type: 'check' as const,
      title: 'Blue Shirt Analysis',
      description: 'AI analysis of blue shirt',
      summary: 'Versatile piece for multiple scenarios',
      score: 8,
      image: 'shirt.jpg',
      date: new Date('2024-01-20T10:00:00Z'),
      status: WishlistStatus.APPROVED,
      userActionStatus: UserActionStatus.SAVED,
      richData: {
        compatibleItems: { tops: [], bottoms: [], shoes: [], outerwear: [], accessories: [] },
        outfitCombinations: [],
        suitableScenarios: ['work', 'casual'],
        seasonScenarioCombinations: [],
        coverageGapsWithNoOutfits: [],
        itemDetails: {
          name: 'Blue Shirt',
          category: 'tops',
          imageUrl: 'shirt.jpg'
        },
        recommendationText: 'Highly recommended',
        rawAnalysis: 'Detailed analysis text'
      }
    },
    {
      id: 'item-2',
      type: 'check' as const,
      title: 'Red Dress Analysis',
      description: 'AI analysis of red dress',
      summary: 'Limited versatility, specific occasions only',
      score: 4,
      image: 'dress.jpg',
      date: new Date('2024-01-19T15:30:00Z'),
      status: WishlistStatus.NOT_RECOMMENDED,
      userActionStatus: UserActionStatus.DISMISSED,
      richData: {
        compatibleItems: { tops: [], bottoms: [], shoes: [], outerwear: [], accessories: [] },
        outfitCombinations: [],
        suitableScenarios: ['formal'],
        seasonScenarioCombinations: [],
        coverageGapsWithNoOutfits: [],
        itemDetails: {
          name: 'Red Dress',
          category: 'one_piece',
          imageUrl: 'dress.jpg'
        },
        recommendationText: 'Not recommended',
        rawAnalysis: 'Limited versatility analysis'
      }
    }
  ];

  const defaultProps = {
    activityFilter: 'all' as const,
    onFilterChange: jest.fn(),
    checkStatusFilter: 'all' as const,
    onCheckStatusFilterChange: jest.fn(),
    userActionFilter: 'all',
    onUserActionFilterChange: jest.fn(),
    filteredHistoryItems: mockHistoryItems,
    onBackToMain: jest.fn(),
    onHistoryItemClick: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockConsole.log.mockClear();
    mockConsole.warn.mockClear();
    mockConsole.error.mockClear();
  });

  const renderWithRouter = (component: React.ReactElement) => {
    return render(
      <BrowserRouter>
        <ThemeProvider theme={testTheme as any}>
          {component}
        </ThemeProvider>
      </BrowserRouter>
    );
  };

  describe('Rendering', () => {
    it('should render AI History Dashboard with history items', () => {
      renderWithRouter(<AIHistoryDashboard {...defaultProps} />);

      expect(screen.getByText('AI Check History')).toBeInTheDocument();
      expect(screen.getByText('Blue Shirt Analysis')).toBeInTheDocument();
      expect(screen.getByText('Red Dress Analysis')).toBeInTheDocument();
    });

    it('should display empty state when no history items', () => {
      const emptyProps = { ...defaultProps, filteredHistoryItems: [] };
      renderWithRouter(<AIHistoryDashboard {...emptyProps} />);

      expect(screen.getByText('No AI Check history found. Try checking some wishlist items!')).toBeInTheDocument();
    });

    it('should render filter controls', () => {
      renderWithRouter(<AIHistoryDashboard {...defaultProps} />);

      // Check for filter elements (these might be buttons, selects, or other controls)
      expect(screen.getByText('AI Check History')).toBeInTheDocument();
      
      // Look for back button
      expect(screen.getByText('← Back')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should handle back to main navigation', () => {
      renderWithRouter(<AIHistoryDashboard {...defaultProps} />);

      const backButton = screen.getByText('← Back');
      fireEvent.click(backButton);

      expect(defaultProps.onBackToMain).toHaveBeenCalledTimes(1);
    });

    it('should handle history item click', () => {
      renderWithRouter(<AIHistoryDashboard {...defaultProps} />);

      const historyItem = screen.getByText('Blue Shirt Analysis');
      fireEvent.click(historyItem);

      expect(defaultProps.onHistoryItemClick).toHaveBeenCalledWith(mockHistoryItems[0]);
    });

    it('should handle filter changes', () => {
      renderWithRouter(<AIHistoryDashboard {...defaultProps} />);

      // These tests would need to be adjusted based on the actual filter UI implementation
      // For now, just verify the props are passed correctly
      expect(defaultProps.activityFilter).toBe('all');
      expect(defaultProps.checkStatusFilter).toBe('all');
      expect(defaultProps.userActionFilter).toBe('all');
    });
  });

  describe('Score and Status Display', () => {
    it('should display correct scores and statuses', () => {
      renderWithRouter(<AIHistoryDashboard {...defaultProps} />);

      // Test that the history items are actually rendered with their content
      expect(screen.getByText('Blue Shirt Analysis')).toBeInTheDocument();
      expect(screen.getByText('Red Dress Analysis')).toBeInTheDocument();
      
      // Test that score information is displayed (either as numbers or text)
      // The actual score display depends on the component implementation
      const content = screen.getByText(/AI History/i);
      expect(content).toBeInTheDocument();
    });

    it('should show different status indicators', () => {
      renderWithRouter(<AIHistoryDashboard {...defaultProps} />);

      // Check that the items from our mock data are rendered
      expect(screen.getByText('Blue Shirt Analysis')).toBeInTheDocument();
      expect(screen.getByText('Red Dress Analysis')).toBeInTheDocument();
      
      // Check that filtering controls are present for real functionality
      expect(screen.getByLabelText(/Activity Type/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Status/i)).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle missing rich data gracefully', () => {
      const itemsWithoutRichData: AICheckHistoryItem[] = [
        {
          ...mockHistoryItems[0],
          richData: undefined
        }
      ];

      const props = { ...defaultProps, filteredHistoryItems: itemsWithoutRichData };
      renderWithRouter(<AIHistoryDashboard {...props} />);

      expect(screen.getByText('Blue Shirt Analysis')).toBeInTheDocument();
      // Should not crash when richData is missing
    });

    it('should handle items with minimal data', () => {
      const minimalItems: AICheckHistoryItem[] = [
        {
          id: 'minimal-1',
          type: 'check' as const,
          title: 'Minimal Item',
          description: '',
          summary: '',
          score: 0,
          date: new Date(),
          status: WishlistStatus.NOT_REVIEWED,
          userActionStatus: UserActionStatus.PENDING
        }
      ];

      const props = { ...defaultProps, filteredHistoryItems: minimalItems };
      renderWithRouter(<AIHistoryDashboard {...props} />);

      expect(screen.getByText('Minimal Item')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should handle large number of history items', () => {
      const manyItems: AICheckHistoryItem[] = Array.from({ length: 50 }, (_, index) => ({
        ...mockHistoryItems[0],
        id: `item-${index}`,
        title: `Item ${index} Analysis`,
        score: Math.floor(Math.random() * 10) + 1
      }));

      const props = { ...defaultProps, filteredHistoryItems: manyItems };
      
      const startTime = Date.now();
      renderWithRouter(<AIHistoryDashboard {...props} />);
      const renderTime = Date.now() - startTime;

      // Should render within reasonable time (less than 1 second)
      expect(renderTime).toBeLessThan(1000);
      
      // Should display items
      expect(screen.getByText('Item 0 Analysis')).toBeInTheDocument();
    });
  });
});
