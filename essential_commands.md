# Essential Commands - SalonEase

## Run the Application

docker-compose up

## Stop the Application

docker-compose down

## Database Management

### Clean Database (Remove all data)

docker exec -it salonease-salonease-web-1 node db/cleaner.js

### Seed Database (Add test data)

docker exec -it salonease-salonease-web-1 node db/smart-seeder.js
## Login Credentials (After Seeding)

**Customer:**
- Email: 
customer1@gmail.com

- Password: 
test123


**Admin:**
- Email: 
admin1@gmail.com
- Password: 
test123


## Quick Start

1. Start the application: 
docker-compose up

2. Clean the database: 
node db/cleaner.js

3. Seed test data: 
node db/smart-seeder.js

4. Access the app: 
http://localhost:3000

