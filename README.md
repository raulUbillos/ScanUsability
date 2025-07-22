# ScanController API

## Table of Contents
- [Setup & Run](#setup--run)
- [Running Automated Tests](#running-automated-tests)
- [API Usage (Postman)](#api-usage-postman)
- [Design Decisions](#design-decisions)
- [Time Spent](#time-spent)
- [Possible Improvements](#possible-improvements)

---

## Setup & Run

1. **Clone the repository:**
   ```sh
   git clone <your-repo-url>
   cd <your-repo-directory>
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```

3. **Configure environment variables:**
   - Copy `.env.example` to `.env` and fill in the required values (MongoDB connection string, port, etc).

4. **Start Database
   ```sh
   docker-compose up -d
   ```

4. **Start the application:**
   ```sh
   npm start
   ```

5. **The API will be available at:**
   - `http://localhost:3000` (or your configured port)

---

## Running Automated Tests

- **Unit tests:**
  ```sh
  npm test
  ```
  or, for a specific test file:
  ```sh
  npx jest src/test/controllers/ScanController.spec.ts
  ```

- **Test coverage:**
  ```sh
  npm run test:coverage
  ```

---

## API Usage (Postman)

- Import the provided `ScanController.postman_collection.json` file into Postman.
- The collection includes all endpoints and example requests/responses.
- Set the `baseUrl` variable in Postman to match your running server (default: `http://localhost:3000`).

**Endpoints include:**
- `POST /scan` — Create scan(s)
- `GET /scan/list` — List all scans
- `GET /scan/:id` — Get scan by ID
- `PUT /scan/:id` — Update scan
- `DELETE /scan/:id` — Delete scan
- `GET /scan/csvExport` — Export all scans as CSV
- `GET /scan/csvExport/:id` — Export a scan as CSV

---

## Design Decisions

- **Express & TypeScript:** Chosen for type safety and maintainability.
- **Mongoose:** Used for MongoDB object modeling and schema enforcement.
- **Service/Controller Structure:** Separation of concerns for easier testing and extensibility.
- **DTOs:** Used for request/response validation and clarity.
- **Automated Testing:** Jest with full controller coverage and mocks for all dependencies.
- **Postman Collection:** Provided for easy manual API exploration and testing.

---

## Time Spent

> _Replace this with your actual time spent._
- **Total:** 6 hours

---

## Possible Improvements

- Add Authentication and Authorization Flows (possible using passport)
- Add Enhancements to the CSV for better analysis
- Add integration testing
- Add a CI process and the usage of a tool of infraestructure as a code (eg. Terraform)
- Add a more comprenhensive error handling
- Add a process to handle failed scans
- Add linter and prettier
- Add pagination and various filters

---

