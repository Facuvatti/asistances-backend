-- https://excalidraw.com/#json=rb6fS3JjvmacpKf9le3H2,CfHAWU56u5VVi4kKFtL6nQ
ALTER DATABASE 
    CHARACTER SET utf8mb4 
    COLLATE utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    UNIQUE(name)
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
    user INT NOT NULL,
    FOREIGN KEY (course) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (user) REFERENCES users(id),
    UNIQUE(name,course,user)
);
CREATE TABLE IF NOT EXISTS students (
    id INT PRIMARY KEY AUTO_INCREMENT,
    lastname VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    course INT NOT NULL,
    user INT NOT NULL,
    FOREIGN KEY (course) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (user) REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS asistances (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student INT NOT NULL,
    subject INT,
    user INT NOT NULL,
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    presence ENUM("P", "T", "A", "RA") NOT NULL,
    FOREIGN KEY (student) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (subject) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (user) REFERENCES users(id)
);