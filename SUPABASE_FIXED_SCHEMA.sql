-- AchieveFlow Pro Database Schema - FIXED for Case Sensitivity
-- Execute this script in Supabase SQL Editor
-- This script fixes the PostgreSQL case sensitivity issue

-- Clean up existing tables (if needed)
DROP TABLE IF EXISTS tasks
CASCADE;
DROP TABLE IF EXISTS projects
CASCADE;

-- Create projects table with proper quoted identifiers
CREATE TABLE projects
(
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP
    WITH TIME ZONE DEFAULT NOW
    (),
  status TEXT NOT NULL DEFAULT 'active'
);

    -- Create tasks table with proper quoted identifiers
    CREATE TABLE tasks
    (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        "projectId" TEXT NOT NULL,
        "createdBy" TEXT NOT NULL,
        "assignedTo" TEXT,
        "startedBy" TEXT,
        "completedBy" TEXT,
        "createdAt" TIMESTAMP
        WITH TIME ZONE DEFAULT NOW
        (),
  "startedAt" TIMESTAMP
        WITH TIME ZONE,
  "completedAt" TIMESTAMP
        WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending',
  priority TEXT NOT NULL DEFAULT 'medium',
  "dueDate" TIMESTAMP
        WITH TIME ZONE
);

        -- Add check constraints
        ALTER TABLE projects ADD CONSTRAINT projects_status_check 
CHECK (status IN ('active', 'completed', 'on-hold'));

        ALTER TABLE tasks ADD CONSTRAINT tasks_status_check 
CHECK (status IN ('pending', 'in-progress', 'completed'));

        ALTER TABLE tasks ADD CONSTRAINT tasks_priority_check 
CHECK (priority IN ('low', 'medium', 'high'));

        -- Enable Row Level Security
        ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
        ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

        -- Create permissive policies for shared collaboration
        CREATE POLICY "Enable all operations for everyone" ON projects
  FOR ALL USING
        (true) WITH CHECK
        (true);

        CREATE POLICY "Enable all operations for everyone" ON tasks
  FOR ALL USING
        (true) WITH CHECK
        (true);

        -- Create performance indexes with quoted identifiers
        CREATE INDEX idx_projects_created_at ON projects("createdAt" DESC);
        CREATE INDEX idx_projects_status ON projects(status);
        CREATE INDEX idx_projects_created_by ON projects("createdBy");

        CREATE INDEX idx_tasks_created_at ON tasks("createdAt" DESC);
        CREATE INDEX idx_tasks_project_id ON tasks("projectId");
        CREATE INDEX idx_tasks_status ON tasks(status);
        CREATE INDEX idx_tasks_assigned_to ON tasks("assignedTo");
        CREATE INDEX idx_tasks_priority ON tasks(priority);
        CREATE INDEX idx_tasks_created_by ON tasks("createdBy");

        -- Insert sample data with quoted identifiers
        INSERT INTO projects
            (name, description, "createdBy", status)
        VALUES
            ('🚀 Welcome to AchieveFlow Pro', 'Your journey to productivity starts here! This project contains sample tasks to get you started.', 'vinay', 'active'),
            ('📈 Personal Development', 'Track your growth and self-improvement goals', 'ravali', 'active')
        ON CONFLICT
        (id) DO NOTHING;

        -- Insert sample tasks with quoted identifiers
        INSERT INTO tasks
            (title, description, "projectId", "createdBy", status, priority, "assignedTo")
        SELECT
            '✨ Complete Your Profile',
            'Add your personal information and customize your dashboard settings',
            id,
            'vinay',
            'pending',
            'high',
            'vinay'
        FROM projects
        WHERE name = '🚀 Welcome to AchieveFlow Pro'
        LIMIT 1
ON CONFLICT
        (id) DO NOTHING;

        INSERT INTO tasks
            (title, description, "projectId", "createdBy", status, priority, "assignedTo", "dueDate")
        SELECT
            '🎯 Create Your First Project',
            'Start building something amazing by creating your first custom project',
            id,
            'vinay',
            'pending',
            'medium',
            'vinay',
            NOW() + INTERVAL '7 days'
        FROM projects
        WHERE name = '🚀 Welcome to AchieveFlow Pro'
        LIMIT 1
ON CONFLICT
        (id) DO NOTHING;

        INSERT INTO tasks
            (title, description, "projectId", "createdBy", status, priority, "assignedTo")
        SELECT
            '📚 Learn Advanced Features',
            'Explore task assignments, priorities, and collaboration features',
            id,
            'ravali',
            'pending',
            'low',
            'ravali'
        FROM projects
        WHERE name = '📈 Personal Development'
        LIMIT 1
ON CONFLICT
        (id) DO NOTHING;

        -- Verify setup
        SELECT 'Projects created:' as message, COUNT(*) as count
        FROM projects;
        SELECT 'Tasks created:' as message, COUNT(*) as count
        FROM tasks;

        -- Test the schema matches our JavaScript expectations
        SELECT
            column_name,
            data_type
        FROM information_schema.columns
        WHERE table_name = 'projects'
        ORDER BY ordinal_position;

        SELECT
            column_name,
            data_type
        FROM information_schema.columns
        WHERE table_name = 'tasks'
        ORDER BY ordinal_position;