# 📚 BookShelf Tracker — Backend (Week 4)

A RESTful API server built with **Node.js**, **Express**, and **MongoDB Atlas (Mongoose)**.

## Tech Stack
- Node.js + Express 5
- MongoDB Atlas via Mongoose
- express-validator
- dotenv
- nodemon (dev)

---

## Folder Structure

`
backend/
├── server.js            # Entry point
├── index.js             # Alt entry
├── src/
│   ├── app.js           # Express app setup & route mounting
│   ├── config/
│   │   └── db.js        # MongoDB Atlas connection via Mongoose
│   ├── controllers/
│   │   ├── bookController.js
│   │   └── taskController.js
│   ├── models/
│   │   ├── bookModel.js        # Book Mongoose Schema
│   │   └── taskModel.js
│   ├── routes/
│   │   ├── bookRoutes.js       # /api/books routes
│   │   └── taskRoutes.js       # /tasks routes
│   └── validators/
│       ├── bookValidators.js
│       └── registrationValidators.js
`

---

## Book Schema

| Field       | Type   | Description                              |
|-------------|--------|------------------------------------------|
| title       | String | Required. Book title                     |
| author      | String | Author name                              |
| genre       | String | Book genre                               |
| status      | String | want to read / reading / finished        |
| rating      | Number | 1–5 stars                                |
| review      | String | User review note                         |
| userId      | String | ID of the user who added the book        |
| timestamps  | -      | createdAt and updatedAt auto-generated   |

---

## API Endpoints

### Books — /api/books

| Method | Endpoint         | Description                     |
|--------|------------------|---------------------------------|
| GET    | /api/books       | Get all books (filter: ?status=)|
| GET    | /api/books/:id   | Get single book by ID           |
| POST   | /api/books       | Create a new book               |
| PATCH  | /api/books/:id   | Update a book                   |
| DELETE | /api/books/:id   | Delete a book                   |

---

## Setup

1. Install dependencies: npm install
2. Create .env from .env.example and add your MONGO_URI
3. Run dev server: npm run dev
4. API runs at: http://localhost:5000
