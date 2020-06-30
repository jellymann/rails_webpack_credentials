// This file is automatically compiled by Webpack, along with any other files
// present in this directory. You're encouraged to place your actual application logic in
// a relevant structure within app/javascript and only use these pack files to reference
// that code so it'll be compiled.

require("@rails/ujs").start();
require("turbolinks").start();
require("channels");


// Uncomment to copy all static images under ../images to the output folder and reference
// them with the image_pack_tag helper in views (e.g <%= image_pack_tag 'rails.png' %>)
// or the `imagePath` JavaScript helper below.
//
// const images = require.context('../images', true)
// const imagePath = (name) => images(name, true)

const PUBLIC_KEY = $$RailsCredentials.some_public_key;
const OTHER_PUBLIC_KEY = $$RailsCredentials.some_api.public_key;

document.addEventListener('turbolinks:load', () => {
  let preTag = document.getElementById('put_key_here');
  if (preTag) preTag.textContent = `PUBLIC_KEY: ${PUBLIC_KEY}\nOTHER_PUBLIC_KEY: ${OTHER_PUBLIC_KEY}`;
});
