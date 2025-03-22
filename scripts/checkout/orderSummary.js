import { cart, removeFromCart, updateDeliveryOption } from "../../data/cart.js";
import { deliveryOptions } from "../../data/deliveryOptions.js";
import { products, getProduct } from "../../data/products.js";
import { formatCurrency } from "../utils/money.js"; // or "./utils/money.js"
import { renderPaymentSummary } from "./paymentSummary.js";

const today = dayjs(); // Declare once to avoid redundant calls

export function renderOrderSummary() {
  // Function to generate delivery options HTML
  function deliveryOptionsHTML(matchingProduct, cartItem) {
    return deliveryOptions
      .map((deliveryOption) => {
        const deliveryDate = today
          .add(deliveryOption.deliveryDays, "days")
          .format("dddd, MMMM D");
        const priceString =
          deliveryOption.priceCents === 0
            ? "FREE"
            : `$${formatCurrency(deliveryOption.priceCents)}-`;

        return `
              <div class="delivery-option js-delivery-option"
                data-product-id="${matchingProduct.id}"
                data-delivery-option-id="${deliveryOption.id}">
                <input type="radio"  
                  ${
                    parseInt(deliveryOption.id) ===
                    parseInt(cartItem.deliveryOptionId)
                      ? "checked"
                      : ""
                  }
                  class="delivery-option-input"
                  name="delivery-option-${matchingProduct.id}">
                <div>
                  <div class="delivery-option-date">${deliveryDate}</div>
                  <div class="delivery-option-price">${priceString} Shipping</div>
                </div>  
              </div>`;
      })
      .join(""); // Joins mapped elements into a single string
  }

  // Function to generate cart summary HTML
  function generateCartSummary() {
    return cart
      .map((cartItem) => {
        const matchingProduct = products.find(
          (product) => product.id === cartItem.productId
        );

        if (!matchingProduct) {
          console.error(`Product not found for ID: ${cartItem.productId}`);
          return "";
        }

        const deliveryOption = deliveryOptions.find(
          (option) => String(option.id) === String(cartItem.deliveryOptionId)
        );
        const deliveryDate = deliveryOption
          ? today
              .add(deliveryOption.deliveryDays, "days")
              .format("dddd, MMMM D")
          : "Unknown delivery date";

        return `
              <div class="cart-item-container js-cart-item-container-${
                matchingProduct.id
              }">
                <div class="delivery-date">Delivery date: ${deliveryDate}</div>

                <div class="cart-item-details-grid">
                  <img class="product-image" src="${matchingProduct.image}">

                  <div class="cart-item-details">
                    <div class="product-name">${matchingProduct.name}</div>
                    <div class="product-price">$${formatCurrency(
                      matchingProduct.priceCents
                    )}</div>
                    <div class="product-quantity">
                      <span>Quantity: <span class="quantity-label">${
                        cartItem.quantity
                      }</span></span>
                      <span class="update-quantity-link link-primary">Update</span>
                      <span class="delete-quantity-link link-primary js-delete-link" data-product-id="${
                        matchingProduct.id
                      }">Delete</span>
                    </div>
                  </div>

                  <div class="delivery-options">
                    <div class="delivery-options-title">Choose a delivery option:</div>
                    ${deliveryOptionsHTML(matchingProduct, cartItem)}
                  </div>
                </div>
              </div>`;
      })
      .join(""); // Joins mapped elements into a single string
  }

  // Render cart summary
  document.querySelector(".js-order-summary").innerHTML = generateCartSummary();

  // Event Delegation for Delete Buttons
  document
    .querySelector(".js-order-summary")
    .addEventListener("click", (event) => {
      if (event.target.classList.contains("js-delete-link")) {
        const productId = event.target.dataset.productId;
        removeFromCart(productId);
        document.querySelector(`.js-cart-item-container-${productId}`).remove();
        renderPaymentSummary();
      }
    });

  // Event Delegation for Delivery Options
  document
    .querySelector(".js-order-summary")
    .addEventListener("click", (event) => {
      const deliveryOptionElement = event.target.closest(".js-delivery-option");
      if (deliveryOptionElement) {
        const { productId, deliveryOptionId } = deliveryOptionElement.dataset;
        updateDeliveryOption(productId, deliveryOptionId);

        renderOrderSummary();
        renderPaymentSummary();
      }
    });
}



