# Reminder & Notification Service

A microservice designed to handle scheduled email notifications and reminders for the Airline Management System. Built with Node.js, Express, and Sequelize, this service operates asynchronously by consuming messages from a RabbitMQ broker, scheduling tasks, and sending emails at specified times.

---

## Features

-   **Asynchronous Operation:** Listens for events from a RabbitMQ message queue to create and schedule notifications, decoupling it from other services.
-   **Scheduled Email Delivery:** Uses `node-cron` to run a scheduled job that periodically checks for and sends pending emails.
-   **Persistent Job Queue:** Leverages a MySQL database to store notification "tickets," creating a reliable and persistent queue of tasks.
-   **Status Tracking:** Each notification ticket has a status (`PENDING`, `SUCCESS`, `FAILED`) to monitor the delivery lifecycle.
-   **Email Integration:** Utilizes **Nodemailer** to send emails through an SMTP provider (e.g., Gmail), with configurable sender credentials.

---

## Project Setup

Follow these steps to get the project running on your local machine.

### 1. Prerequisites

-   [Node.js](https://nodejs.org/) (v16 or higher)
-   A SQL-based database like [MySQL](https://www.mysql.com/).
-   [RabbitMQ](https://www.rabbitmq.com/download.html) message broker installed and running.

### 2. Installation

-   Clone the project repository:
    ```bash
    git clone git@github.com:prathamwho/ReminderService.git
    ```
-   Navigate to the project's root directory:
    ```bash
    cd <project-directory-name>
    ```
-   Install all the required npm packages:
    ```bash
    npm install
    ```

### 3. Environment Configuration

-   Create a `.env` file in the root directory. Add the following environment variables, replacing the placeholder values with your specific configuration.

    ```env
    PORT=3004
    EMAIL_ID=<YOUR_GMAIL_ADDRESS>
    EMAIL_PASS=<YOUR_GMAIL_APP_PASSWORD>
    EXCHANGE_NAME=AIRLINE_BOOKING
    REMINDER_BINDING_KEY=REMINDER_SERVICE
    MESSAGE_BROKER_URL='amqp://localhost'
    ```

-   **Important Note on Email Credentials (`EMAIL_PASS`)**:
    To use Gmail for sending emails, you cannot use your regular account password. You must generate an **App Password**.
    1.  Go to your Google Account settings.
    2.  Enable **2-Step Verification** under the "Security" tab.
    3.  In the same "Security" tab, find and click on **"App passwords"**.
    4.  Generate a new password for "Mail" on your "Windows Computer" (or other device).
    5.  Google will provide a 16-character password. Use this password for the `EMAIL_PASS` variable in your `.env` file.

-   Inside the `src/config` folder, create a file named `config.json`. Replace the placeholders with your actual database credentials.

    ```json
    {
      "development": {
        "username": "<YOUR_DB_USERNAME>",
        "password": "<YOUR_DB_PASSWORD>",
        "database": "REMINDER_DB_DEV",
        "host": "127.0.0.1",
        "dialect": "mysql"
      }
    }
    ```

### 4. Database Setup

-   From the project's root folder in your terminal, run the following Sequelize CLI commands to set up your database and tables.

-   Create the database:
    ```bash
    npx sequelize db:create
    ```
-   Run the database migrations to create the `NotificationTickets` table:
    ```bash
    npx sequelize db:migrate
    ```

### 5. Running the Server

-   Start the server using the npm script (this will use `nodemon` for automatic restarts during development):

    ```bash
    npm start
    ```
-   The server should now be running on the port specified in your `.env` file (e.g., `http://localhost:3004`). The RabbitMQ consumer will also start listening for messages.

---

## API Endpoints

While this service is primarily driven by messages from a queue, it exposes one RESTful API endpoint for direct interaction or testing.

| Method | Endpoint          | Description                                    | Request Body (JSON)                                                                                                                  |
| :----- | :---------------- | :--------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------- |
| `POST` | `/api/v1/tickets` | Creates a new notification ticket in the DB.   | `{ "subject": "Test", "content": "Test Content", "recepientEmail": "test@example.com", "notificationTime": "2025-12-01T10:00:00" }` |

---

## Service Workflow

The service follows an event-driven and scheduled workflow:

1.  **Message Consumption**: An external service (like the Booking Service) publishes a message with a specific `binding_key` to the RabbitMQ exchange.
2.  **Subscription**: The Reminder Service, subscribed to that `binding_key`, consumes the message from the queue.
3.  **Ticket Creation**: The `email-service` processes the message payload and creates a `NotificationTicket` entry in the MySQL database with a `status` of `PENDING` and a future `notificationTime`.
4.  **Scheduled Job**: A cron job, configured to run every two minutes, scans the `NotificationTickets` table.
5.  **Email Dispatch**: The job fetches all tickets where `status` is `PENDING` and the `notificationTime` is in the past. It then sends an email for each of these tickets using Nodemailer.
6.  **Status Update**: After attempting to send an email, the service updates the corresponding ticket's `status` to `SUCCESS` or `FAILED`.