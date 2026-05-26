/**
 * Netlify Serverless Function: create-checkout
 *
 * Creates a Stripe Checkout session and returns the URL.
 * The browser redirects the customer to Stripe's hosted checkout page,
 * so you never handle card numbers yourself.
 *
 * Environment variables required (set in Netlify dashboard):
 *   STRIPE_SECRET_KEY  — starts with sk_live_ (or sk_test_ for testing)
 *   SITE_URL           — e.g. https://www.wingtipmusic.com
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { priceId, size, quantity = 1 } = JSON.parse(event.body);

    if (!priceId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing priceId' }),
      };
    }

    const siteUrl = process.env.SITE_URL || 'https://www.wingtipmusic.com';

    // Build the checkout session
    const sessionConfig = {
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: quantity,
        },
      ],
      // Collect shipping address for physical merch
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'JP', 'NL'],
      },
      // You can add flat-rate shipping options here
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: 500, currency: 'usd' },
            display_name: 'Standard Shipping',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 5 },
              maximum: { unit: 'business_day', value: 10 },
            },
          },
        },
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: 1500, currency: 'usd' },
            display_name: 'Express Shipping',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 2 },
              maximum: { unit: 'business_day', value: 4 },
            },
          },
        },
      ],
      success_url: `${siteUrl}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/#merch`,
    };

    // Pass size as metadata so you know what to ship
    if (size) {
      sessionConfig.metadata = { size };
      // Also add it to the line item description so it shows in Stripe dashboard
      sessionConfig.line_items[0].adjustable_quantity = { enabled: false };
    }

    // If size was provided, add it as metadata on the payment intent too
    if (size) {
      sessionConfig.payment_intent_data = {
        metadata: { size },
      };
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: session.url }),
    };
  } catch (err) {
    console.error('Stripe checkout error:', err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
