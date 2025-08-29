import React, { useState } from 'react';
import styled from 'styled-components';
import { testCompression, generateTestImage } from '../../../utils/imageTestUtils';
import { compressImageToMaxSize } from '../../../utils/imageUtils';

const Container = styled.div`
  padding: 20px;
  border: 1px solid #eee;
  border-radius: 8px;
  background-color: #f9f9f9;
  margin-bottom: 20px;
`;

const Title = styled.h3`
  margin-top: 0;
  color: #333;
`;

const Button = styled.button`
  background-color: #4a90e2;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 10px;
  margin-bottom: 10px;
  &:hover {
    background-color: #357ab8;
  }
`;

const ImagePreview = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-top: 15px;
`;

const ImageCard = styled.div`
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 10px;
  background: white;
  width: 45%;
`;

const Image = styled.img`
  max-width: 100%;
  max-height: 300px;
  object-fit: contain;
`;

const ImageInfo = styled.div`
  margin-top: 10px;
  font-size: 13px;
  color: #666;
`;

const ResultTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  
  th, td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
  }
  
  th {
    background-color: #f2f2f2;
  }
  
  tr:nth-child(even) {
    background-color: #f9f9f9;
  }
`;

const SuccessCell = styled.td<{ success: boolean }>`
  color: ${props => props.success ? 'green' : 'red'};
  font-weight: bold;
`;

interface CompressionResult {
  original: { size: number; dimensions: string };
  compressed: { size: number; dimensions: string; ratio: number };
  success: boolean;
}

const CompressionTester: React.FC = () => {
  const [results, setResults] = useState<CompressionResult[]>([]);
  const [originalImage, setOriginalImage] = useState<string>('');
  const [compressedImage, setCompressedImage] = useState<string>('');
  const [loading, setLoading] = useState(false);
  
  const runTests = async () => {
    setLoading(true);
    try {
      const testResults = await testCompression();
      setResults(testResults);
    } catch (error) {
      console.error('Error running compression tests:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const generateAndCompress = async (width: number, height: number) => {
    setLoading(true);
    try {
      // Generate test image
      const original = await generateTestImage(width, height);
      setOriginalImage(original);
      
      // Compress it
      const compressed = await compressImageToMaxSize(original, 800000);
      setCompressedImage(compressed);
      
      // Add to results
      const ratio = Math.round((compressed.length / original.length) * 100);
      setResults(prev => [
        {
          original: {
            size: original.length,
            dimensions: `${width}x${height}`
          },
          compressed: {
            size: compressed.length,
            dimensions: compressed.length < original.length ? 'Reduced' : 'Unchanged',
            ratio
          },
          success: compressed.length <= 800000
        },
        ...prev
      ]);
    } catch (error) {
      console.error('Error generating and compressing test image:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };
  
  return (
    <Container>
      <Title>Image Compression Tester</Title>
      
      <div>
        <Button onClick={runTests} disabled={loading}>
          {loading ? 'Running...' : 'Run All Tests'}
        </Button>
        <Button onClick={() => generateAndCompress(800, 600)} disabled={loading}>
          Test Small Image (800×600)
        </Button>
        <Button onClick={() => generateAndCompress(1600, 1200)} disabled={loading}>
          Test Medium Image (1600×1200)
        </Button>
        <Button onClick={() => generateAndCompress(3200, 2400)} disabled={loading}>
          Test Large Image (3200×2400)
        </Button>
      </div>
      
      {originalImage && compressedImage && (
        <ImagePreview>
          <ImageCard>
            <h4>Original</h4>
            <Image src={originalImage} alt="Original image" />
            <ImageInfo>
              Size: {formatSize(originalImage.length)}
            </ImageInfo>
          </ImageCard>
          
          <ImageCard>
            <h4>Compressed</h4>
            <Image src={compressedImage} alt="Compressed image" />
            <ImageInfo>
              Size: {formatSize(compressedImage.length)} 
              ({Math.round((compressedImage.length / originalImage.length) * 100)}% of original)
            </ImageInfo>
          </ImageCard>
        </ImagePreview>
      )}
      
      {results.length > 0 && (
        <>
          <h4>Test Results</h4>
          <ResultTable>
            <thead>
              <tr>
                <th>Test Case</th>
                <th>Original Size</th>
                <th>Compressed Size</th>
                <th>Ratio</th>
                <th>Success</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result, index) => (
                <tr key={index}>
                  <td>{result.original.dimensions}</td>
                  <td>{formatSize(result.original.size)}</td>
                  <td>{formatSize(result.compressed.size)}</td>
                  <td>{result.compressed.ratio}%</td>
                  <SuccessCell success={result.success}>
                    {result.success ? '✅ Success' : '❌ Failed'}
                  </SuccessCell>
                </tr>
              ))}
            </tbody>
          </ResultTable>
        </>
      )}
    </Container>
  );
};

export default CompressionTester;
