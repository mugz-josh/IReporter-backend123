-- Users table
CREATE TABLE users(
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    is_admin BOOLEAN DEFAULT FALSE,
    profile_picture VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Red-flags table with direct image/video/audio storage
CREATE TABLE red_flags (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'under-investigation', 'rejected', 'resolved')),
    images JSON, -- Store array of image file paths
    videos JSON, -- Store array of video file paths
    audio JSON, -- Store array of audio file paths
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
-- Interventions table with direct image/video/audio storage
CREATE TABLE interventions (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'under-investigation', 'rejected', 'resolved')),
    images JSON, -- Store array of image file paths
    videos JSON, -- Store array of video file paths
    audio JSON, -- Store array of audio file paths
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
-- Create indexes for better performance
CREATE INDEX idx_red_flags_user_id ON red_flags(user_id);
CREATE INDEX idx_red_flags_status ON red_flags(status);
CREATE INDEX idx_interventions_user_id ON interventions(user_id);
CREATE INDEX idx_interventions_status ON interventions(status);
CREATE INDEX idx_users_email ON users(email);
-- Insert a default admin user (password: admin123)
INSERT INTO users (first_name, last_name, email, password, is_admin)
VALUES ('Admin', 'User', 'Mollyadmin@ireporter.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', TRUE);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    related_entity_type VARCHAR(50) DEFAULT NULL,
    related_entity_id INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Comments table for community interaction
CREATE TABLE IF NOT EXISTS comments (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    report_type VARCHAR(50) NOT NULL CHECK (report_type IN ('red_flag', 'intervention')),
    report_id INT NOT NULL,
    comment_text TEXT NOT NULL,
    comment_type VARCHAR(50) DEFAULT 'user' CHECK (comment_type IN ('user', 'admin', 'official')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Upvotes table for liking reports
CREATE TABLE IF NOT EXISTS upvotes (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    report_type VARCHAR(50) NOT NULL CHECK (report_type IN ('red_flag', 'intervention')),
    report_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE (user_id, report_type, report_id)
);

-- Follows table for following reports
CREATE TABLE IF NOT EXISTS follows (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    report_type VARCHAR(50) NOT NULL CHECK (report_type IN ('red_flag', 'intervention')),
    report_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE (user_id, report_type, report_id)
);

-- Create indexes for better performance
CREATE INDEX idx_comments_report ON comments(report_type, report_id);
CREATE INDEX idx_upvotes_report ON upvotes(report_type, report_id);
CREATE INDEX idx_follows_report ON follows(report_type, report_id);
