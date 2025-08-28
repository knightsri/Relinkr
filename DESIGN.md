## **Project Relinkr: A Blazingly Fast, Self-Hosted URL Redirector**

### 1. Abstract

**Relinkr** is a modern, lightweight, and performant URL redirection service designed to be self-hosted with ease. It provides individuals and organizations with a powerful tool to create, manage, and track branded short links under their own domain. Built with a focus on speed and simplicity, the entire application runs in a single Docker container, leveraging Redis for instantaneous lookups.

***

### 2. Core Features

- **Custom & Case-Insensitive Slugs:** Users can define their own human-readable short URLs (e.g., `My-Event`), which are normalized and stored in a case-insensitive manner to prevent collisions.  
  - *Changing a slug deletes the old slug and creates a new one; a user warning is displayed to clarify this non-reversible action.*
- **Secure Random Slug Generation:** Automatically generate a unique, non-guessable slug for any URL using the `nanoid` library.
- **Click Tracking:** An integrated counter tracks the number of times each link is accessed.
- **Enhanced Logging (Optional):** If enabled, the system can log the timestamp, referrer, IP address, and user-agent for each click, providing deeper analytics.  
- **Dynamic QR Code Generation:** Instantly generate and display a high-quality **SVG** QR code for every created link, simplifying mobile sharing.
- **Simple User Dashboard:** An authenticated user can view, search, paginate, manage, and delete all of their created links from a single, clean interface.  
  - *Search and pagination are explicitly supported and optimized for large datasets.*
- **Dockerized Deployment:** The entire application is containerized for simple, one-command deployment on any system.  
  - *All secrets are provided via environment variables. The Docker image runs as a non-root user and uses a minimal base image.*

***

### 3. Technical Architecture

- **Frontend:** **Next.js (React)**
  - Provides a fast, modern user experience with server-side rendering (SSR) for quick initial page loads.
- **Backend:** **Next.js API Routes (Node.js)**
  - Keeps the entire project within a single, unified framework, ideal for creating the lightweight REST API needed to manage links.
- **Database:** **Redis**
  - As an in-memory key-value store, Redis is purpose-built for incredibly fast URL lookups. Its atomic `INCR` command is the most efficient way to handle simple click counting. It can be configured for data persistence to prevent data loss on restart.
- **URL Validation:** **Zod**
  - To sanitize and validate all incoming long URLs, ensuring they are well-formed and secure before being stored. The system will enforce the use of `https`.

***

### 4. Authentication & Authorization

**Relinkr uses an OAuth-based authentication system** via the **`NextAuth.js`** library.

- **Providers:** Initial support for **GitHub** and **Google** to handle user sign-in.
- **Secure API Operations:**  
  - All operations that modify data (create, update, delete) must be authenticated and authorized.
  - The system uses a non-guessable **internal ID** for each link record in API calls, not public-facing slugs.
  - The backend will always verify that the `userId` from the session matches the `userId` stored with the link, returning a `403 Forbidden` error on mismatch.
  - Requests for entities not found will return a `404 Not Found`. Bad data inputs generate `400 Bad Request`. Internal errors return `500 Internal Server Error`.

***

### 5. Data Models (Redis Schema)

- **URL Mapping:** Stores the core redirection data. Slugs are stored in lowercase to ensure case-insensitivity.
  - **Key:** `url:{slug}` (e.g., `url:my-event`)
  - **Value:** `{ "longUrl": "https://destination-url.com", "ownerId": "github-12345", "internalId": "aBcDeFg123" }` (stored as JSON)
- **Click Counter:** Tracks the simple click count for each link.
  - **Key:** `clicks:{slug}`
  - **Value:** An integer
- **Link Ownership:** Maps a user to the slugs they've created for efficient lookup.
  - **Key:** `user:{userId}:links`
  - **Value:** A Redis Set (all slugs owned by the user)
- **Detailed Log (Optional):** If enabled, a Redis List stores detailed click data per event.
  - **Key:** `log:{slug}`

***

### 6. Privacy & Compliance

- **Privacy Notice:** If detailed logging is enabled, the application displays a **privacy policy and/or cookie banner** configurable by the administrator, informing end-users what data is collected and why.
- **Granular Control:** Admin environment variables enable/disable detailed logging and IP address collection independently.
- **User Data Erasure:**  
  - *A future enhancement will provide a command-line script/admin tool to permanently erase a user and all their data (“forget me” support) for legal compliance and user requests. Until then, manual deletion by an admin is required.*

***

### 7. Error Handling

- **403 Forbidden:** Returned for all authorization errors or attempted access to other users’ links.
- **404 Not Found:** Returned when a link or resource does not exist.
- **400 Bad Request:** For input validation failures.
- **500 Internal Server Error:** For unhandled exceptions or backend errors.
- **Expired Links:**  
  - *A future enhancement will support link expiry by timestamp or usage count. Expired links will return a user-friendly “Link Expired” message distinct from “Not Found (404).”*

***

### 8. Deployment

- All application secrets—including OAuth credentials and Redis connection details—are supplied via environment variables.  
- The Docker container runs as a non-root user, with a minimal, secure base image to minimize security risks.

***

### 9. Future Enhancements

1. **Bad Link (404) Checker:** Optional async job scanning all stored long URLs for validity; flagged links shown in the dashboard.
2. **Link Expiry:** Support for expiry time/date or usage limit on links; expired links display a “Link Expired” message, not “Not Found”.
3. **Advanced Analytics Dashboard:** Enhanced graphs, heatmaps, and breakdowns (location, device, referrer, etc.).
4. **Pluggable Database Backend:** Code-level repository pattern to allow Redis or MongoDB (or other DBs) as backend—selected at install.
5. **API Keys:** User-generated API keys for custom/dev automation with programmatic link management.
6. **Custom Social Media Previews (OG Tags):** User-defined metadata for richer sharing on social platforms.
7. **User Data Erasure Script:** Command-line or admin tool to automate erased-by-request compliance and data privacy handling.
8. **Attack Surface Hardening:** Add rate limiting, suspicious activity logging, brute-force detection, and related security controls.

***
