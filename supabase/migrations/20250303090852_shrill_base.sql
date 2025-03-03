/*
  # Course content, assignments, and progress tracking

  1. New Tables
    - `course_content` - Stores different types of learning content (video or text)
      - `id` (uuid, primary key)
      - `topic_id` (text, references topic)
      - `title` (text)
      - `content_type` (text - 'video' or 'text')
      - `content` (text - URL for video or text content)
      - `created_at` (timestamp)
      - `created_by` (uuid, references profiles)
    
    - `assignments` - Stores assignments created by teachers
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `due_date` (timestamp)
      - `created_at` (timestamp)
      - `teacher_id` (uuid, references profiles)
    
    - `student_assignments` - Links students to assignments
      - `id` (uuid, primary key)
      - `assignment_id` (uuid, references assignments)
      - `student_id` (uuid, references profiles)
      - `status` (text - 'assigned', 'in_progress', 'completed')
      - `submitted_at` (timestamp)
      - `score` (integer)
    
    - `student_progress` - Tracks student progress through courses
      - `id` (uuid, primary key)
      - `student_id` (uuid, references profiles)
      - `content_id` (uuid, references course_content)
      - `completed` (boolean)
      - `completed_at` (timestamp)
      - `preferred_content_type` (text - 'video' or 'text')
    
    - `parent_child` - Links parents to their children
      - `id` (uuid, primary key)
      - `parent_id` (uuid, references profiles)
      - `child_id` (uuid, references profiles)

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for each role
*/

-- Course Content Table
CREATE TABLE IF NOT EXISTS course_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id text NOT NULL,
  title text NOT NULL,
  content_type text NOT NULL CHECK (content_type IN ('video', 'text')),
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES profiles(id)
);

ALTER TABLE course_content ENABLE ROW LEVEL SECURITY;

-- Policies for course_content
CREATE POLICY "Anyone can view course content"
  ON course_content
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Teachers can insert course content"
  ON course_content
  FOR INSERT
  TO authenticated
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'teacher');

CREATE POLICY "Teachers can update their own course content"
  ON course_content
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid() AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'teacher');

-- Assignments Table
CREATE TABLE IF NOT EXISTS assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  due_date timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  teacher_id uuid REFERENCES profiles(id) NOT NULL
);

ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;

-- Policies for assignments
CREATE POLICY "Teachers can view all assignments"
  ON assignments
  FOR SELECT
  TO authenticated
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'teacher');

CREATE POLICY "Students can view assignments assigned to them"
  ON assignments
  FOR SELECT
  TO authenticated
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'student' AND
    EXISTS (
      SELECT 1 FROM student_assignments 
      WHERE assignment_id = assignments.id AND student_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can create assignments"
  ON assignments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'teacher' AND
    teacher_id = auth.uid()
  );

CREATE POLICY "Teachers can update their own assignments"
  ON assignments
  FOR UPDATE
  TO authenticated
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'teacher' AND
    teacher_id = auth.uid()
  );

-- Student Assignments Table
CREATE TABLE IF NOT EXISTS student_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid REFERENCES assignments(id) NOT NULL,
  student_id uuid REFERENCES profiles(id) NOT NULL,
  status text NOT NULL CHECK (status IN ('assigned', 'in_progress', 'completed')),
  submitted_at timestamptz,
  score integer,
  UNIQUE(assignment_id, student_id)
);

ALTER TABLE student_assignments ENABLE ROW LEVEL SECURITY;

-- Policies for student_assignments
CREATE POLICY "Teachers can view all student assignments"
  ON student_assignments
  FOR SELECT
  TO authenticated
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'teacher' AND
    EXISTS (
      SELECT 1 FROM assignments 
      WHERE id = student_assignments.assignment_id AND teacher_id = auth.uid()
    )
  );

CREATE POLICY "Students can view their own assignments"
  ON student_assignments
  FOR SELECT
  TO authenticated
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'student' AND
    student_id = auth.uid()
  );

CREATE POLICY "Parents can view their children's assignments"
  ON student_assignments
  FOR SELECT
  TO authenticated
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'parent' AND
    EXISTS (
      SELECT 1 FROM parent_child 
      WHERE parent_id = auth.uid() AND child_id = student_assignments.student_id
    )
  );

CREATE POLICY "Teachers can assign assignments to students"
  ON student_assignments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'teacher' AND
    EXISTS (
      SELECT 1 FROM assignments 
      WHERE id = student_assignments.assignment_id AND teacher_id = auth.uid()
    )
  );

CREATE POLICY "Students can update their own assignments"
  ON student_assignments
  FOR UPDATE
  TO authenticated
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'student' AND
    student_id = auth.uid()
  );

CREATE POLICY "Teachers can update student assignments they created"
  ON student_assignments
  FOR UPDATE
  TO authenticated
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'teacher' AND
    EXISTS (
      SELECT 1 FROM assignments 
      WHERE id = student_assignments.assignment_id AND teacher_id = auth.uid()
    )
  );

-- Student Progress Table
CREATE TABLE IF NOT EXISTS student_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES profiles(id) NOT NULL,
  content_id uuid REFERENCES course_content(id) NOT NULL,
  completed boolean DEFAULT false,
  completed_at timestamptz,
  preferred_content_type text CHECK (preferred_content_type IN ('video', 'text')),
  UNIQUE(student_id, content_id)
);

ALTER TABLE student_progress ENABLE ROW LEVEL SECURITY;

-- Policies for student_progress
CREATE POLICY "Students can view and update their own progress"
  ON student_progress
  FOR ALL
  TO authenticated
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'student' AND
    student_id = auth.uid()
  );

CREATE POLICY "Teachers can view student progress"
  ON student_progress
  FOR SELECT
  TO authenticated
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'teacher'
  );

CREATE POLICY "Parents can view their children's progress"
  ON student_progress
  FOR SELECT
  TO authenticated
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'parent' AND
    EXISTS (
      SELECT 1 FROM parent_child 
      WHERE parent_id = auth.uid() AND child_id = student_progress.student_id
    )
  );

-- Parent-Child Relationship Table
CREATE TABLE IF NOT EXISTS parent_child (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid REFERENCES profiles(id) NOT NULL,
  child_id uuid REFERENCES profiles(id) NOT NULL,
  UNIQUE(parent_id, child_id)
);

ALTER TABLE parent_child ENABLE ROW LEVEL SECURITY;

-- Policies for parent_child
CREATE POLICY "Parents can view their children"
  ON parent_child
  FOR SELECT
  TO authenticated
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'parent' AND
    parent_id = auth.uid()
  );

CREATE POLICY "Parents can add children"
  ON parent_child
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'parent' AND
    parent_id = auth.uid()
  );

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_course_content_topic_id ON course_content(topic_id);
CREATE INDEX IF NOT EXISTS idx_assignments_teacher_id ON assignments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_student_assignments_student_id ON student_assignments(student_id);
CREATE INDEX IF NOT EXISTS idx_student_assignments_assignment_id ON student_assignments(assignment_id);
CREATE INDEX IF NOT EXISTS idx_student_progress_student_id ON student_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_student_progress_content_id ON student_progress(content_id);
CREATE INDEX IF NOT EXISTS idx_parent_child_parent_id ON parent_child(parent_id);
CREATE INDEX IF NOT EXISTS idx_parent_child_child_id ON parent_child(child_id);