## **Project Relinkr: A Blazingly Fast, Self-Hosted URL Redirector**

### 1. Abstract

**Relinkr** is a modern, lightweight, and performant URL redirection service designed to be self-hosted with ease. It provides individuals and organizations with a powerful tool to create, manage, and track branded short links under their own domain. Built with a focus on speed and simplicity, the entire application runs in a single Docker container, leveraging Redis for instantaneous lookups.

***

### 2. Core Features

* **Custom & Case-Insensitive Slugs**: Users can define their own human-readable short URLs (e.g., `My-Event`), which are normalized and stored in a case-insensitive manner to prevent collisions.
* **Secure Random Slug Generation**: Automatically generate a unique, non-guessable slug for any URL using the `nanoid` library.
* **Click Tracking**: An integrated counter tracks the number of times each link is accessed.
* **Enhanced Logging (Optional)**: If enabled, the system can log the timestamp, referrer, IP address, and user-agent for each click, providing deeper analytics.
* **Dynamic QR Code Generation**: Instantly generate and display a high-quality **SVG** QR code for every created link, simplifying mobile sharing.
* **Simple User Dashboard**: An authenticated user can view, manage, and delete all of their created links from a single, clean interface.
* **Dockerized Deployment**: The entire application is containerized for simple, one-command deployment on any system.

***

### 3. Technical Architecture

* **Frontend**: **Next.js (React)**
    * *Why*: Provides a fast, modern user experience with server-side rendering (SSR) for quick initial page loads.
* **Backend**: **Next.js API Routes (Node.js)**
    * *Why*: Keeps the entire project within a single, unified framework, ideal for creating the lightweight REST API needed to manage links.
* **Database**: **Redis**
    * *Why*: As an in-memory key-value store, Redis is purpose-built for incredibly fast URL lookups. Its atomic `INCR` command is the most efficient way to handle simple click counting. It can be configured for data persistence to prevent data loss on restart.
* **URL Validation**: **Zod**
    * *Why*: To sanitize and validate all incoming long URLs, ensuring they are well-formed and secure before being stored. The system will enforce the use of `https`.

***

### 4. Authentication & Authorization

To keep the application secure and simple, **Relinkr uses an OAuth-based authentication system** via the **`NextAuth.js`** library.

* **Providers**: Initial support for **GitHub** and **Google** to handle user sign-in.
* **Secure API Operations**: User security is paramount. All operations that modify data (create, update, delete) must be protected.
    * Instead of using public-facing slugs for API calls, the system will use a non-guessable **internal ID** for each link record.
    * When a user attempts to modify a link via its internal ID, the backend will first retrieve the record and **verify that the `userId` from the session matches the `userId` stored with the link**.
    * Requests to modify resources not owned by the user will be rejected with a `403 Forbidden` status. This prevents any user from ever accessing or modifying another user's data.

***

### 5. Data Models (Redis Schema)

* **URL Mapping**: Stores the core redirection data. Slugs are stored in lowercase to ensure case-insensitivity.
    * **Key**: `url:{slug}` (e.g., `url:my-event`)
    * **Value**: `{ "longUrl": "https://destination-url.com", "ownerId": "github-12345", "internalId": "aBcDeFg123" }` (stored as a JSON string)
* **Click Counter**: Tracks the simple click count for each link.
    * **Key**: `clicks:{slug}` (e.g., `clicks:my-event`)
    * **Value**: An integer (e.g., `142`)
* **Link Ownership**: Maps a user to the slugs they've created for efficient lookup.
    * **Key**: `user:{userId}:links` (e.g., `user:github-12345:links`)
    * **Value**: A Redis Set containing all slugs owned by the user (`"my-event"`, `"qr5tx"`, etc.).
* **Detailed Log (Optional)**: If enabled, a Redis List stores detailed click data.
    * **Key**: `log:{slug}` (e.g., `log:my-event`)
    * **Value**: A list of JSON objects, with each object representing a single click event.

***

### 6. Privacy & Compliance

Given the optional collection of user data like IP addresses, privacy is a key consideration.

* **Privacy Notice**: If detailed logging is enabled by the instance administrator, the application must display a configurable **privacy policy and/or cookie banner**. This notice will inform end-users (visitors clicking the links) what data is being collected and for what purpose.
* **Granular Control**: Instance owners will have environment variables to enable/disable detailed logging and IP address collection independently.

***

### 7. Future Enhancements

This section outlines potential features and improvements for future versions of Relinkr.

1.  **Bad Link (404) Checker**
    * **Problem**: Users may inadvertently create links to pages that are temporarily down or no longer exist, leading to a poor user experience.
    * **Solution**: Implement an optional, asynchronous background job that periodically scans all stored long URLs. If a URL returns a `404 Not Found` or other critical error status, it will be flagged in the user's dashboard, allowing them to correct it.
2.  **Advanced Analytics Dashboard**
    * **Description**: A dedicated dashboard page where users can visualize the traffic their links are receiving.
    * **Potential Metrics**:
        * Click trends over time (daily, weekly, monthly graphs).
        * Geographic heatmap of clicks by country or city.
        * Top 5 referrers sending traffic to their links.
        * A breakdown of traffic by device type (mobile vs. desktop) and browser.
3.  **Pluggable Database Backend**
    * **Description**: Provide the flexibility for an administrator to choose their database backend upon setup. The default would be Redis for its speed and simplicity.
    * **Solution**: This would involve creating a data abstraction layer (e.g., a "repository pattern") in the application code. This layer would provide a consistent interface for querying data, while the underlying implementation would handle the specific logic for either Redis or MongoDB.
4.  **API Keys for Programmatic Access**
    * **Description**: Allow users to generate personal API keys from their dashboard. This would empower them to integrate Relinkr into their own applications, scripts, or CI/CD pipelines to programmatically create and manage links.
5.  **Custom Social Media Previews (OG Tags)**
    * **Description**: Enable users to define a custom title, description, and preview image for each link. When the short link is shared on platforms like Twitter, Facebook, or Slack, it would display this custom preview instead of the destination page's content.
