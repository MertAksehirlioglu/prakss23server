const express = require("express");
const axios = require("axios");
var SSE = require("express-sse");
const cors = require("cors");
var bodyParser = require("body-parser");

const Queue = require("./Queue");
const { delay, getImageForDrink } = require('./utils');


const app = express();
const port = 22950;
var sse = new SSE();

const corsOptions = {
  origin: ["https://prak-ss-23.vercel.app", "http://localhost:3000"],
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(
  bodyParser.urlencoded({
    // to support URL-encoded bodies
    extended: true,
  })
);

app.use(express.json()); // to support JSON-encoded bodies
app.use(express.urlencoded()); // to support URL-encoded bodies

const drinksList = [
  {
    name: "Aperol Spritz",
    image_link:
      "https://www.liquor.com/thmb/nc2Cbt6P1gNFGrXDcV_yFnX7Glw=/750x0/filters:no_upscale():max_bytes(150000):strip_icc()/aperol-spritz-720x720-primary-985457b239d7427da2f8b4be17131caa.jpg",
  },
  {
    name: "Whiskey Sour",
    image_link:
      "https://www.liquor.com/thmb/dD_dAMDwbX1UdC9A_BerOcevcyw=/750x0/filters:no_upscale():max_bytes(150000):strip_icc()/whiskey-sour-720x720-primary-v2-4fc831b613964da5a19cdbfda917d7df.jpg",
  },
  {
    name: "Margarita",
    image_link:
      "https://makemeacocktail.com/cdn-cgi/image/f=auto,h=400,sharpen=1,fit=contain/images/cocktails/6868/400_601_margarita_2_2.jpg",
  },
  {
    name: "Gin Fizz",
    image_link:
      "https://www.liquor.com/thmb/M-GNu7ThtQYthNG5_7Rnu6VmfeQ=/750x0/filters:no_upscale():max_bytes(150000):strip_icc()/gin-fizz-720x720-primary-v3-2c1390963d014e35a01d741df2f9ae77.jpg",
  },
];

const drinksFolder =
  "https://cpee.org/hub/?stage=development&dir=TUM-Prak-23-SS.dir/";

const state = {
  waitingCallbacks: 0,
  instances: [],
  availableItems: [],
  orders: {
    processingOrders: [],
    readyOrders: [],
  },
};

let callbackAddresses = new Queue();

function saveInstance(instanceId, status, customerName, itemName) {
  let instance = state.instances.find((x) => x.instanceId === instanceId);
  if (instance) {
    if (instance.status === "Available" && status === "Busy") {
      state.orders.processingOrders.push({
        itemName: itemName,
        customerName: customerName,
        instanceId: instanceId,
      });
    } else if (instance.status === "Busy" && status === "Available") {
      const processedOrderIndex = state.orders.processingOrders.findIndex(
        (x) => x.instanceId === instanceId
      );
      const processedOrder =
        state.orders.processingOrders.at(processedOrderIndex);
      state.orders.processingOrders.splice(processedOrderIndex, 1);
      if (state.orders.readyOrders.length > 4) {
        state.orders.readyOrders.shift();
      }
      state.orders.readyOrders.push(processedOrder);
    } else {
      console.error("UNEXPECTED");
    }
    instance.status = status;
    // update
  } else {
    state.instances.push({ instanceId: instanceId, status: status });
  }
}

async function updateState(req, updateType) {
  let callbackAddress;
  switch (updateType) {
    case "GETORDER":
      callbackAddress = req.headers["cpee-callback"];
      callbackAddresses.enqueue({
        address: callbackAddress,
        instanceId: req.headers["cpee-instance"],
      });
      saveInstance(req.headers["cpee-instance"], "Available");
      console.log(req.query.drinks);
      await saveDrinks(req.query.drinks);
      break;
    case "SENDORDER":
      const currentcallbackObject = callbackAddresses.dequeue();
      callbackAddress = currentcallbackObject.address;
      const instanceId = currentcallbackObject.instanceId;
      const itemName = req.body.itemName._value || "NO_NAME_ITEM";
      const customerName = req.body.customerName._value || "NO_NAME_CUSTOMER";
      sendOrder(
        { itemName: itemName, customerName: customerName },
        callbackAddress
      );
      saveInstance(instanceId, "Busy", customerName, itemName);
      break;
    default:
      console.error("Missing update type" + updateType);
  }
  state.waitingCallbacks = callbackAddresses.length;
  sse.send(state);
}

/**

Sends an order to a specified callback address asynchronously.
@param {Object} order - The order object to be sent.
@returns {Promise<void>} A promise that resolves when the order is successfully sent.
*/
async function sendOrder(order, callbackAddress) {
  console.log("Send Order called");
  axios.put(callbackAddress, order);
  console.log("put request sent to callbackAddress");
}

/**
Retrieves items from a specified folder asynchronously and returns an array of items.
@returns {Promise<Array>} A promise that resolves with an array of items.
*/
function getItems() {
  //TODO
  return state.availableItems.isEmpty ? drinksList : state.availableItems;
}

async function saveDrinks(drinksString) {
  // Remove the brackets from the string
const stringWithoutBrackets = drinksString.slice(1, -1);

// Split the string into an array using the comma as a separator
const drinkArray = stringWithoutBrackets.split(',');

const drinksWithImageLinks = await Promise.all(drinkArray.map(async (drink) => {
  const imageLink = await getImageForDrink(drink);
  return { name: drink, image_link: imageLink };
}));

console.log("Already set")
  state.availableItems = drinksWithImageLinks
}

app.get("/stream", sse.init);

/**
Express route handler for GET request to retrieve items.
*/
app.get("/getItems", async (req, res) => {
  console.log("getItems called");
  return res.send(await getItems());
});

/**
Express route handler for GET request to initiate order retrieval.
*/
app.get("/getOrder", async (req, res) => {
  console.log("getOrder call recieved");

  updateState(req, "GETORDER");

  res.set("CPEE-CALLBACK", true);
  console.log(callbackAddresses);
  return res.send("I will notify you when order is taken");
});

/**
Express route handler for GET request to check if the system is ready for order.
@returns {boolean} If the robot is ready for taking next order
*/
app.get("/isReady", (req, res) => {
  console.log(`Recieved isReady Check`);
  return res.status(200).send(!callbackAddresses.isEmpty);
});

app.post("/sendOrder", async (req, res) => {
  const itemName = req.body.itemName._value || "NO_NAME_ITEM";
  const customerName = req.body.customerName._value || "NO_NAME_CUSTOMER";
  console.log(`Send Order recieved: ${itemName} for ${customerName}`);
  if (!callbackAddresses.isEmpty) {
    updateState(req, "SENDORDER");
    console.log("Order is sent to CPEE");
    return res.status(200).send("Order is sent to CPEE");
  } else {
    console.log("Order can't be processed, CPEE is not expecting");
    return res
      .status(404)
      .send("Order can't be processed, CPEE is not expecting");
  }
});

app.get("/getState", (req, res) => {
  setTimeout(() => sse.send(state), 1000);
  return res.send(state);
});

app.listen(port, () => {
  console.log(`Order Recieving Server listening on port ${port}`);
});
