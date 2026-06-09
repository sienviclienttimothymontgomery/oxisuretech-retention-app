# Custom Domain Setup Guide

This guide walks you through connecting a custom domain (e.g., `oxisuretech-retention.com` or `www.oxisuretech-retention.com`) to the **OxiSure Retention App** hosted on Firebase Hosting, and updating the Supabase Auth redirect configurations.

---

## Step 1: Purchase a Custom Domain
If you haven't already purchased a domain, you will need to buy one from a domain registrar. Some popular options include:
*   [Namecheap](https://www.namecheap.com/)
*   [Hostinger](https://www.hostinger.com/)
*   [GoDaddy](https://www.godaddy.com/)
*   [Cloudflare Registrar](https://www.cloudflare.com/products/registrar/)
*   [Squarespace Domains](https://domains.squarespace/) (formerly Google Domains)

---

## Step 2: Add the Custom Domain to Firebase Hosting
Firebase Hosting manages your SSL certificates and web traffic routing.

1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Select your project: **`oxisuretech-retention-app`**.
3. In the left-hand navigation sidebar, click on **Build** -> **Hosting** (or search for "Hosting").
4. Under the **Domains** section, click the **Add custom domain** button.
5. Enter your domain (e.g., `oxisuretech-retention.com`).
    *   *Tip:* It is recommended to configure both the root domain (e.g., `yourdomain.com`) and the `www` subdomain (e.g., `www.yourdomain.com`). Firebase will ask if you want to set up a redirect from one to the other.
6. Firebase will now generate domain verification records (usually a **TXT** record).

---

## Step 3: Verify Domain Ownership
Before pointing traffic to Firebase, Firebase must verify that you own the domain.

1. Log in to your domain registrar's administration dashboard.
2. Find the **DNS Settings**, **DNS Zone Editor**, or **Manage DNS** for your purchased domain.
3. Add a new **TXT** record with the following values:
    *   **Type**: `TXT`
    *   **Host / Name / Alias**: `@` (or leave it blank, depending on your registrar)
    *   **Value / Content**: Paste the verification string provided by Firebase (e.g., `google-site-verification=...`).
    *   **TTL**: Leave as default (e.g., `3600` or `1 hour`).
4. Save the DNS record.
5. Go back to the Firebase Console and click **Verify**.
    *   *Note:* DNS changes can take anywhere from a few minutes to 24 hours to propagate worldwide, though verification is usually quick (under 10 minutes).

---

## Step 4: Point DNS Records to Firebase Hosting
After ownership is verified, Firebase will provide you with the **A** (Address) records needed to route web traffic to Firebase.

1. In your domain registrar's DNS Zone Editor, remove any existing `A` records for your root domain (`@`).
2. Add the two new **A** records provided by Firebase:
    *   **First A Record:**
        *   **Type**: `A`
        *   **Host / Name / Alias**: `@`
        *   **Points to / Value**: Enter the first IP address provided by Firebase (e.g., `199.36.158.100`).
    *   **Second A Record:**
        *   **Type**: `A`
        *   **Host / Name / Alias**: `@`
        *   **Points to / Value**: Enter the second IP address provided by Firebase (e.g., `199.36.158.95`).
3. If you configured a `www` subdomain (e.g., `www.yourdomain.com`):
    *   Add a **CNAME** record pointing `www` to `oxisuretech-retention-app.web.app` or add the A records for `www` as instructed by the Firebase console.
4. Save your DNS changes.

---

## Step 5: Wait for SSL Provisioning
Firebase automatically provisions an SSL certificate (via Let's Encrypt) to secure your site (`https://`).
*   This happens automatically once the DNS records propagate and Firebase detects them.
*   It typically takes **1 to 2 hours** for the certificate to be generated and active. During this time, visiting the site via `https://` might show an SSL/privacy warning. This is normal and resolves itself.

---

## Step 6: Update Supabase Authentication Configurations
Since the app uses Supabase for user authentication, you must register the new domain with Supabase so that authentication redirects and Magic Links work properly.

1. Go to the [Supabase Dashboard](https://supabase.com/dashboard).
2. Select your project: **`ytqnbvkordtflrvibmss`** (matches production).
3. Navigate to **Authentication** -> **URL Configuration** in the left sidebar.
4. Update the **Site URL** if you want the main app redirection to point to your new custom domain (e.g., `https://yourdomain.com`).
5. Under **Redirect URIs**, add your new callback URL:
    *   `https://yourdomain.com/auth/callback` (replace `yourdomain.com` with your custom domain).
    *   If using the `www` subdomain, add `https://www.yourdomain.com/auth/callback` as well.
6. Save the settings.

---

## Step 7: Update Environment Variables (Optional)
If you have configured any production configurations that explicitly look at origin headers or environment variables mapping to the host domain, update them. The OxiSure Next.js source code is currently domain-agnostic, meaning it uses relative paths for standard client navigation and works automatically once Hosting and Supabase redirects are updated!
