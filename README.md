#Order Receiving Server

The Order Receiving Server is a Node.js application that facilitates the process of receiving and processing orders for a robotic system. It provides a simple API for ordering drinks, checking system readiness, and monitoring the current state of the system.

Prerequisites
Before running this server, you need to have the following dependencies installed:

Node.js: You can download and install Node.js from https://nodejs.org/.
Installation
Clone the repository to your local machine.
Navigate to the project directory in your terminal.
Install the required Node.js modules using npm:
bash
Copy code
npm install
Configuration
The server is pre-configured with some default settings, including allowed origins for CORS (Cross-Origin Resource Sharing) and a list of available drinks. You can modify these settings in the code if necessary.

javascript
Copy code
const corsOptions = {
  origin: [
    "https://prak-ss-23.vercel.app",
    "http://localhost:3000",
    "https://lehre.bpm.in.tum.de",
  ],
  credentials: true, // Access-Control-Allow-Credentials: true
  optionSuccessStatus: 200,
};
You can add or remove origins from the origin array to control which domains are allowed to access the server. Make sure to adjust these settings to match your project's requirements.

Usage
To start the server, run the following command:

bash
Copy code
npm start
The server will start on port 22950. You can change the port by modifying the port variable in the code.

API Endpoints
1. Retrieve Available Items

Endpoint: /getItems
Description: Retrieves a list of available drink items.
Method: GET
2. Place an Order

Endpoint: /sendOrder
Description: Places an order for a drink item.
Method: POST
3. Check System Readiness

Endpoint: /isReady
Description: Checks if the robotic system is ready to take the next order.
Method: GET
4. Get Current System State

Endpoint: /getState
Description: Retrieves the current state of the robotic system, including waiting callbacks and order status.
Method: GET
Server-Sent Events (SSE)
The server also supports Server-Sent Events (SSE) for real-time updates on the system's state. SSE is available at the /stream and /sse endpoints.

Customization
You can customize and extend this server as needed. For example, you can modify the list of available drinks, add additional endpoints, or integrate it with your robotic system.

Contributors
[Your Name]
License
This project is licensed under the [License Name].
