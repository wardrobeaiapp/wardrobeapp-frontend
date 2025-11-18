import { renderHook } from '@testing-library/react';
import { useScenarios } from '../../components/features/wardrobe/forms/WardrobeItemForm/hooks/useScenarios';
import { useScenarios as useSharedScenarios } from '../../hooks/scenarios';

// Mock the shared scenarios hook
jest.mock('../../hooks/scenarios');

const mockUseSharedScenarios = useSharedScenarios as jest.MockedFunction<typeof useSharedScenarios>;

describe('useScenarios Hook (Form Wrapper)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should use shared scenario hook and convert data format', () => {
    // Arrange
    const mockSharedScenarios = [
      { id: 'scenario-1', name: 'Office Work' },
      { id: 'scenario-2', name: 'Social Outings' }
    ];

    mockUseSharedScenarios.mockReturnValue({
      scenarios: mockSharedScenarios,
      isLoading: false,
      error: null,
      refetch: jest.fn()
    });

    // Act
    const { result } = renderHook(() => useScenarios());

    // Assert
    expect(mockUseSharedScenarios).toHaveBeenCalled();
    expect(result.current.scenarios).toEqual([
      { id: 'scenario-1', name: 'Office Work' },
      { id: 'scenario-2', name: 'Social Outings' }
    ]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should pass through loading state from shared hook', () => {
    // Arrange
    mockUseSharedScenarios.mockReturnValue({
      scenarios: [],
      isLoading: true,
      error: null,
      refetch: jest.fn()
    });

    // Act
    const { result } = renderHook(() => useScenarios());

    // Assert
    expect(result.current.isLoading).toBe(true);
    expect(result.current.scenarios).toEqual([]);
  });

  it('should pass through error state from shared hook', () => {
    // Arrange
    const mockError = 'Failed to load scenarios';
    mockUseSharedScenarios.mockReturnValue({
      scenarios: [],
      isLoading: false,
      error: mockError,
      refetch: jest.fn()
    });

    // Act
    const { result } = renderHook(() => useScenarios());

    // Assert
    expect(result.current.error).toBe(mockError);
    expect(result.current.scenarios).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle empty scenarios array', () => {
});
