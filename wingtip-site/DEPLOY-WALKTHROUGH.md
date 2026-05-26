# Getting wingtipmusic.com Live — Step by Step

Everything below is in order. Don't skip ahead. Each step builds on the last.

---

## What's already done for you

The site files are complete and ready to deploy. Here's what's pre-filled with real data (sourced from the internet) and what still needs your input:

**Pre-filled (sourced online — verify these are correct):**
- Album artwork: Apple Music CDN image for Luckyman (2025)
- Stream button: `https://open.spotify.com/album/3JyimcIUNsNaULF9FoSGDO` (found via Spotify discography)
- Tour Dates button: `https://www.songkick.com/artists/8890544-wingtip` (found via Songkick search)
- Social links: Instagram, X, Facebook, SoundCloud (scraped from current wingtipmusic.com)
- OG image / meta tags: Uses the Luckyman album art for social sharing previews

**Still needs your input:**
- Stripe Price IDs for each merch product (in `merch.html`)
- Merch product images (in the `images/` folder)
- Stripe secret API key (goes into Netlify as an environment variable — never in code)

---

## Step 1: Get your Stripe Price IDs (5 min)

You said you've already added products to Stripe. Now you need the Price IDs.

1. Go to **https://dashboard.stripe.com/products**
2. Click into your **first product**
3. Scroll down to the **Pricing** section
4. Copy the **Price ID** — it starts with `price_` (e.g., `price_1PqR2sLkj4mN5oP6`)
5. Repeat for each product

Write them down. You'll need them in Step 3.

**Also grab your API key:**
1. Go to **https://dashboard.stripe.com/apikeys**
2. Under **Secret key**, click **Reveal test key** and copy it (starts with `sk_test_...`)
3. Save it somewhere safe — you'll paste it into Netlify in Step 5

**Turn on customer emails:**
1. Go to **https://dashboard.stripe.com/settings/emails**
2. Toggle on **Successful payments** — customers get automatic order confirmations

---

## Step 2: Add your merch images (5 min)

Create an `images/` folder inside the `wingtip-site/` project folder:

```
wingtip-site/
├── images/          ← create this
│   ├── merch-tee-black.jpg
│   ├── merch-hoodie-cream.jpg
│   └── merch-hat.jpg
├── index.html
├── merch.html
└── ...
```

Drop your product photos in. They should be:
- Square (or close to it) — the cards crop to 1:1
- At least 600×600px
- JPG or WebP

The filenames in `merch.html` are `merch-tee-black.jpg`, `merch-hoodie-cream.jpg`, `merch-hat.jpg`. Either rename your files to match, or edit the `src="images/..."` paths in `merch.html`.

If you don't have product photos yet, the cards will still work — they just show a dark placeholder.

---

## Step 3: Plug in your Stripe Price IDs (2 min)

Open `merch.html` in any text editor. Find the three `data-price-id` attributes:

```html
<button class="buy-btn" data-price-id="price_REPLACE_WITH_STRIPE_PRICE_ID">Buy Now</button>
```

Replace each `price_REPLACE_WITH_STRIPE_PRICE_ID` with the real Price ID from Step 1.

Also update the product names, prices, and size options if they don't match your actual products. To add or remove items, just duplicate or delete a `<div class="merch-card">...</div>` block.

---

## Step 4: Push to GitHub (5 min)

If you don't have a GitHub account, create one at **https://github.com/signup** (free).

Then in your terminal:

```bash
cd /path/to/wingtip-site

git init
git add .
git commit -m "Wingtip site - Luckyman launch"

# Create a new repo on GitHub (https://github.com/new) called "wingtip-site"
# Then connect and push:
git remote add origin https://github.com/YOUR_USERNAME/wingtip-site.git
git branch -M main
git push -u origin main
```

If you use GitHub Desktop instead of the terminal, that's fine — just create a new repo, add the `wingtip-site` folder, commit, and push.

---

## Step 5: Deploy on Netlify (5 min)

1. Go to **https://app.netlify.com** and sign up with your GitHub account (free)
2. Click **"Add new site"** → **"Import an existing project"**
3. Select **GitHub** as the provider
4. Find and select your `wingtip-site` repo
5. Netlify auto-detects the config from `netlify.toml` — you don't need to change any build settings
6. Click **"Deploy site"**
7. Wait ~60 seconds. Your site is now live at something like `wingtip-site-abc123.netlify.app`

**Now add your Stripe key as an environment variable:**
1. In Netlify, go to **Site configuration** → **Environment variables**
2. Click **"Add a variable"**
3. Add these two:

   | Key | Value |
   |-----|-------|
   | `STRIPE_SECRET_KEY` | `sk_test_...` (paste your test key from Step 1) |
   | `SITE_URL` | `https://wingtip-site-abc123.netlify.app` (your Netlify URL for now) |

4. Click **Save**
5. Go to **Deploys** → click **"Trigger deploy"** → **"Deploy site"** (this redeploys with the new env vars)

---

## Step 6: Test everything (5 min)

Visit your Netlify URL. Walk through each flow:

**Homepage:**
- [ ] Album art loads (the Luckyman cover)
- [ ] "Stream" opens Spotify in a new tab
- [ ] "Tour Dates" opens Songkick in a new tab
- [ ] "Merch" navigates to the merch page
- [ ] Social icons link correctly
- [ ] Looks good on mobile (resize your browser or use phone)

**Merch page:**
- [ ] Product images load (or show dark placeholders)
- [ ] Click "Buy Now" without selecting a size → the dropdown highlights red
- [ ] Select a size, click "Buy Now" → you're redirected to Stripe Checkout
- [ ] On the Stripe checkout page, use test card: `4242 4242 4242 4242`, any future expiry, any CVC
- [ ] After paying, you land on the "Order Confirmed" page
- [ ] Click "Back to Wingtip" → returns to homepage
- [ ] Check Stripe Dashboard → **Payments** → you should see the test payment with the size in metadata

**If "Buy Now" shows "Something went wrong":**
- Open browser console (right-click → Inspect → Console) — look for the error
- Most common: the `STRIPE_SECRET_KEY` env variable is missing or you haven't redeployed
- Check Netlify → **Functions** → `create-checkout` → view the function log for details

---

## Step 7: Point your domain (10 min, then wait)

This is the part where wingtipmusic.com starts showing your new site instead of Wix.

### 7a. Add the domain in Netlify
1. In Netlify: **Domain management** → **Add a custom domain**
2. Enter `www.wingtipmusic.com` and click **Verify** → **Add domain**
3. Netlify will show your site's Netlify subdomain (e.g., `wingtip-site-abc123.netlify.app`)
4. Also add `wingtipmusic.com` (without www) as an alias

### 7b. Update DNS in Wix
1. Log into Wix → **My Domains** → click **wingtipmusic.com** → **Manage DNS Records**
2. **Delete** any existing A records and CNAME records pointing to Wix servers
3. Add a **CNAME record:**
   - **Host name:** `www`
   - **Value:** `wingtip-site-abc123.netlify.app` (your Netlify subdomain — Netlify shows you this)
4. Add an **A record** for the root domain:
   - **Host name:** `@`
   - **Value:** `75.2.60.5` (Netlify's load balancer)
5. Save

### 7c. Wait for propagation
- Usually takes 15-60 minutes, can take up to 48 hours
- Check progress at **https://www.whatsmydns.net** — search for `wingtipmusic.com`
- Once you see the Netlify IP showing up globally, you're good

### 7d. Enable HTTPS
1. Back in Netlify → **Domain management** → **HTTPS**
2. Click **Verify DNS configuration**
3. If DNS has propagated, click **Provision certificate** — Netlify uses Let's Encrypt (free, automatic)
4. If it says DNS isn't ready yet, wait and try again later

---

## Step 8: Go live with Stripe (2 min)

Once everything works in test mode:

1. Go to **https://dashboard.stripe.com** → toggle from **Test mode** to **Live mode** (top-right switch)
2. Go to **Developers → API keys** → copy your **live** secret key (starts with `sk_live_...`)
3. In Netlify → **Site configuration** → **Environment variables**:
   - Update `STRIPE_SECRET_KEY` to your live key
   - Update `SITE_URL` to `https://www.wingtipmusic.com`
4. **Trigger a redeploy** in Netlify

**Important:** Your Stripe products and prices exist separately in test mode and live mode. You'll need to re-create your products in live mode (or they might already be there if you created them while in live mode). Make sure the Price IDs in `merch.html` match the live-mode Price IDs.

---

## Step 9: Place a real test order (2 min)

Use a real card and buy something from your own store. This confirms:
- Payment goes through
- You get the Stripe notification email
- Customer gets the confirmation email
- Shipping address and size are captured in the payment metadata

You can refund yourself immediately in the Stripe Dashboard → Payments → click the payment → Refund.

---

## Step 10: Cancel old services

Once you're confident everything works:

- [ ] Cancel your Wix premium plan (keep the domain registration if using the DNS pointing method from Step 7)
- [ ] Cancel your Shopify subscription
- [ ] Update any external links pointing to your old Shopify store

---

## What sourced from online vs. what I guessed

| Item | Source | Confidence |
|------|--------|-----------|
| Album artwork | Apple Music CDN (`is1-ssl.mzstatic.com/...`) | Verified — exact match |
| Spotify album link | Found via Spotify discography page for Wingtip | Verified — `3JyimcIUNsNaULF9FoSGDO` |
| Apple Music album ID | `music.apple.com/us/album/luckyman/1817284615` | Verified |
| Songkick artist ID | `songkick.com/artists/8890544-wingtip` | Verified — correct artist |
| Instagram | `instagram.com/wingtipmusic` | Verified — from current site |
| X / Twitter | `twitter.com/itswingtip` | Verified — from current site |
| Facebook | `facebook.com/wingtipmusicpage` | Verified — from current site |
| SoundCloud | `soundcloud.com/wingtipmusic` | Verified — from current site |
| OG image meta tag | Uses the Apple Music CDN album art URL | Sourced — should work for link previews |
| Netlify IP (75.2.60.5) | Standard Netlify load balancer IP | Standard — confirm in Netlify docs when deploying |
| Merch product names/prices | Placeholder — "Logo Tee $30", "Hoodie $55", "Dad Hat $25" | **Guessed** — update to match your actual Stripe products |
| Merch images | Not included — placeholders with dark fallback | **You need to add these** |
| Shipping rates ($5 / $15) | Default in `create-checkout.js` | **Guessed** — update to your actual rates |

---

## Quick reference: making changes later

After the site is live, any change is: edit file → commit → push to GitHub → Netlify auto-deploys in ~30 seconds.

**Add a new merch item:** Add product in Stripe → copy Price ID → duplicate a `merch-card` block in `merch.html` → push.

**Change the featured album:** Update the image `src`, title, meta tags in `index.html` → push.

**Update shipping rates:** Edit the `shipping_options` in `netlify/functions/create-checkout.js` → push.
