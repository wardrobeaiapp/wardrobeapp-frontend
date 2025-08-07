import React, { useState, useEffect } from 'react';
import { getStylePreferences, saveStylePreferences } from '../../services/stylePreferencesService';
import { StylePreferencesData } from '../../types';
import { useSupabaseAuth } from '../../context/SupabaseAuthContext';
import {
  TestContainer,
  TestSection,
  TestTitle,
  TestButton,
  ResultContainer,
  ResultPre,
  SuccessText,
  ErrorText,
  InfoText
} from './StylePreferencesServiceTest.styles';

/**
 * Component to test the stylePreferencesService
 */
const StylePreferencesServiceTest: React.FC = () => {
  // Get the current authenticated user
  const { user } = useSupabaseAuth();
  
  // State for test results
  const [getResult, setGetResult] = useState<any>(null);
  const [saveResult, setSaveResult] = useState<any>(null);
  const [verifyResult, setVerifyResult] = useState<any>(null);
  const [verificationDetails, setVerificationDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  
  // Update userId when the authenticated user changes
  useEffect(() => {
    if (user?.id) {
      setUserId(user.id);
      console.log('Current authenticated user ID:', user.id);
    }
  }, [user]);
  
  // Test data for saving
  const testData: StylePreferencesData = {
    preferredStyles: ['casual', 'minimalist'],
    stylePreferences: {
      comfortVsStyle: 75,
      classicVsTrendy: 40,
      basicsVsStatements: 60,
      additionalNotes: 'Testing style preferences service'
    }
  };

  // Function to test getStylePreferences
  const testGetStylePreferences = async () => {
    setLoading(true);
    setGetResult(null);
    
    try {
      if (!userId) {
        throw new Error('No user ID available');
      }
      console.log('Testing getStylePreferences with userId:', userId);
      const result = await getStylePreferences(userId);
      console.log('Get result:', result);
      setGetResult(result);
    } catch (error) {
      console.error('Error getting style preferences:', error);
      setGetResult({ error });
    } finally {
      setLoading(false);
    }
  };

  // Function to test saveStylePreferences
  const testSaveStylePreferences = async () => {
    setLoading(true);
    setSaveResult(null);
    
    try {
      if (!userId) {
        throw new Error('No user ID available');
      }
      console.log('Testing saveStylePreferences with data:', testData);
      const result = await saveStylePreferences(testData, userId);
      console.log('Save result:', result);
      setSaveResult(result);
    } catch (error) {
      console.error('Error saving style preferences:', error);
      setSaveResult({ error });
    } finally {
      setLoading(false);
    }
  };

  // Function to verify saved data
  const verifyStylePreferences = async () => {
    setLoading(true);
    setVerifyResult(null);
    setVerificationDetails(null);
    
    try {
      if (!userId) {
        throw new Error('No user ID available');
      }
      console.log('Verifying saved style preferences');
      const result = await getStylePreferences(userId);
      console.log('Verification result:', result);
      setVerifyResult(result);
      
      if (result) {
        const stylePrefs = testData.stylePreferences!;
        const verifyPrefs = result.stylePreferences || {};
        
        const preferredStylesMatch = JSON.stringify(result.preferredStyles) === 
                                    JSON.stringify(testData.preferredStyles);
        
        const comfortMatch = verifyPrefs.comfortVsStyle === stylePrefs.comfortVsStyle;
        const classicMatch = verifyPrefs.classicVsTrendy === stylePrefs.classicVsTrendy;
        const basicsMatch = verifyPrefs.basicsVsStatements === stylePrefs.basicsVsStatements;
        const notesMatch = verifyPrefs.additionalNotes === stylePrefs.additionalNotes;
        
        const details = {
          preferredStylesMatch,
          comfortMatch,
          classicMatch,
          basicsMatch,
          notesMatch,
          allMatch: preferredStylesMatch && comfortMatch && classicMatch && basicsMatch && notesMatch
        };
        
        setVerificationDetails(details);
      }
    } catch (error) {
      console.error('Error verifying style preferences:', error);
      setVerifyResult({ error });
    } finally {
      setLoading(false);
    }
  };

  // Function to run all tests
  const runAllTests = async () => {
    if (!userId) {
      console.error('Cannot run tests: No authenticated user found');
      return;
    }
    await testGetStylePreferences();
    await testSaveStylePreferences();
    await verifyStylePreferences();
  };

  return (
    <TestContainer>
      <h1>Style Preferences Service Test</h1>
      
      <TestSection>
        <TestTitle>Test Configuration</TestTitle>
        <div>
          <label>
            Current User ID: 
            <input 
              type="text" 
              value={userId || ''} 
              readOnly 
              style={{ width: '300px', marginLeft: '10px' }}
            />
          </label>
        </div>
        <div style={{ marginTop: '10px' }}>
          <TestButton onClick={runAllTests} disabled={loading}>
            Run All Tests
          </TestButton>
        </div>
      </TestSection>
      
      <TestSection>
        <TestTitle>1. Get Style Preferences</TestTitle>
        <TestButton onClick={testGetStylePreferences} disabled={loading}>
          Test Get
        </TestButton>
        
        {getResult !== null && (
          <ResultContainer>
            <div>
              {getResult === null ? (
                <ErrorText>No data found</ErrorText>
              ) : getResult.error ? (
                <ErrorText>Error: {JSON.stringify(getResult.error)}</ErrorText>
              ) : (
                <SuccessText>Successfully retrieved data</SuccessText>
              )}
            </div>
            <ResultPre>{JSON.stringify(getResult, null, 2)}</ResultPre>
          </ResultContainer>
        )}
      </TestSection>
      
      <TestSection>
        <TestTitle>2. Save Style Preferences</TestTitle>
        <div>
          <TestButton onClick={testSaveStylePreferences} disabled={loading}>
            Test Save
          </TestButton>
        </div>
        
        <div style={{ marginTop: '10px' }}>
          <strong>Test Data:</strong>
          <ResultPre>{JSON.stringify(testData, null, 2)}</ResultPre>
        </div>
        
        {saveResult !== null && (
          <ResultContainer>
            <div>
              {saveResult.success ? (
                <SuccessText>Successfully saved data</SuccessText>
              ) : (
                <ErrorText>Error: {JSON.stringify(saveResult.error)}</ErrorText>
              )}
            </div>
            <ResultPre>{JSON.stringify(saveResult, null, 2)}</ResultPre>
          </ResultContainer>
        )}
      </TestSection>
      
      <TestSection>
        <TestTitle>3. Verify Saved Data</TestTitle>
        <TestButton onClick={verifyStylePreferences} disabled={loading}>
          Verify Data
        </TestButton>
        
        {verifyResult !== null && (
          <ResultContainer>
            <div>
              {verifyResult === null ? (
                <ErrorText>No data found</ErrorText>
              ) : verifyResult.error ? (
                <ErrorText>Error: {JSON.stringify(verifyResult.error)}</ErrorText>
              ) : (
                <SuccessText>Successfully retrieved verification data</SuccessText>
              )}
            </div>
            <ResultPre>{JSON.stringify(verifyResult, null, 2)}</ResultPre>
          </ResultContainer>
        )}
        
        {verificationDetails && (
          <ResultContainer>
            <div>
              <strong>Verification Results:</strong>
              <div>
                <span>preferredStyles match: </span>
                {verificationDetails.preferredStylesMatch ? (
                  <SuccessText>✓</SuccessText>
                ) : (
                  <ErrorText>✗</ErrorText>
                )}
              </div>
              <div>
                <span>comfortVsStyle match: </span>
                {verificationDetails.comfortMatch ? (
                  <SuccessText>✓</SuccessText>
                ) : (
                  <ErrorText>✗</ErrorText>
                )}
              </div>
              <div>
                <span>classicVsTrendy match: </span>
                {verificationDetails.classicMatch ? (
                  <SuccessText>✓</SuccessText>
                ) : (
                  <ErrorText>✗</ErrorText>
                )}
              </div>
              <div>
                <span>basicsVsStatements match: </span>
                {verificationDetails.basicsMatch ? (
                  <SuccessText>✓</SuccessText>
                ) : (
                  <ErrorText>✗</ErrorText>
                )}
              </div>
              <div>
                <span>additionalNotes match: </span>
                {verificationDetails.notesMatch ? (
                  <SuccessText>✓</SuccessText>
                ) : (
                  <ErrorText>✗</ErrorText>
                )}
              </div>
              <div style={{ marginTop: '10px' }}>
                <strong>Overall: </strong>
                {verificationDetails.allMatch ? (
                  <SuccessText>All data verified correctly! ✓</SuccessText>
                ) : (
                  <ErrorText>Some data fields do not match what was saved ✗</ErrorText>
                )}
              </div>
            </div>
          </ResultContainer>
        )}
      </TestSection>
      
      {loading && <div style={{ textAlign: 'center', marginTop: '20px' }}>Loading...</div>}
    </TestContainer>
  );
};

export default StylePreferencesServiceTest;
