ALTER DATABASE 
    CHARACTER SET utf8mb4 
    COLLATE utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    UNIQUE(name)
);
CREATE TABLE IF NOT EXISTS devices (
    fingerprint VARCHAR(255) NOT NULL PRIMARY KEY,
    user INT,
    FOREIGN KEY (user) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS courses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    year SMALLINT NOT NULL,
    division SMALLINT NOT NULL,
    specialty VARCHAR(255) NOT NULL,
    user INT NOT NULL,
    FOREIGN KEY (user) REFERENCES users(id),
    UNIQUE(year, division, specialty, user)
);

CREATE TABLE IF NOT EXISTS subjects (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    teacher VARCHAR(255),
    hours INT,
    course INT NOT NULL,
    FOREIGN KEY (course) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE(name,course)
);
CREATE TABLE IF NOT EXISTS students (
    id INT PRIMARY KEY AUTO_INCREMENT,
    lastname VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    course INT NOT NULL,
    FOREIGN KEY (course) REFERENCES courses(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS asistances (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student INT NOT NULL,
    subject INT,
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    presence ENUM("P", "T", "A", "RA") NOT NULL,
    FOREIGN KEY (student) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (subject) REFERENCES subjects(id) ON DELETE CASCADE
);