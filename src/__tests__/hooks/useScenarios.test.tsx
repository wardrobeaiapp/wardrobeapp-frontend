import { renderHook, waitFor } from '@testing-library/react';
import { useScenarios } from '../../components/features/wardrobe/forms/WardrobeItemForm/hooks/useScenarios';
import { useSupabaseAuth } from '../../context/SupabaseAuthContext';
import { supabase } from '../../services/core';

// Mock dependencies
jest.mock('../../context/SupabaseAuthContext');
jest.mock('../../services/core');

const mockUseSupabaseAuth = useSupabaseAuth as jest.MockedFunction<typeof useSupabaseAuth>;
const mockSupabase = supabase as jest.Mocked<typeof supabase>;

describe('useScenarios Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock supabase from method chain
    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockReturnValue({
            // Will be mocked per test
          })
        })
      })
    } as any);
  });

  describe('🔒 Security Tests', () => {
    it('should NOT fetch scenarios when user is not authenticated', async () => {
      // Arrange
      mockUseSupabaseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
        login: jest.fn(),
        logout: jest.fn(),
        register: jest.fn(),
        completeOnboarding: jest.fn(),
        updateProfile: jest.fn(),
        updateStyleProfile: jest.fn(),
        refreshUserData: jest.fn(),
        updateBudget: jest.fn(),
        clearError: jest.fn()
      });

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      // Act
      const { result } = renderHook(() => useScenarios());

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.scenarios).toEqual([]);
      expect(result.current.error).toBeNull();
      expect(mockSupabase.from).not.toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(
        '[useScenarios] No authenticated user - cannot fetch scenarios'
      );

      consoleSpy.mockRestore();
    });

    it('should NOT fetch scenarios when user exists but isAuthenticated is false', async () => {
      // Arrange
      mockUseSupabaseAuth.mockReturnValue({
        user: { id: 'user-123', email: 'test@example.com' } as any,
        isAuthenticated: false, // Key test case
        loading: false,
        error: null,
        login: jest.fn(),
        logout: jest.fn(),
        register: jest.fn(),
        completeOnboarding: jest.fn(),
        updateProfile: jest.fn(),
        updateStyleProfile: jest.fn(),
        refreshUserData: jest.fn(),
        updateBudget: jest.fn(),
        clearError: jest.fn()
      });

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      // Act
      const { result } = renderHook(() => useScenarios());

      // Assert  
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.scenarios).toEqual([]);
      expect(mockSupabase.from).not.toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(
        '[useScenarios] No authenticated user - cannot fetch scenarios'
      );

      consoleSpy.mockRestore();
    });

    it('🚨 CRITICAL: should filter scenarios by user_id to prevent data leakage', async () => {
      // Arrange
      const currentUserId = 'user-123';
      mockUseSupabaseAuth.mockReturnValue({
        user: { id: currentUserId, email: 'test@example.com' } as any,
        isAuthenticated: true,
        loading: false,
        error: null,
        login: jest.fn(),
        logout: jest.fn(),
        register: jest.fn(),
        completeOnboarding: jest.fn(),
        updateProfile: jest.fn(),
        updateStyleProfile: jest.fn(),
        refreshUserData: jest.fn(),
        updateBudget: jest.fn(),
        clearError: jest.fn()
      });

      const mockScenarios = [
        { id: 'scenario-1', name: 'Work Meetings', user_id: currentUserId },
        { id: 'scenario-2', name: 'Social Events', user_id: currentUserId }
      ];

      const mockOrderFn = jest.fn().mockResolvedValue({
        data: mockScenarios,
        error: null
      });

      const mockEqFn = jest.fn().mockReturnValue({
        order: mockOrderFn
      });

      const mockSelectFn = jest.fn().mockReturnValue({
        eq: mockEqFn
      });

      mockSupabase.from.mockReturnValue({
        select: mockSelectFn
      } as any);

      // Act
      const { result } = renderHook(() => useScenarios());

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Verify security: user_id filtering
      expect(mockSupabase.from).toHaveBeenCalledWith('scenarios');
      expect(mockSelectFn).toHaveBeenCalledWith('*');
      expect(mockEqFn).toHaveBeenCalledWith('user_id', currentUserId);
      expect(mockOrderFn).toHaveBeenCalledWith('name', { ascending: true });

      expect(result.current.scenarios).toEqual(mockScenarios);
      expect(result.current.error).toBeNull();
    });
  });

  describe('✅ Success Cases', () => {
    it('should successfully fetch scenarios for authenticated user', async () => {
      // Arrange
      const currentUserId = 'user-456';
      mockUseSupabaseAuth.mockReturnValue({
        user: { id: currentUserId, email: 'user@example.com' } as any,
        isAuthenticated: true,
        loading: false,
        error: null,
        login: jest.fn(),
        logout: jest.fn(),
        register: jest.fn(),
        completeOnboarding: jest.fn(),
        updateProfile: jest.fn(),
        updateStyleProfile: jest.fn(),
        refreshUserData: jest.fn(),
        updateBudget: jest.fn(),
        clearError: jest.fn()
      });

      const mockScenarios = [
        { id: 'scenario-1', name: 'Gym Workouts', user_id: currentUserId },
        { id: 'scenario-2', name: 'Date Nights', user_id: currentUserId },
        { id: 'scenario-3', name: 'Business Travel', user_id: currentUserId }
      ];

      const mockOrderFn = jest.fn().mockResolvedValue({
        data: mockScenarios,
        error: null
      });

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: mockOrderFn
          })
        })
      } as any);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      // Act
      const { result } = renderHook(() => useScenarios());

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.scenarios).toEqual(mockScenarios);
      expect(result.current.error).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(
        `[useScenarios] Successfully fetched ${mockScenarios.length} scenarios for user ${currentUserId}`
      );

      consoleSpy.mockRestore();
    });

    it('should handle empty scenario list correctly', async () => {
      // Arrange
      const currentUserId = 'user-empty';
      mockUseSupabaseAuth.mockReturnValue({
        user: { id: currentUserId, email: 'empty@example.com' } as any,
        isAuthenticated: true,
        loading: false,
        error: null,
        login: jest.fn(),
        logout: jest.fn(),
        register: jest.fn(),
        completeOnboarding: jest.fn(),
        updateProfile: jest.fn(),
        updateStyleProfile: jest.fn(),
        refreshUserData: jest.fn(),
        updateBudget: jest.fn(),
        clearError: jest.fn()
      });

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: [],
              error: null
            })
          })
        })
      } as any);

      // Act
      const { result } = renderHook(() => useScenarios());

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.scenarios).toEqual([]);
      expect(result.current.error).toBeNull();
    });
  });

  describe('❌ Error Handling', () => {
    it('should handle supabase query errors gracefully', async () => {
      // Arrange
      const currentUserId = 'user-error';
      mockUseSupabaseAuth.mockReturnValue({
        user: { id: currentUserId, email: 'error@example.com' } as any,
        isAuthenticated: true,
        loading: false,
        error: null,
        login: jest.fn(),
        logout: jest.fn(),
        register: jest.fn(),
        completeOnboarding: jest.fn(),
        updateProfile: jest.fn(),
        updateStyleProfile: jest.fn(),
        refreshUserData: jest.fn(),
        updateBudget: jest.fn(),
        clearError: jest.fn()
      });

      const mockError = {
        message: 'Database connection failed',
        code: 'PGRST116'
      };

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: null,
              error: mockError
            })
          })
        })
      } as any);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Act
      const { result } = renderHook(() => useScenarios());

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.scenarios).toEqual([]);
      expect(result.current.error).toBe('Failed to load scenarios');
      expect(consoleSpy).toHaveBeenCalledWith('[useScenarios] Error fetching scenarios:', mockError);

      consoleSpy.mockRestore();
    });

    it('should handle unexpected exceptions gracefully', async () => {
      // Arrange
      const currentUserId = 'user-exception';
      mockUseSupabaseAuth.mockReturnValue({
        user: { id: currentUserId, email: 'exception@example.com' } as any,
        isAuthenticated: true,
        loading: false,
        error: null,
        login: jest.fn(),
        logout: jest.fn(),
        register: jest.fn(),
        completeOnboarding: jest.fn(),
        updateProfile: jest.fn(),
        updateStyleProfile: jest.fn(),
        refreshUserData: jest.fn(),
        updateBudget: jest.fn(),
        clearError: jest.fn()
      });

      mockSupabase.from.mockImplementation(() => {
        throw new Error('Network timeout');
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Act
      const { result } = renderHook(() => useScenarios());

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.scenarios).toEqual([]);
      expect(result.current.error).toBe('Unexpected error loading scenarios');
      expect(consoleSpy).toHaveBeenCalledWith(
        '[useScenarios] Unexpected error fetching scenarios:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('🔄 Reactivity Tests', () => {
    it('should re-fetch scenarios when user ID changes', async () => {
      // Arrange
      const mockOrderFn = jest.fn().mockResolvedValue({
        data: [],
        error: null
      });

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: mockOrderFn
          })
        })
      } as any);

      // Start with first user
      mockUseSupabaseAuth.mockReturnValue({
        user: { id: 'user-123', email: 'user1@example.com' } as any,
        isAuthenticated: true,
        loading: false,
        error: null,
        login: jest.fn(),
        logout: jest.fn(),
        register: jest.fn(),
        completeOnboarding: jest.fn(),
        updateProfile: jest.fn(),
        updateStyleProfile: jest.fn(),
        refreshUserData: jest.fn(),
        updateBudget: jest.fn(),
        clearError: jest.fn()
      });

      const { rerender } = renderHook(() => useScenarios());

      await waitFor(() => {
        expect(mockSupabase.from).toHaveBeenCalledWith('scenarios');
      });

      expect(mockOrderFn).toHaveBeenCalledTimes(1);

      // Change to different user
      mockUseSupabaseAuth.mockReturnValue({
        user: { id: 'user-456', email: 'user2@example.com' } as any,
        isAuthenticated: true,
        loading: false,
        error: null,
        login: jest.fn(),
        logout: jest.fn(),
        register: jest.fn(),
        completeOnboarding: jest.fn(),
        updateProfile: jest.fn(),
        updateStyleProfile: jest.fn(),
        refreshUserData: jest.fn(),
        updateBudget: jest.fn(),
        clearError: jest.fn()
      });

      rerender();

      // Should trigger fetch again for new user
      await waitFor(() => {
        expect(mockOrderFn).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('🔧 Loading States', () => {
    it('should start with loading true and set to false after fetch', async () => {
      // Arrange
      mockUseSupabaseAuth.mockReturnValue({
        user: { id: 'user-loading', email: 'loading@example.com' } as any,
        isAuthenticated: true,
        loading: false,
        error: null,
        login: jest.fn(),
        logout: jest.fn(),
        register: jest.fn(),
        completeOnboarding: jest.fn(),
        updateProfile: jest.fn(),
        updateStyleProfile: jest.fn(),
        refreshUserData: jest.fn(),
        updateBudget: jest.fn(),
        clearError: jest.fn()
      });

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: [],
              error: null
            })
          })
        })
      } as any);

      // Act
      const { result } = renderHook(() => useScenarios());

      // Assert initial loading state
      expect(result.current.isLoading).toBe(true);
      expect(result.current.scenarios).toEqual([]);
      expect(result.current.error).toBeNull();

      // Wait for completion
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });
});
