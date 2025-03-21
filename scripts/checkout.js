import { cart, removeFromCart } from "../data/cart.js";
import { deliveryOptions } from "../data/deliveryOptions.js";
import { products } from "../data/products.js";
import { formatCurrency } from "./utils/money.js";

let cartSummaryHTML = "";

const today = dayjs();
const deliveryDate = today.add(5, "days").format("dddd, MMMM D");

cart.forEach((cartItem) => {
  const productId = cartItem.productId;

  let matchingProduct = products.find((product) => product.id === productId);

const deliveryOptionId = String(cartItem.deliveryOptionId); // Ensure it's a string

// Find the matching delivery option
const deliveryOption = deliveryOptions.find(
  (option) => String(option.id) === deliveryOptionId
);

let dateString; // Declare variable outside the if-block

if (!deliveryOption) {
  console.error(`No delivery option found for ID: ${deliveryOptionId}`);
  dateString = "Unknown delivery date"; // Provide a fallback value
} else {
  const today = dayjs();
  const deliveryDate = today.add(deliveryOption.deliveryDays, "days");
  dateString = deliveryDate.format("dddd, MMMM D");
}

  cartSummaryHTML += `
        <div class="cart-item-container 
        js-cart-item-container-${matchingProduct.id} " >
            <div class="delivery-date">
              Delivery date: ${dateString}
            </div>

            <div class="cart-item-details-grid">
              <img class="product-image"
                src="${matchingProduct.image}">

              <div class="cart-item-details">
                <div class="product-name">
                  ${matchingProduct.name}
                </div>
                <div class="product-price">
                  $${formatCurrency(matchingProduct.priceCents)}
                </div>
                <div class="product-quantity">
                  <span>
                    Quantity: <span class="quantity-label">${
                      cartItem.quantity
                    }</span>
                  </span>
                  <span class="update-quantity-link link-primary">
                    Update
                  </span>
                  <span class="delete-quantity-link link-primary js-delete-link" data-product-id="${
                    matchingProduct.id
                  }">
                    Delete
                  </span>
                </div>
              </div>

              <div class="delivery-options ">
                <div class="delivery-options-title">
                  Choose a delivery option:
                </div>
                ${deliveryOptionsHTML(matchingProduct, cartItem)}
                </div>
              </div>
            </div>
          </div>
        `;
});

function deliveryOptionsHTML(matchingProduct, cartItem) {
  let html = "";

//   let deliveryOptionsHTML = "";
  deliveryOptions.forEach((deliveryOption) => {
    const today = dayjs();
    const deliveryDate = today.add(deliveryOption.deliveryDays, "days");
    const dateString = deliveryDate.format("dddd, MMMM D");
    const priceString =
      deliveryOption.priceCents === 0
        ? "FREE"
        : `$${formatCurrency(deliveryOption.priceCents)}-`;

    const isChecked = deliveryOption.id === cartItem.deliveryOptionId;

    html += `
                <div class="delivery-option">
                    <input type="radio"  
                        ${isChecked ? "checked" : ""}
                        class="delivery-option-input"
                        name="delivery-option-${matchingProduct.id}">

                    <div>
                        <div class="delivery-option-date">
                        ${dateString}
                        </div>
                        <div class="delivery-option-price">
                        ${priceString} Shipping
                        </div>
                    </div>  
                    </div>     
        `;
  });
  return html;
}

document.querySelector(".js-order-summary").innerHTML = cartSummaryHTML;

document.querySelectorAll(".js-delete-link").forEach((link) => {
  link.addEventListener("click", () => {
    const productId = link.dataset.productId;
    removeFromCart(productId);

    const container = document.querySelector(
      `.js-cart-item-container-${productId}`
    );
    container.remove();
  });
});
