# Unit Testing Guide

## 📁 Directory Structure

```
project/
├── server/
│   ├── tests/
│   │   ├── utils/           # Utility function tests
│   │   ├── routes/          # API endpoint tests  
│   │   ├── services/        # Business logic tests
│   │   └── README.md
│   └── package.json         # Jest config for server
└── src/
    ├── __tests__/           # Frontend tests
    │   ├── components/      # Component tests
    │   ├── hooks/           # Custom hook tests
    │   ├── services/        # Service tests
    │   └── utils/           # Utility tests
    └── package.json         # React Testing Library config
```

## 🎯 Test Types

### 1. **Pure Functions** (Utilities, Helpers)
```javascript
// ✅ Easy to test - no dependencies
describe('calculateGapType', () => {
  it('should return critical when items = 0', () => {
    expect(calculateGapType(0, 1, 3)).toBe('critical');
  });
});
```

### 2. **Services** (API calls, Business Logic)
```javascript
// ✅ Mock external dependencies
jest.mock('../api/client');
const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('wardrobeAnalysisService', () => {
  it('should analyze items correctly', async () => {
    mockApiClient.post.mockResolvedValue({ data: mockResponse });
    // Test the service
  });
});
```

### 3. **React Hooks**
```javascript
// ✅ Use renderHook from testing library
import { renderHook, act } from '@testing-library/react';

describe('useAICheck', () => {
  it('should handle loading state', () => {
// ✅ Test user interactions and rendered output
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

describe('AICheckResultModal', () => {
  it('should display analysis results', async () => {
    render(<AICheckResultModal {...props} />);
    await waitFor(() => screen.getByText('Analysis complete'));
    expect(screen.getByText('Analysis complete')).toBeInTheDocument();
  });
});
- **Mock external dependencies** - APIs, file system, external services
- **Test edge cases** - Empty data, errors, loading states
- **Keep tests isolated** - Each test should work independently
- **Use setup/teardown** - `beforeEach`, `afterEach` for cleanup

### ❌ **DON'T:**
- Test implementation details (private methods, internal state)
- Make tests depend on each other
- Test third-party libraries (React, axios, etc.)
- Write tests that are too complex
- Ignore edge cases and error paths

## 🧪 Test Patterns

### **Arrange-Act-Assert (AAA)**
```javascript
it('should format analysis response correctly', () => {
  // Arrange - Set up test data
  const input = { analysis: 'Good item', score: 8 };
  
  // Act - Execute the function
  const result = formatResponse(input);
  
  // Assert - Check the result
  expect(result.success).toBe(true);
  expect(result.score).toBe(8);
});
```

### **Given-When-Then (BDD)**
```javascript
describe('When analyzing a bag item', () => {
  it('should not include seasonal information', () => {
    // Given a bag with spring/fall season in coverage
    const coverage = [{ subcategory: 'Bag', season: 'spring/fall' }];
    const formData = { category: 'accessory', subcategory: 'Bag' };
    
    // When generating the reason
    const result = generateObjectiveFinalReason(coverage, 'improvement', [], false, formData, []);
    
    // Then it should not mention the season
    expect(result).not.toContain('spring/fall');
    expect(result).toContain('Your bags collection');
  });
});
```

## 📊 Running Tests

### Server Tests
```bash
cd server
npm test                    # Run all tests (unit + integration)
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests only
npm run test:watch         # Watch mode
npm run test:coverage      # Coverage report
```

### Frontend Tests
```bash
npm test                # Run all tests
npm test -- --watch    # Watch mode
npm test -- --coverage # Coverage report
```

## 🎨 Mocking Strategies

### **API Services**
```javascript
jest.mock('./apiService', () => ({
  analyzeItem: jest.fn(),
  getCoverage: jest.fn()
}));
```

### **React Router**
```javascript
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));
```

### **Styled Components**
```javascript
jest.mock('styled-components', () => ({
  ...jest.requireActual('styled-components'),
  // Mock if causing issues
}));
```

## 🚀 Coverage Goals

- **Functions**: 80%+ coverage
- **Branches**: 70%+ coverage  
- **Lines**: 85%+ coverage
- **Critical paths**: 100% coverage (AI analysis, payment, user data)

Remember: **Coverage is not everything** - focus on testing the right things, not achieving 100% coverage!
