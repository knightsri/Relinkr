### Project Design Document

Here is a structured design document based on the current plan.

---

## **Project Relinkr: A Blazingly Fast, Self-Hosted URL Redirector**

### 1. Abstract

Project Relinkr is a modern, lightweight, and performant URL redirection service designed to be self-hosted with ease. It provides individuals and organizations with a powerful tool to create, manage, and track branded short links under their own domain. Built with a focus on speed, the entire application runs in a single Docker container, leveraging Redis for instantaneous lookups.

### 2. Core Features

* **Custom Slugs:** Users can define their own human-readable short URLs (e.g., `url.myco.com/spring-sale`).
* **Random Slug Generation:** Automatically generate a unique, short, non-guessable slug for any URL.
* **Click Tracking:** An integrated counter tracks the number of times each link is accessed, with stats displayed on the user dashboard.
* **QR Code Generation:** Instantly generate and display a QR code for every created link, simplifying mobile sharing.
* **Simple User Dashboard:** An authenticated user can view, manage, and delete all of their created links from a single, clean interface.
* **Dockerized Deployment:** The entire application is containerized for simple, one-command deployment on any system.

### 3. Technical Architecture

* **Frontend:** **Next.js (React)**
    * *Why:* Provides a fast, modern user experience with server-side rendering (SSR) for quick initial page loads. Its file-based routing is simple and intuitive.
* **Backend:** **Next.js API Routes (Node.js)**
    * *Why:* Keeps the entire project within a single, unified framework. It's perfect for creating the lightweight REST API needed to manage links without the overhead of a separate backend server.
* **Database:** **Redis**
    * *Why:* As an in-memory key-value store, Redis is purpose-built for the primary task: incredibly fast URL lookups. Its atomic `INCR` command is also the most efficient way to handle click counting.
* **Authentication:** **OAuth** (e.g., NextAuth.js)
    * *Why:* Provides a secure and simple way for users to sign in using existing accounts (Google, GitHub, etc.), removing the need to manage passwords.

### 4. Data Models (Redis Schema)

To maintain speed and simplicity, we will use a key-prefix convention in Redis.

* **URL Mapping:** Stores the core redirection data.
    * **Key:** `url:{slug}` (e.g., `url:spring-sale`)
    * **Value:** `https://destination-url.com/with/all/the/parameters`
* **Click Counter:** Tracks analytics for each link.
    * **Key:** `clicks:{slug}` (e.g., `clicks:spring-sale`)
    * **Value:** An integer (e.g., `142`)
* **Link Ownership:** Maps a user to the links they've created.
    * **Key:** `user:{userId}:links` (e.g., `user:github-12345:links`)
    * **Value:** A Redis Set containing all slugs owned by the user (`"spring-sale"`, `"qR5tX"`, etc.). This makes retrieving all links for a user's dashboard very efficient.

### 5. API Endpoints

The backend will be managed via a simple REST API.

* **`POST /api/links`**: Creates a new short link.
    * *Body:* `{ "longUrl": "...", "customSlug": "..." (optional) }`
    * *Returns:* The newly created link object, including the final slug and QR code data.
* **`GET /api/links`**: Retrieves all links for the authenticated user.
    * *Returns:* An array of link objects.
* **`DELETE /api/links`**: Deletes a link.
    * *Body:* `{ "slug": "..." }`
    * *Returns:* A success or failure message.

### 6. Core User Flow: Redirection

1.  A user navigates to `your-domain.com/{slug}`.
2.  The Next.js middleware or page router captures the `{slug}`.
3.  The application makes two asynchronous calls to Redis:
    1.  `GET url:{slug}` to retrieve the destination URL.
    2.  `INCR clicks:{slug}` to increment the click counter.
4.  If the `GET` call returns a valid URL, the application performs a permanent redirect (`308`).
5.  If the `GET` call returns `nil` (no link found), the user is shown a 404 page or redirected to the homepage.


### 7. Authentication & Authorization

To keep the application secure and simple for users, **Relinkr will use an OAuth-based authentication system**. This means users won't need to create or remember a new password for this service.

#### Strategy & Technology

We will use the **`NextAuth.js`** (now known as `Auth.js`) library. It's the industry standard for Next.js applications and makes implementing OAuth incredibly simple and secure.

* **Initial Providers**: To start, we'll support two of the most popular OAuth providers:
    1.  **GitHub**: Perfect for the developers who will be early adopters.
    2.  **Google**: A great catch-all for nearly any other user.
* **Session Management**: `NextAuth.js` will handle all session management automatically using secure, http-only cookies. This keeps users logged in as they navigate the app.

---

### 8. User Authentication Flow

1.  A new user visits the site and clicks "Login / Sign Up".
2.  They are presented with two options: "Continue with GitHub" and "Continue with Google".
3.  The user is redirected to their chosen provider (e.g., Google's login page).
4.  After successfully authenticating with the provider, they are redirected back to the Relinkr dashboard.
5.  On the backend, `NextAuth.js` creates a session and a unique user ID (e.g., `google-1092837465`).

---

### 9. Impact on Data Model

The `userId` provided by `NextAuth.js` is the key that links a user to their data in Redis.

* When a logged-in user creates a new link with the slug `spring-sale`, we will update the Redis Set for that user:
    * **Command**: `SADD user:google-1092837465:links "spring-sale"`
* When that user visits their dashboard, the application will query that specific key to retrieve and display all of their links.
