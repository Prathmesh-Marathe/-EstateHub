# 🏡 EstateHub — Full-Stack MERN Real Estate Management System

A production-ready real estate platform built with **MongoDB, Express.js, React.js, and Node.js**.

---

## ✨ Features

### 👤 Authentication
- JWT-based registration & login
- Role-based access: **Admin** and **User**
- Protected routes on frontend and backend

### 🏠 Property Management
- Add, edit, and delete property listings
- Search & filter by city, type, price range, bedrooms
- Pagination support
- View count tracking

### 📸 Image Upload
- Cloudinary integration for cloud storage
- Multiple image upload (up to 10 per property)
- Image preview before upload
- Delete images from Cloudinary on property deletion

### ❤️ User Features
- Save/favourite properties
- Contact seller via inquiry form
- Personal dashboard with listings & messages

### 🛠️ Admin Panel
- Manage all users (activate/deactivate/delete)
- Manage all listings
- Feature/unfeature properties
- Dashboard with platform statistics

---

## 📁 Project Structure

```
real-estate-app/
├── package.json            ← Root (run both dev servers)
│
├── server/                 ← Node.js + Express Backend
│   ├── index.js
│   ├── .env.example
│   ├── config/
│   │   ├── db.js
│   │   └── cloudinary.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── propertyController.js
│   │   ├── userController.js
│   │   ├── adminController.js
│   │   └── contactController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Property.js
│   │   └── Contact.js
│   └── routes/
│       ├── auth.js
│       ├── properties.js
│       ├── users.js
│       ├── admin.js
│       └── contact.js
│
└── client/                 ← React Frontend
    ├── public/index.html
    ├── .env.example
    └── src/
        ├── App.js
        ├── index.js
        ├── context/
        │   └── AuthContext.js
        ├── utils/
        │   └── api.js
        ├── styles/
        │   └── global.css
        ├── components/
        │   ├── layout/
        │   │   ├── Navbar.js + Navbar.css
        │   │   └── Footer.js + Footer.css
        │   └── properties/
        │       ├── PropertyCard.js + PropertyCard.css
        │       ├── PropertyForm.js + PropertyForm.css
        │       └── SearchFilter.js + SearchFilter.css
        └── pages/
            ├── Home.js, Login.js, Register.js
            ├── Properties.js, PropertyDetail.js
            ├── Dashboard.js, AddProperty.js
            ├── EditProperty.js, SavedProperties.js
            └── admin/
                ├── AdminDashboard.js
                ├── AdminUsers.js
                └── AdminProperties.js
```

---

## 🚀 Setup Guide (Beginner-Friendly)

### Step 1 — Install Node.js

1. Go to [https://nodejs.org](https://nodejs.org)
2. Download the **LTS** version (18.x or 20.x)
3. Run the installer
4. Verify: open terminal → `node -v` and `npm -v`

---

### Step 2 — Set Up MongoDB

**Option A: MongoDB Atlas (Recommended — free cloud database)**

1. Go to [https://www.mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Sign up for a free account
3. Create a new **Free Cluster** (M0)
4. Under **Database Access** → Add a new user with username & password
5. Under **Network Access** → Add IP Address → `0.0.0.0/0` (allow all)
6. Go to **Clusters** → Connect → Drivers → Copy the connection string
   - It looks like: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/real-estate`
7. Replace `<password>` with your actual password

**Option B: Local MongoDB**

1. Download from [https://www.mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
2. Install and start the service
3. Your URI will be: `mongodb://localhost:27017/real-estate`

---

### Step 3 — Set Up Cloudinary

1. Go to [https://cloudinary.com](https://cloudinary.com) and sign up (free)
2. In your **Dashboard**, find your:
   - Cloud Name
   - API Key
   - API Secret
3. Keep these handy for the `.env` file

---

### Step 4 — Configure Environment Variables

```bash
# Navigate to the server folder
cd server

# Copy the example env file
cp .env.example .env
```

Open `server/.env` and fill in your values:

```env
PORT=5000
MONGODB_URI=mongodb+srv://youruser:yourpassword@cluster0.xxxxx.mongodb.net/real-estate
JWT_SECRET=your_super_secret_key_min_32_chars
JWT_EXPIRE=7d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

CLIENT_URL=http://localhost:3000
```

For the frontend:
```bash
cd client
cp .env.example .env
# The default value works for local development:
# REACT_APP_API_URL=http://localhost:5000/api
```

---

### Step 5 — Install Dependencies

```bash
# From the project root
npm install          # installs concurrently

cd server
npm install          # installs Express, Mongoose, JWT, Cloudinary, etc.

cd ../client
npm install          # installs React, React Router, Axios, etc.
```

Or use the convenience script from root:
```bash
npm run install-all
```

---

### Step 6 — Create Admin User

After starting the server, use this script or Postman to create your first admin:

```bash
# POST http://localhost:5000/api/auth/register
# Body (JSON):
{
  "name": "Admin User",
  "email": "admin@demo.com",
  "password": "admin123"
}
```

Then manually update the role in MongoDB Atlas:
- Go to Atlas → Browse Collections → `users` collection
- Find the user → Edit → change `role` from `"user"` to `"admin"`

---

### Step 7 — Run the Application

**Start Backend (Terminal 1):**
```bash
cd server
npm run dev
# Server starts on http://localhost:5000
```

**Start Frontend (Terminal 2):**
```bash
cd client
npm start
# App opens at http://localhost:3000
```

**Or run both simultaneously from root:**
```bash
# From project root
npm run dev
```

---

## 🧪 Testing the API (Postman)

Import these requests into Postman:

### Auth
| Method | URL | Description |
|--------|-----|-------------|
| POST | `http://localhost:5000/api/auth/register` | Register user |
| POST | `http://localhost:5000/api/auth/login` | Login |
| GET | `http://localhost:5000/api/auth/me` | Get profile (Auth required) |

### Properties
| Method | URL | Description |
|--------|-----|-------------|
| GET | `http://localhost:5000/api/properties` | List all properties |
| GET | `http://localhost:5000/api/properties?search=mumbai&type=apartment` | Search |
| GET | `http://localhost:5000/api/properties/:id` | Get single property |
| POST | `http://localhost:5000/api/properties` | Create (Auth, multipart/form-data) |
| PUT | `http://localhost:5000/api/properties/:id` | Update (Auth) |
| DELETE | `http://localhost:5000/api/properties/:id` | Delete (Auth) |

### Admin (requires Admin JWT)
| Method | URL | Description |
|--------|-----|-------------|
| GET | `http://localhost:5000/api/admin/stats` | Dashboard stats |
| GET | `http://localhost:5000/api/admin/users` | All users |
| PUT | `http://localhost:5000/api/admin/users/:id/status` | Toggle user status |
| PUT | `http://localhost:5000/api/admin/properties/:id/featured` | Feature property |

**For protected routes**, add this header:
```
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

---

## 🔧 Common Issues & Fixes

**Q: "Cannot connect to MongoDB"**
→ Check your `MONGODB_URI` in `.env`. For Atlas, ensure your IP is whitelisted.

**Q: "Cloudinary upload failing"**
→ Verify your 3 Cloudinary credentials in `.env`. Ensure the folder name in `cloudinary.js` is correct.

**Q: "CORS error in browser"**
→ Make sure `CLIENT_URL=http://localhost:3000` in server `.env`.

**Q: "JWT token not working"**
→ Ensure `JWT_SECRET` is set and the `Authorization: Bearer <token>` header is included.

**Q: "npm install fails"**
→ Try deleting `node_modules` and `package-lock.json`, then run `npm install` again.

---

## 🌐 Deployment

### Backend (Railway / Render)
1. Push your `server` folder to GitHub
2. Connect to Railway or Render
3. Add all environment variables from `.env`
4. Set start command: `node index.js`

### Frontend (Vercel / Netlify)
1. Push your `client` folder to GitHub
2. Connect to Vercel/Netlify
3. Set build command: `npm run build`
4. Set `REACT_APP_API_URL` to your deployed backend URL
5. For React Router, add a `_redirects` file in `public/`:
   ```
   /*  /index.html  200
   ```

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router 6, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose |
| Auth | JWT (JSON Web Tokens) |
| Images | Cloudinary + Multer |
| Styling | Custom CSS with CSS Variables |
| Notifications | React Toastify |

---

## 📄 License

MIT — Free to use for personal and commercial projects.
