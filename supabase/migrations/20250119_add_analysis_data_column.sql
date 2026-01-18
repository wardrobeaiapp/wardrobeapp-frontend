-- Add analysis_data column to ai_check_history table to match analysis_mocks format
-- This enables rich visual display in history modals

ALTER TABLE ai_check_history 
ADD COLUMN IF NOT EXISTS analysis_data JSONB;

-- Add comment to explain the column purpose
COMMENT ON COLUMN ai_check_history.analysis_data IS 'Rich analysis data in same format as analysis_mocks for visual display';

-- Create index on analysis_data for better query performance
CREATE INDEX IF NOT EXISTS idx_ai_check_history_analysis_data 
ON ai_check_history USING GIN (analysis_data);
