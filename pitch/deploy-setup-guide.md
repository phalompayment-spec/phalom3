# Phalom: setting up Cloudflare and Supabase

This guide gets the five values that Claude needs to put Phalom online, and shows where to save them. It takes about 15 minutes. Both services are free for this project and neither needs a credit card.

| You will get | From | Used for |
|---|---|---|
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare | Which account the app goes into |
| `CLOUDFLARE_API_TOKEN` | Cloudflare | Lets Claude deploy the app (Workers) and use Workers AI for menu translation |
| `SUPABASE_URL` | Supabase | The address of your database |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase | Lets the app read and write the database |
| `SUPABASE_ACCESS_TOKEN` | Supabase | Lets Claude create the tables (optional, see Part 2, step 5) |

> **Keep these values private.** Don't paste them into the chat, a slide or a group message. Copy each one into a private note on your computer for now. In Part 3 you'll put them into the project settings, where only the deploy session can read them.

---

## Part 1: Cloudflare (the server)

### 1. Create an account
1. Go to **https://dash.cloudflare.com/sign-up**.
2. Sign up with the team email and confirm the email address.
3. When Cloudflare asks to add a website or domain, skip it. Phalom doesn't need one, because it runs on a free `workers.dev` address.

### 2. Pick your workers.dev name
1. In the left menu, open **Compute (Workers)**, then **Workers & Pages**. Older dashboards show only **Workers & Pages**.
2. If Cloudflare asks you to choose a **workers.dev subdomain**, pick something short, such as `phalom-team`.
   The app will then live at `https://phalom.phalom-team.workers.dev`.

### 3. Copy the Account ID
Look at the address bar. The URL looks like this:

```
https://dash.cloudflare.com/3f9c0a1b2c3d4e5f60718293a4b5c6d7/workers-and-pages
```

The 32-character code after `dash.cloudflare.com/` is your **Account ID**. It also appears under **Account details** on the Workers & Pages page.
→ Save it as `CLOUDFLARE_ACCOUNT_ID`.

### 4. Create an API token
1. Click the person icon at the top right, then **My Profile**, then **API Tokens**. The direct link is **https://dash.cloudflare.com/profile/api-tokens**.
2. Click **Create Token**.
3. Next to **Edit Cloudflare Workers**, click **Use template**.
4. Under **Permissions**, click **+ Add more** and add **Account · Workers AI · Edit**. The app uses Workers AI to translate menu items from Lao into Chinese, Thai and Vietnamese.
5. Under **Account Resources**, choose **Include** and select your account.
6. Under **Zone Resources**, choose **Include** and **All zones**. There are no zones yet, so this changes nothing.
7. Click **Continue to summary**, then **Create Token**.
8. Copy the token now. Cloudflare shows it only once.
→ Save it as `CLOUDFLARE_API_TOKEN`.

---

## Part 2: Supabase (the database)

### 1. Create an account
1. Go to **https://supabase.com/dashboard/sign-up**.
2. Sign up with GitHub or with email.

### 2. Create a project
1. Click **New project**. If Supabase asks, create an organization first; the Free plan is fine.
2. Fill in the form:
   - **Name:** `phalom`
   - **Database password:** click **Generate a password** and save it in your note. Claude doesn't need it, but you'll want it later.
   - **Region:** **Southeast Asia (Singapore)**, which is the closest to Laos and keeps the app fast.
3. Click **Create new project** and wait 1 to 2 minutes until the project shows as ready.

### 3. Copy the project URL
1. Open **Project Settings** (the gear at the bottom left), then **Data API**. Some dashboards call it **API**.
2. Copy the **Project URL**. It looks like `https://abcdefghijklmnop.supabase.co`.
→ Save it as `SUPABASE_URL`.

### 4. Copy the service role key
1. In **Project Settings**, open **API Keys**.
2. Open the **Legacy API Keys** tab, find **service_role** (marked *secret*), click **Reveal**, and copy it. It's a long value that starts with `eyJ`.
   - If your project has no Legacy tab, copy the **Secret key** instead. It starts with `sb_secret_`.
3. Don't use the `anon` or **Publishable** key. Phalom keeps every table locked to the public, and only the server uses the service key.
→ Save it as `SUPABASE_SERVICE_ROLE_KEY`.

### 5. Create an access token (lets Claude create the tables)
1. Open **https://supabase.com/dashboard/account/tokens**. You can also click your avatar at the top right and choose **Account preferences**, then **Access Tokens**.
2. Click **Generate new token**, name it `phalom-deploy`, then generate and copy it.
→ Save it as `SUPABASE_ACCESS_TOKEN`.

**If you'd rather not create this token,** make the tables yourself:
1. In the project, open **SQL Editor** and click **New query**.
2. Paste the whole of `supabase/migrations/0001_init.sql` from the code zip and click **Run**.
3. Do the same with `0002_seed.sql`.
4. In Part 3, add `SKIP_DB=1` in place of `SUPABASE_ACCESS_TOKEN`.

---

## Part 3: Give the values to the project

1. In this project, open **[Project settings](#project-settings/environment)**, open the **Cloud environment** menu and choose **Add cloud environment**. This also selects the new environment for the project.
2. **Name:** `phalom-deploy`
3. **Network access:** choose **Limited**, keep **Allow package managers** ticked, and add these **Allowed domains**:
   ```
   api.cloudflare.com
   *.workers.dev
   *.supabase.co
   api.supabase.com
   ```
4. **Environment variables:** paste these five lines, with your values after each `=` and no quotes or spaces:
   ```
   CLOUDFLARE_ACCOUNT_ID=
   CLOUDFLARE_API_TOKEN=
   SUPABASE_URL=
   SUPABASE_SERVICE_ROLE_KEY=
   SUPABASE_ACCESS_TOKEN=
   ```
5. Click **Save**.
6. In the thread, write **"saved"**.

## What happens next

A new session starts on the saved environment. It then:

1. Creates the tables and demo shops in Supabase.
2. Deploys the app to `https://phalom.<your-name>.workers.dev` and stores the Supabase values as Cloudflare secrets.
3. Runs the end-to-end test against the live address: register a shop, take a payment, see it confirmed.
4. Rebuilds the Android app with the live address built in, so it opens straight to your shop.
5. Puts the live link and QR code on slide 8 of the deck.

---

## Before pitch day

- **Wake the database.** Free Supabase projects pause after about a week with no activity. A day before the pitch, open the Supabase dashboard; if the project says *Paused*, click **Restore**.
- **Rehearse on the phone.** Open the app, take a 50,000 kip payment, and let a teammate scan the QR code and pay. The phone should chime and read out the amount.
- **Have a fallback.** If the room has no signal, use the simulate buttons under the QR code, or the offline demo in the Android app.

## After the pitch (optional clean-up)

- **Cloudflare:** open **My Profile**, then **API Tokens**, and delete the token. The app keeps running.
- **Supabase:** open **Account preferences**, then **Access Tokens**, and revoke `phalom-deploy`. The app keeps running.
- To take the app offline, delete the `phalom` Worker in Cloudflare and pause the project in Supabase.

## If something goes wrong

| What you see | What to do |
|---|---|
| Cloudflare asks for a credit card | You're on a paid-plan page. Go back to **Workers & Pages**; the Free plan needs no card. |
| No **Workers AI** permission in the token form | Use **Create Custom Token** and add **Workers Scripts · Edit**, **Workers AI · Edit**, **Account Settings · Read** and **User Details · Read**. |
| Supabase project still shows *Setting up* | Wait a few more minutes, then refresh the page. |
| You pasted a key into the chat by mistake | Delete or roll that key (Cloudflare: **Roll**; Supabase: **API Keys**, then rotate) and put the new value in the environment. |
