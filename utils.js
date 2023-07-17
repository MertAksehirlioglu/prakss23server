const cheerio = require("cheerio");
const axios = require("axios");

const delay = (ms) => new Promise((res) => setTimeout(res, ms))

async function getImageForDrink(drinkName) {
    let result = "https://www.liquor.com/thmb/M-GNu7ThtQYthNG5_7Rnu6VmfeQ=/750x0/filters:no_upscale():max_bytes(150000):strip_icc()/gin-fizz-720x720-primary-v3-2c1390963d014e35a01d741df2f9ae77.jpg"
    const searchUrl = `https://images.search.yahoo.com/search/images;?p=${drinkName}`
    // Step 2: Send an HTTP GET request to fetch the search results HTML
    await axios.get(searchUrl).then(response => {
    const html = response.data;
    // Step 3: Parse the HTML response and extract the image URLs
    const imageUrl = extractImageUrl(html);
    // Step 4: Handle the image URLs as needed (e.g., display them on a webpage)
    result = imageUrl

  })
  .catch(error => {
    console.error("Request failed with error", error);
  });
    return result
  }
  // Step 3: Parse the HTML response and extract the image URLs
  function extractImageUrl(html) {
    const $ = cheerio.load(html);
  
    // Find the element with the specified ID
    const element = $('#resitem-0');
    console.log(element.children().first().children().first())
    const image_link = element.children().first().children().first().attr('data-src');

    return image_link
  }

  module.exports = {
    delay,
    getImageForDrink
  }