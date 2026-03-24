
SalonEase: Is a web-based salon booking system where customers request appointments and
admins review, confirm, and manage them.

Built with Node.js, Express, MySQL, and Pug - containerised with Docker.


TEAM
Name                    Role                  Student ID
----------------------  --------------------  ----------
Muhammad Wasim Khan     Scrum Master          A00069573

America Bernal Hluz     Product Owner         A00081045

Ravula Bhavya Sree      Database Developer    A00080748


TASKBOARD
---------
GitHub Projects: [replace with your Projects link]


HOW IT WORKS
------------
Appointments follow a controlled lifecycle:

  Customer books --> in_review --> Admin calls customer and discusses --> Admin confirms/rejects --> incase confirmed --> Service done --> completed

- Customers register, select services, and submit a booking request.
- Admins review requests, calls customers to discuss and finalize --> if agreed confirms appointment otherwise rejects --> incase confirmed --> assign staff --> customer arrives at appointment time --> staff provides service.
- After the service, admins mark the appointment as completed with the final price.

Three user roles: Customer, Admin, ( Staff is there but has nothing to do with the app in MVP )


PROJECT STRUCTURE
-----------------
salonEase/
  app/
    middleware/       Auth and role-based access
    models/           Database models
    services/         Business logic
    views/            Pug templates
    app.js            Express app setup
  db/                 Database scripts (cleaner, seeder)
  static/             CSS, JS, assets
  Dockerfile
  docker-compose.yml
  index.js            Entry point
  .env.example


GETTING STARTED
---------------
Requirements: Docker (https://www.docker.com/)

Run the app:
  docker-compose up

App:        http://localhost:3000
phpMyAdmin: http://localhost:8081


TEST ACCOUNTS
-------------
customer1@gmail.com
admin1@gmail.com
All accounts use the password: test123

Role        Email
----------  ------------------------------------------
Admin       admin1@gmail.com, admin2@gmail.com
Customer    customer1@gmail.com to customer8@gmail.com


TECH STACK
----------
Backend:    Node.js, Express
Database:   MySQL
Templates:  Pug
DB Admin:   phpMyAdmin
Container:  Docker


================================================================================
University of Roehampton | 2025-2026
================================================================================
