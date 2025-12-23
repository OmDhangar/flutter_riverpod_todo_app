-- =====================================================
-- Smart Task Manager Database Setup
-- =====================================================
-- Run this in your Supabase SQL Editor
-- =====================================================

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS task_history CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;

-- =====================================================
-- Create Tasks Table
-- =====================================================
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN ('scheduling', 'finance', 'technical', 'safety', 'general')),
    priority TEXT NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
    assigned_to TEXT,
    due_date TIMESTAMP WITH TIME ZONE,
    extracted_entities JSONB DEFAULT '{}',
    suggested_actions JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- Create Task History Table (Audit Log)
-- =====================================================
CREATE TABLE task_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    action TEXT NOT NULL CHECK (action IN ('created', 'updated', 'status_changed', 'completed', 'deleted')),
    old_value JSONB,
    new_value JSONB,
    changed_by TEXT DEFAULT 'system',
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- Create Indexes for Performance
-- =====================================================

-- Tasks table indexes
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_category ON tasks(category);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_created_at ON tasks(created_at DESC);
CREATE INDEX idx_tasks_updated_at ON tasks(updated_at DESC);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);

-- Task history indexes
CREATE INDEX idx_task_history_task_id ON task_history(task_id);
CREATE INDEX idx_task_history_action ON task_history(action);
CREATE INDEX idx_task_history_changed_at ON task_history(changed_at DESC);

-- Full-text search index (optional but recommended)
CREATE INDEX idx_tasks_title_search ON tasks USING GIN (to_tsvector('english', title));
CREATE INDEX idx_tasks_description_search ON tasks USING GIN (to_tsvector('english', description));

-- =====================================================
-- Create Updated_at Trigger Function
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Apply Trigger to Tasks Table
-- =====================================================
CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Insert Sample Data (Optional - for testing)
-- =====================================================

-- Sample Task 1: Scheduling
INSERT INTO tasks (
    title, 
    description, 
    category, 
    priority, 
    status, 
    assigned_to, 
    due_date,
    extracted_entities,
    suggested_actions
) VALUES (
    'Schedule urgent meeting with team today',
    'Need to discuss Q4 budget allocation with finance team and operations',
    'scheduling',
    'high',
    'pending',
    'John Doe',
    NOW() + INTERVAL '1 day',
    '{"people": ["John"], "dates": ["today"], "keywords": ["meeting", "team", "budget"]}',
    '["Block calendar", "Send invite", "Prepare agenda", "Set reminder"]'
);

-- Sample Task 2: Finance
INSERT INTO tasks (
    title, 
    description, 
    category, 
    priority, 
    status, 
    assigned_to, 
    due_date,
    extracted_entities,
    suggested_actions
) VALUES (
    'Process vendor invoice payment',
    'Pay outstanding invoice #12345 for construction materials',
    'finance',
    'medium',
    'pending',
    'Finance Team',
    NOW() + INTERVAL '3 days',
    '{"keywords": ["invoice", "payment", "vendor"]}',
    '["Check budget", "Get approval", "Process payment", "Update records"]'
);

-- Sample Task 3: Technical
INSERT INTO tasks (
    title, 
    description, 
    category, 
    priority, 
    status, 
    assigned_to, 
    due_date,
    extracted_entities,
    suggested_actions
) VALUES (
    'Fix critical server bug ASAP',
    'Database connection failing intermittently, needs immediate attention',
    'technical',
    'high',
    'in_progress',
    'IT Team',
    NOW() + INTERVAL '6 hours',
    '{"keywords": ["fix", "bug", "server", "database"]}',
    '["Diagnose issue", "Check resources", "Assign technician", "Document fix"]'
);

-- Sample Task 4: Safety
INSERT INTO tasks (
    title, 
    description, 
    category, 
    priority, 
    status,
    extracted_entities,
    suggested_actions
) VALUES (
    'Conduct monthly safety inspection',
    'Inspect all equipment and ensure PPE compliance across site',
    'safety',
    'medium',
    'pending',
    '{"keywords": ["inspection", "safety", "compliance", "PPE"]}',
    '["Conduct inspection", "File report", "Notify supervisor", "Update checklist"]'
);

-- Sample Task 5: Completed Task
INSERT INTO tasks (
    title, 
    description, 
    category, 
    priority, 
    status, 
    assigned_to,
    extracted_entities,
    suggested_actions
) VALUES (
    'Review completed project documentation',
    'Final review of all project deliverables',
    'general',
    'low',
    'completed',
    'Project Manager',
    '{"keywords": ["review", "documentation", "project"]}',
    '["Review details", "Assign owner", "Track progress"]'
);

-- =====================================================
-- Create Sample History Entries
-- =====================================================
INSERT INTO task_history (task_id, action, new_value, changed_by)
SELECT id, 'created', 
    json_build_object(
        'title', title, 
        'category', category, 
        'priority', priority, 
        'status', status
    )::jsonb,
    'system'
FROM tasks;

-- =====================================================
-- Verification Queries
-- =====================================================

-- Count tasks by status
SELECT status, COUNT(*) as count 
FROM tasks 
GROUP BY status 
ORDER BY count DESC;

-- Count tasks by category
SELECT category, COUNT(*) as count 
FROM tasks 
GROUP BY category 
ORDER BY count DESC;

-- Count tasks by priority
SELECT priority, COUNT(*) as count 
FROM tasks 
GROUP BY priority 
ORDER BY 
    CASE priority
        WHEN 'high' THEN 1
        WHEN 'medium' THEN 2
        WHEN 'low' THEN 3
    END;

-- Show recent tasks
SELECT 
    id,
    title,
    category,
    priority,
    status,
    assigned_to,
    due_date,
    created_at
FROM tasks
ORDER BY created_at DESC
LIMIT 10;

-- =====================================================
-- Success Message
-- =====================================================
DO $$ 
BEGIN
    RAISE NOTICE '✅ Database setup completed successfully!';
    RAISE NOTICE '📊 Sample data inserted';
    RAISE NOTICE '🔍 Indexes created for performance';
    RAISE NOTICE '⚡ Triggers configured';
END $$;