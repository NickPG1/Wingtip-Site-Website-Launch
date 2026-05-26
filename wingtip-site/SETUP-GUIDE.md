# Wingtip Website — Complete Setup Guide

This guide walks you through every step to get your new site live, from Stripe setup through DNS transfer.

---

## Architecture Overview

```
wingtip-site/
├── index.html                        ← Your entire website (single page)
├── success.html                      ← Post-purchase "thank you" page
├── images/                           ← Merch photos & logo (you add these)
│   ├── wingtip-logo.jpg
│   ├── merch-tee-black.jpg
│   ├── merch-hoodie-cream.jpg
│   └── merch-hat.jpg
├── netlify/
│   └── functions/
│       └── create-checkout.js        ← Serverless function (talks to Stripe)
├── netlify.toml                      ← Netlify config (redirects, headers)
└── package.json                      ← Dependencies (just the Stripe SDK)
```

**How it works:** The site is a single HTML page hosted for free on Netlify. When someone clicks "Buy Now," a tiny serverless function creates a Stripe Checkout session, and the customer is redirected to Stripe's secure hosted checkout page. You never touch credit card data.

---

## Step 1: Set Up Stripe

### 1a. Create a Stripe account
1. Go to [dashboard.stripe.com](https://dashboard.stripe.com) and sign up
2. Complete identity verification (Stripe will ask for business details — "Individual" / "Sole Proprietor" is fine for a music project)
3. You'll start in **test mode** (toggle in the top-right). Stay in test mode until everything works.

### 1b. Create your products
1. Go to **Products** in the Stripe dashboard
2. Click **+ Add product** for each merch item
3. Fill in:
   - **Name:** e.g. "Wingtip Logo Tee — Black"
   - **Description:** optional
   - **Image:** upload the product photo
   - **Price:** e.g. $30.00, one-time payment
4. After saving, click into the product → find the **Price ID** (starts with `price_...`)
5. Copy each Price ID — you'll paste these into `index.html`

### 1c. Get your API keys
1. Go to **Developers → API keys**
2. Copy your **Secret key** (starts with `sk_test_...` in test mode)
3. You'll add this to Netlify as an environment variable (never put it in your code)

### 1d. Configure shipping (optional but recommended)
- In the Stripe dashboard, go to **Settings → Payments → Shipping**
- You can set up shipping zones if you want more granular control
- The serverless function already includes $5 Standard and $15 Express options — edit `create-checkout.js` to adjust

### 1e. Enable customer emails
1. Go to **Settings → Emails**
2. Turn on **Successful payments** — this sends automatic order confirmation emails to customers

---

## Step 2: Update the Code with Your Info

### 2a. Add your Stripe Price IDs
Open `index.html` and find each `data-price-id="price_REPLACE_WITH_STRIPE_PRICE_ID"`. Replace with the actual price IDs from Step 1b.

Example:
```html
<!-- Before -->
<button class="btn buy-btn" data-price-id="price_REPLACE_WITH_STRIPE_PRICE_ID">Buy Now</button>

<!-- After -->
<button class="btn buy-btn" data-price-id="price_1PqR2sLkj4mN5oP6">Buy Now</button>
```

### 2b. Add your merch images
1. Create an `images/` folder in the project root
2. Add your product photos (recommended: square, at least 600x600px, JPG or WebP)
3. The file names in `index.html` are: `wingtip-logo.jpg`, `merch-tee-black.jpg`, `merch-hoodie-cream.jpg`, `merch-hat.jpg` — rename your files to match, or update the `src` attributes

### 2c. Add your streaming links
In `index.html`, find the `#music` section and replace the placeholder URLs:
- Spotify: `https://open.spotify.com/artist/YOUR_SPOTIFY_ID`
- Apple Music: `https://music.apple.com/artist/YOUR_APPLE_ID`
- SoundCloud and YouTube are already set to your existing URLs

### 2d. Add your Songkick artist ID
1. Go to [songkick.com](https://www.songkick.com) and find your artist page
2. The URL will look like: `songkick.com/artists/1234567-wingtip` — the number is your artist ID
3. In `index.html`, replace `YOUR_SONGKICK_ARTIST_ID` (appears 3 times in the tour section) with that number

### 2e. Add or remove merch items
To **add** an item: duplicate one of the `<!-- ITEM -->` blocks in the merch grid and update the image, title, price, and `data-price-id`.

To **remove** an item: delete the entire `<div class="merch-card">...</div>` block.

For items **without sizes** (like hats, stickers, vinyl): just remove the `<select>` element from that card.

---

## Step 3: Deploy to Netlify

### 3a. Push to GitHub (recommended)
1. Create a new GitHub repo (e.g. `wingtip-site`)
2. Push your project:
   ```bash
   cd wingtip-site
   git init
   git add .
   git commit -m "Initial site"
   git remote add origin https://github.com/YOUR_USERNAME/wingtip-site.git
   git push -u origin main
   ```

### 3b. Connect to Netlify
1. Go to [app.netlify.com](https://app.netlify.com) and sign up (free) with your GitHub account
2. Click **"Add new site" → "Import an existing project"**
3. Select your `wingtip-site` repo
4. Netlify will auto-detect the `netlify.toml` config — just click **Deploy**
5. Your site will be live at a temporary URL like `wingtip-site.netlify.app`

### 3c. Add environment variables
1. In Netlify, go to **Site settings → Environment variables**
2. Add these two:
   - `STRIPE_SECRET_KEY` = your Stripe secret key (`sk_test_...` for testing, `sk_live_...` for production)
   - `SITE_URL` = `https://www.wingtipmusic.com` (or your Netlify URL for testing)
3. Click **Save** and trigger a **redeploy** (Deploys → Trigger deploy)

### 3d. Test the checkout flow
1. Visit your Netlify URL
2. Click "Buy Now" on any item
3. You should be redirected to Stripe's checkout page
4. Use test card number `4242 4242 4242 4242` with any future expiry and any CVC
5. After completing, you should land on `success.html`
6. Check the Stripe dashboard — you should see the test payment

---

## Step 4: Point Your Domain (wingtipmusic.com)

Since your domain is registered through Wix, you have two options:

### Option A: Point DNS records from Wix to Netlify (easiest)
1. In Netlify: go to **Domain management → Add custom domain** → enter `www.wingtipmusic.com`
2. Netlify will show you the DNS records needed
3. In Wix: go to **My Domains → wingtipmusic.com → Manage DNS Records**
4. **Delete** the existing A records and CNAME records that point to Wix
5. Add a new **CNAME record**:
   - Host: `www`
   - Value: `YOUR-SITE-NAME.netlify.app` (Netlify shows you this)
6. For the apex domain (`wingtipmusic.com` without www), add an **A record**:
   - Host: `@`
   - Value: `75.2.60.5` (Netlify's load balancer IP)
7. Wait 1-48 hours for DNS propagation (usually under an hour)
8. In Netlify, verify the domain and enable HTTPS (automatic with Let's Encrypt)

### Option B: Transfer the domain away from Wix (more control)
1. In Wix, go to **My Domains → wingtipmusic.com → Transfer away from Wix**
2. Unlock the domain and get the authorization/EPP code
3. Transfer to a registrar like Namecheap, Cloudflare, or Google Domains
4. Once transferred, point nameservers to Netlify DNS
5. This gives you full DNS control but takes 5-7 days for the transfer

**I recommend Option A** — it's faster and avoids transfer downtime.

---

## Step 5: Go Live Checklist

- [ ] All merch images are added to the `images/` folder
- [ ] All `price_REPLACE_WITH_STRIPE_PRICE_ID` values are replaced with real Stripe Price IDs
- [ ] Streaming links (Spotify, Apple Music) are updated with your real URLs
- [ ] Songkick artist ID is set (or the section is removed if you don't have one yet)
- [ ] Test checkout works with Stripe test card `4242 4242 4242 4242`
- [ ] Switch Stripe to **live mode**: get your live secret key (`sk_live_...`) and update the Netlify environment variable
- [ ] Update `SITE_URL` environment variable to `https://www.wingtipmusic.com`
- [ ] DNS is pointed and HTTPS is active in Netlify
- [ ] Place a real test order with a real card to confirm end-to-end flow
- [ ] Cancel your Wix premium plan (but keep the domain if using Option A)
- [ ] Cancel your Shopify subscription

---

## Troubleshooting

### "Buy Now" button does nothing / shows "Something went wrong"
- **Check browser console** (right-click → Inspect → Console tab) for error messages
- Most likely: the `STRIPE_SECRET_KEY` environment variable is missing or wrong in Netlify
- Verify: go to Netlify → Functions → `create-checkout` → check the function logs for errors
- If you see `No such price: 'price_REPLACE_WITH_STRIPE_PRICE_ID'` → you forgot to replace the placeholder price IDs

### Stripe checkout opens but shows wrong price/product
- You're using the wrong Price ID. Go to Stripe Dashboard → Products → click the product → copy the correct Price ID
- Each product can have multiple prices (if you created test ones). Make sure you're using the right one.

### Songkick widget doesn't show any dates
- Confirm you're using the correct artist ID number in the widget URL
- If you have no upcoming dates on Songkick, the widget will be empty — this is normal
- Try visiting `https://widget.songkick.com/YOUR_ARTIST_ID/widget.js` directly. If it 404s, the ID is wrong.

### Site shows Wix "site not found" after DNS change
- DNS propagation takes up to 48 hours (usually much less)
- Check propagation status at [whatsmydns.net](https://www.whatsmydns.net)
- Make sure you deleted the old Wix DNS records — conflicting records cause problems
- In Netlify, check that the domain shows a green checkmark under Domain management

### HTTPS / SSL not working
- Netlify auto-provisions SSL via Let's Encrypt, but only after DNS is fully propagated
- Go to Netlify → Domain management → HTTPS → click "Verify DNS configuration" then "Provision certificate"
- If it fails, wait a few more hours and try again

### Merch images not loading
- File names are case-sensitive. `Merch-Tee.jpg` is different from `merch-tee.jpg`
- Make sure images are in the `images/` folder at the project root
- Recommended: use lowercase filenames with hyphens, no spaces

### Need to add/change merch items later
1. Add the new product in Stripe Dashboard
2. Copy the new Price ID
3. Edit `index.html` — add a new `merch-card` block (or modify an existing one)
4. Commit and push to GitHub — Netlify auto-deploys on every push

### Order fulfillment: how do I know when someone buys?
- Stripe sends you an email for every payment (Settings → Emails)
- You can also see all orders in the Stripe Dashboard → Payments
- The customer's **shipping address** and **size selection** are both captured in the payment metadata
- For more automation later, you can set up Stripe webhooks to notify you via email, Slack, etc.

---

## Monthly Costs Comparison

| Service | Before (Wix + Shopify) | After (Netlify + Stripe) |
|---------|----------------------|------------------------|
| Hosting | ~$17/mo (Wix) | $0 (Netlify free tier) |
| Store   | ~$39/mo (Shopify Basic) | $0 (no subscription) |
| Payments | ~2.9% + $0.30/txn | 2.9% + $0.30/txn (Stripe) |
| Domain  | Included in Wix | ~$12/year (if transferred) |
| **Total fixed** | **~$56/month** | **$0-1/month** |

You save roughly $55/month by switching, and only pay Stripe's per-transaction fee when you actually sell something.
