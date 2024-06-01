
# Natour

[Natour](https://natours-final-course-project.onrender.com) is a tour booking website where users can book tours and start their amazing journeys. The website includes features such as user authentication, tour booking, payment processing, reviews, bookmarks, and more.
### Table of contents
- [Features](#feature)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Develoyment](#develoyment)

### Features
- User Authentication (Login, Signup, JWT)
- User Profile Management
- Tour Booking and Payment Processing (Stripe)
- Tour Reviews and Bookmarks
- Image Uploads (Multer, Sharp)
- Email Notifications (Nodemailer)
- Security Features (Rate Limiting, Input Sanitization, CORS)
- Server-Side Rendering (NodeJS, ExpressJS, Pug)
- Client-Side Transpilation and Bundling (Parcel, Babel)

### Tech Stack
- Frontend: Pug, Parcel, Babel
- Backend: NodeJS, ExpressJS
- Database: MongoDB (MongoDB Atlas)
- Payment Processing: Stripe
- Image Uploads: Multer, Sharp
- Email: Nodemailer, Gmail
- Authentication: JWT
- Deployment: Render
- Version Control: Git

### Installation
#### Prerequisites
- Node.js
- npm
- MongoDB Atlas account
- Stripe account
- Nodemailer and Gmail accounts for development and production email notifications

#### Steps
1, Clone the repository
```bash
 git clone https://github.com/BCIamLong/Learn-Nodejs-4.git
 cd natour
```
2, Install dependencies
```bash
npm install
```
3, Environment Variables

Create a .env file in the root of your project and add the following:
 ```bash
NODE_ENV=development
PORT=3000
DATABASE=<your-mongodb-atlas-connection-string>
DATABASE_PASSWORD=<your-database-password>
JWT_SECRET=<your-jwt-secret>
JWT_EXPIRES_IN=90d
JWT_COOKIE_EXPIRES_IN=90
EMAIL_USERNAME=<your-email-username>
EMAIL_PASSWORD=<your-email-password>
EMAIL_HOST=<your-email-host>
EMAIL_PORT=<your-email-port>
STRIPE_SECRET_KEY=<your-stripe-secret-key>
```   
4, Run the application
```bash
npm start
```

### Deployment
The project is deployed on Render. Follow these steps to deploy your own instance:
- Create a Render account and set up a new web service.
- Connect your GitHub repository containing the Natour project.
- Set environment variables in Render dashboard similar to your .env file.
- Deploy the project.
