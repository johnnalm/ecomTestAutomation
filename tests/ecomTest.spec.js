const { test, expect } = require('@playwright/test');

const USERNAME_STANDARD = 'standard_user';
const PASSWORD = 'secret_sauce';
const BASE_URL = 'https://www.saucedemo.com/';

async function login(page, username, password) {
    await page.fill('[data-test="username"]', username);
    await page.fill('[data-test="password"]', password);
    await page.click('[data-test="login-button"]');
}

async function addProductsToCart(page) {
    await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
    await page.click('[data-test="add-to-cart-sauce-labs-bike-light"]');
    await page.click('[data-test="add-to-cart-sauce-labs-bolt-t-shirt"]');
    await page.click('[data-test="add-to-cart-sauce-labs-fleece-jacket"]');
    await page.click('[data-test="add-to-cart-sauce-labs-onesie"]');
    await page.click('[data-test="add-to-cart-test.allthethings()-t-shirt-(red)"]');
}

test.beforeEach(async ({ page, context }) => {
    await context.clearCookies();
    await context.clearPermissions();
    await page.goto(BASE_URL);
});

test('should login successfully', async ({ page }) => {
    await login(page, USERNAME_STANDARD, PASSWORD);
    await expect(page).toHaveURL(BASE_URL + 'inventory.html');
});

test('should not login a locked out user', async ({ page }) => {
    await login(page, 'locked_out_user', PASSWORD);
    const errorMessage = await page.innerText('[data-test="error"]');
    await expect(errorMessage).toBe('Epic sadface: Sorry, this user has been locked out.');
    await expect(page).toHaveURL(BASE_URL);
});

test('should complete a purchase successfully', async ({ page }) => {
    await login(page, USERNAME_STANDARD, PASSWORD);

    // Add products to cart
    await addProductsToCart(page);

    // Navigate to cart
    await page.click('[id="shopping_cart_container"]');

    // Begin checkout process
    await page.click('[data-test="checkout"]');

    // Fill in checkout details
    await page.fill('[data-test="firstName"]', 'Johnny');
    await page.fill('[data-test="lastName"]', 'Martinez');
    await page.fill('[data-test="postalCode"]', '12345');

    // Continue checkout
    await page.click('[data-test="continue"]');

    // Finish checkout
    await page.click('[data-test="finish"]');

    // Validate successful purchase
    await expect(page).toHaveURL(BASE_URL + 'checkout-complete.html');

    const orderConfirmation = await page.innerText('[class="complete-header"]');
    await expect(orderConfirmation).toBe('Thank you for your order!');

    const orderConfirmationText = await page.innerText('[class="complete-text"]');
    await expect(orderConfirmationText).toBe('Your order has been dispatched, and will arrive just as fast as the pony can get there!');
});