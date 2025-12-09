-- ============================================================================
-- INVESTOR PRO FORMA TOOL - DATABASE SCHEMA
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- PROJECTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  property_type VARCHAR(100),
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'complete', 'archived')),
  is_template BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_updated_at ON projects(updated_at DESC);

-- Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- RLS Policies for projects
CREATE POLICY "Users can view own projects" ON projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" ON projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects" ON projects
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- PROJECT DATA TABLE (Stores all section data as JSONB)
-- ============================================================================
CREATE TABLE IF NOT EXISTS project_data (
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  section VARCHAR(50) NOT NULL,
  data JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (project_id, section)
);

-- Create index on project_id
CREATE INDEX IF NOT EXISTS idx_project_data_project_id ON project_data(project_id);

-- Enable Row Level Security
ALTER TABLE project_data ENABLE ROW LEVEL SECURITY;

-- RLS Policies for project_data (inherit from projects)
CREATE POLICY "Users can view own project data" ON project_data
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects WHERE projects.id = project_data.project_id AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own project data" ON project_data
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects WHERE projects.id = project_data.project_id AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own project data" ON project_data
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM projects WHERE projects.id = project_data.project_id AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own project data" ON project_data
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM projects WHERE projects.id = project_data.project_id AND projects.user_id = auth.uid()
    )
  );

-- ============================================================================
-- USER PREFERENCES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  default_currency VARCHAR(10) DEFAULT 'USD',
  default_hold_period INTEGER DEFAULT 5,
  default_granularity VARCHAR(20) DEFAULT 'annual',
  number_format VARCHAR(10) DEFAULT 'us',
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_preferences
CREATE POLICY "Users can view own preferences" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own preferences" ON user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for projects table
CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for project_data table
CREATE TRIGGER update_project_data_updated_at
    BEFORE UPDATE ON project_data
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for user_preferences table
CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- INITIAL TEMPLATE DATA (Optional)
-- ============================================================================

-- You can add template projects here that are available to all users
-- Example:
-- INSERT INTO projects (user_id, name, property_type, status, is_template)
-- VALUES (
--   '00000000-0000-0000-0000-000000000000', -- System user
--   'Industrial Acquisition Template',
--   'Industrial - Warehouse/Distribution',
--   'complete',
--   TRUE
-- );

