<h1 align='center'>Smart Panchayat</h1>
<p align='center'>
  Smart Panchayat is a Node.js and Express-based backend system designed to streamline rural governance and commerce. It integrates Sequelize ORM for database management, Firebase Authentication for secure login via mobile OTP, and supports shops, products, orders, and shipment management in a scalable microservices-ready architecture.
</p>

<div align='center'>
<img src='https://img.shields.io/badge/Status-Completed-green'/>
<img src='https://img.shields.io/badge/Node.js-18.x-brightgreen?logo=node.js'/>
<img src='https://img.shields.io/badge/Express-4.x-blue?logo=express'/>
<img src='https://img.shields.io/badge/Sequelize-ORM-orange?logo=sequelize'/>
<img src='https://img.shields.io/badge/Firebase-Auth-yellow?logo=firebase)'/>
<img src='https://img.shields.io/badge/License-Proprietary-red'/>
<img src='https://img.shields.io/badge/Code%20Style-Prettier-ff69b4?logo=prettier' />
<img src='https://img.shields.io/badge/Linting-ESLint-purple?logo=eslint'/>
<img src='https://img.shields.io/badge/Database-MySQL-blue?logo=mysql' />
<img src='https://img.shields.io/badge/ORM-Sequelize-orange?logo=sequelize' />
<img src='https://img.shields.io/badge/Version-1.0.0-blue'/>
</div>

---

## 2. Table of Contents

1. Project Overview/Purpose
2. Features/Functionality
3. Tech Stack
4. Installation
5. Config/Environment Variables
6. Tests
7. Deployment Instructions
8. Coding standards/Linting
9. License
10. Author

---

## 3. Project Overview/Purpose

Smart Panchayat is a comprehensive platform designed to streamline and optimize the management of resources and information within a Panchayat. It aims to improve efficiency, transparency, and accountability in local governance. Target users include Panchayat officials, residents, and other stakeholders. The project addresses the challenges of managing resources, tracking projects, and engaging with the community effectively.

---

## 4. Features/Functionality

- User Management (CRUD operations, role-based access control)
- Shop Management (add, update, view shops)
- Product Management (add, update, delete, view products; manage product categories)
- Order Management (add, update, view order history)
- Shipment Management (Track shipments, add shops to shipments, manage shipment products)
- Category Management (add, update, delete categories)
- Agent Management (CRUD operations)
- Secure Authentication (Firebase authentication)
- Robust Data Validation (using Joi)
- Detailed Logging (using Winston)
- AWS S3 Integration for file storage
- Database Migrations (using Sequelize)
- Unit Tests for various services

## 📂 Project Structure
```bash
Smart-Panchayat/
├── config/              # Database & Firebase configuration
├── migrations/          # Sequelize migration files
├── models/              # Sequelize models
├── services/            # Business logic
├── middleware/          # Auth & custom middlewares
├── utils/               # Utility functions (e.g., logger)
├── seeders/             # Sequelize seeders
├── app.js               # Express app entry point
└── package.json
```

---

## 5. Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** Sequelize, PostgreSQL (implied from migrations)
- **Cloud:** AWS S3 (for file storage), Firebase (for Authentication)
- **ORM:** Sequelize
- **Validation:** Joi
- **Logging:** Winston
- **Security:** Helmet, bcrypt, Firebase Authentication
- **Other:** dotenv, morgan, aws-sdk, firebase-admin

---

## 6. Installation

1. Clone the repository:

```sh
git clone <repository url>
```

2. Install dependencies:

```sh
npm install
```

3. Migrate the database:

```sh
npx sequelize-cli db:migrate
```

4. Seed the database (if needed):

```sh
npx sequelize-cli db:seed --seed 20250905060733-admin-user.js
```

5. Run the eslint linter:

```sh
npm run lint
```

---

## 7. Config/Environment Variables

Create a `.env` file in the root directory with the following variables:

- # Database
DB_HOST=localhost
DB_USER=root
DB_PASS=yourpassword
DB_NAME=smart_panchayat
DB_DIALECT=mysql

- # Firebase
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_service_account_email

- # Default profile image
DEFAULT_PROFILE_IMAGE=https://example.com/default.png

---

## 8. Tests

Run unit tests:

```sh
npm test
```

---

## 9. Deployment Instructions

Deployment instructions would depend on your chosen platform (e.g., Heroku, AWS, Google Cloud). Generally, you would need to build the application (`npm run build`), create a Docker image, and deploy the image to your chosen platform.

---

## 10. Coding standards/Linting

The project uses ESLint for code linting. Run `npm run lint` to check for code style issues. Prettier is used for code formatting.

---

## 11. License

All Rights Reserved.

Copyright (c) 2025, Deviprasad Rai P
Unauthorized copying, modification, distribution, or use of this software, via any medium, is strictly prohibited.
Proprietary and confidential.

---

## 12. Author

Deviprasad Rai P
<dpraidola@gmail.com>
