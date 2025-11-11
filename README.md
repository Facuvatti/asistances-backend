
# 📘 School Attendance System
A web application for recording and viewing student attendance.  
It allows users to display attendance data **by class** or **by individual student**
## 🚀 Main Features

### 🔑 Registration

You can try it not logged in!
Persistent and private storage, for every user.
Access based on each school role (so everyone can view what is appropriate for their specific position).
- Teacher
- Student
- Parent
- "Administrative asistance" (Preceptor)

### ✍ Take atendance
Is a easier and faster way to make it. A dynamic and esthetic, visualization. With a very good interactive interface
Choose your classroom or subject to see your students and select if they went to school today!

#### 👀 Visualize

Filtering based on
- Course and date
- All the absences of a student on a subject or just their course

### ☁️ Upload course and students

#### 👨‍🎓 Students
You can upload them one by one, or all at once

#### 👥 Courses
Specify **year, division and specialty**

#### 👨‍🏫 Teachers and their subjects

### 🛠️ Technologies

- **Architecture:** MVC
- **Frontend:** HTML, CSS, JavaScript (modular)
- **Backend:** Node.js with Express, cors, morgan
- **Enviroment:** Cloudflare workers
- **Database:** SQLite (D1 database of cloudflare)
- **User Segregation:** bcrypt, passport and express-session.
