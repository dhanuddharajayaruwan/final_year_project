import md5 from "crypto-js/md5";

/**
 * The PayHere Merchant ID, retrieved from environment variables.
 * This is a public identifier for your merchant account.
 */
const merchantId = process.env.PAYHERE_MERCHANT_ID;

/**
 * The PayHere Merchant Secret, retrieved from environment variables.
 * This is a private key used for generating and verifying security hashes.
 * It should never be exposed on the client-side.
 */
const merchantSecret = process.env.PAYHERE_SECRET;

// A startup check to ensure that essential environment variables are configured.
if (!merchantId || !merchantSecret) {
  console.error(
    "PayHere merchant ID or secret is not defined in environment variables."
  );
}

/**
 * Generates the security hash required for a PayHere payment request.
 * The hash is created by concatenating several pieces of data with the merchant secret
 * and then applying an MD5 hash.
 *
 * @param {string} orderId  - The unique ID for the order in your system.
 * @param {string} amount   - The payment amount as a string.
 * @returns {string} The uppercase MD5 hash string.
 */
const generateHash = (orderId, amount) => {
  // Hash the merchant secret first, as per PayHere documentation.
  const hashedSecret = md5(merchantSecret).toString().toUpperCase();
  // Format the amount to two decimal places without commas.
  const amountFormatted = parseFloat(amount)
    .toLocaleString("en-us", { minimumFractionDigits: 2 })
    .replace(/,/g, "");
  const currency = "LKR";
  // Concatenate the required fields in the correct order.
  const hashString = `${merchantId}${orderId}${amountFormatted}${currency.toUpperCase()}${hashedSecret}`;
  // Return the final MD5 hash of the concatenated string.
  return md5(hashString).toString().toUpperCase();
};

/**
 * Verifies the integrity of a notification received from PayHere's server.
 * Recalculates the hash using the received data and compares it to the md5sig from PayHere.
 *
 * @param {{ merchantId: string, orderId: string, payhereAmount: string, payhereCurrency: string, statusCode: string, md5sig: string }} params
 * @returns {boolean} true if the calculated hash matches md5sig, otherwise false.
 */
export const verifyNotificationHash = (params) => {
  const {
    merchantId: receivedMerchantId,
    orderId,
    payhereAmount,
    payhereCurrency,
    statusCode,
    md5sig,
  } = params;

  // Hash the merchant secret.
  const hashedSecret = md5(merchantSecret).toString().toUpperCase();
  // Concatenate the notification fields in the exact order specified by PayHere documentation.
  const stringToHash = `${receivedMerchantId}${orderId}${payhereAmount}${payhereCurrency}${statusCode}${hashedSecret}`;
  // Calculate the MD5 hash of the concatenated string.
  const calculatedHash = md5(stringToHash).toString().toUpperCase();
  // Compare the calculated hash with the signature received from PayHere.
  return md5sig === calculatedHash;
};

/**
 * Formats a number to a string with exactly two decimal places.
 *
 * @param {number} amount
 * @returns {string} e.g. "123.45"
 */
const formatAmount = (amount) => amount.toFixed(2);

/**
 * Creates the complete payment request object to be sent to the PayHere gateway.
 *
 * @param {{ orderId: string, amount: number, currency: string, description: string,
 *           customerInfo: { firstName: string, lastName: string, email: string,
 *                           phone: string, address: string, city: string, country?: string },
 *           returnUrl: string, cancelUrl: string, notifyUrl: string }} paymentData
 * @returns {object} The full payment request object ready to send to PayHere.
 */
export const createPaymentRequest = (paymentData) => {
  const {
    orderId,
    amount,
    currency,
    description,
    customerInfo,
    returnUrl,
    cancelUrl,
    notifyUrl,
  } = paymentData;

  // Format the amount and generate the security hash.
  const formattedAmount = formatAmount(amount);
  const hash = generateHash(orderId, formattedAmount);

  // Assemble the final request object with all required fields.
  // Keys must match the names expected by the PayHere API.
  return {
    merchant_id : merchantId,
    return_url  : returnUrl,
    cancel_url  : cancelUrl,
    notify_url  : notifyUrl,
    order_id    : orderId,
    items       : description,
    amount      : formattedAmount,
    currency    : currency.toUpperCase(),
    hash        : hash,
    first_name  : customerInfo.firstName,
    last_name   : customerInfo.lastName,
    email       : customerInfo.email,
    phone       : customerInfo.phone,
    address     : customerInfo.address,
    city        : customerInfo.city,
    country     : customerInfo.country || "Sri Lanka",
  };
};

/**
 * Converts a structured address object into a single-line comma-separated string.
 *
 * @param {{ street?: string, city?: string, state?: string }} address
 * @returns {string} e.g. "123 Main St, Colombo"
 */
export const singleLineAddress = (address) => {
  const parts = [address.street, address.city, address.state];
  return parts.filter(Boolean).join(", ");
};
