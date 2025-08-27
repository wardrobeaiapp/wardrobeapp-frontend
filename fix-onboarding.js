// Get current user from localStorage
const user = JSON.parse(localStorage.getItem('user') || '{}');

// Show current status
console.log('Current onboarding status:', user.onboardingCompleted);

// Set onboarding completed to true
user.onboardingCompleted = true;

// Save back to localStorage
localStorage.setItem('user', JSON.stringify(user));

// Show updated status
console.log('Updated onboarding status:', JSON.parse(localStorage.getItem('user')).onboardingCompleted);

console.log('✅ Fix applied! Please refresh the page to see the changes.');
