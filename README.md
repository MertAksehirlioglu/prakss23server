# Order Receiving Server

The Order Receiving Server is a Node.js application that facilitates the process of receiving and processing orders for a robotic system. It provides a simple API for ordering drinks, checking system readiness, and monitoring the current state of the system.

## Prerequisites

Before running this server, you need to have the following dependencies installed:

Node.js: You can download and install Node.js from https://nodejs.org/

## Installation

1. Clone the repository to your local machine.
2. Navigate to the project directory in your terminal.
3. Install the required Node.js modules using npm:

```bash
npm install
```


## Configuration
The server is pre-configured with some default settings, including allowed origins for CORS (Cross-Origin Resource Sharing) and a list of available drinks. You can modify these settings in the code if necessary.

``` javascript
const corsOptions = {
  origin: [
    "http://localhost:3000",
    "https://lehre.bpm.in.tum.de",
  ],
  credentials: true, // Access-Control-Allow-Credentials: true
  optionSuccessStatus: 200,
};
```
You can add or remove origins from the origin array to control which domains are allowed to access the server. Make sure to adjust these settings to match your projects requirements.

The server will start on port 22950. You can change the port by modifying the **port** variable in the code.
``` javascript
const port = 22950;
```

## Usage
To start the server, run the following command:

```bash
npm start
```


## API Endpoints

1. **Retrieve Available Items**
   - **Endpoint**: `/getItems`
   - **Description**: Retrieves a list of available drink items.
   - **Method**: GET

2. **Place an Order**
   - **Endpoint**: `/sendOrder`
   - **Description**: Places an order for a drink item.
   - **Method**: POST

3. **Check System Readiness**
   - **Endpoint**: `/isReady`
   - **Description**: Checks if the robotic system is ready to take the next order.
   - **Method**: GET

4. **Get Current System State**
   - **Endpoint**: `/getState`
   - **Description**: Retrieves the current state of the robotic system, including waiting callbacks and order status.
   - **Method**: GET


## Server-Sent Events (SSE)
The server also supports Server-Sent Events (SSE) for real-time updates on the system's state. SSE is available at the **/stream** and **/sse** endpoints.

Contributors
Mert Aksehirlioglu
License
This project is licensed under the MIT License.
