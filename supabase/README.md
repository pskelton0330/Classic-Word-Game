# Classic Words shared dictionary setup

1. Open the **Classic Words** Supabase project (the project URL ends in `uvhqfkjodnhpacxhcpan.supabase.co`).
2. Open **SQL Editor → New query**, paste the contents of [`setup.sql`](setup.sql), then select **Run**.
3. In **Authentication → URL Configuration**, add this exact redirect URL to the Redirect URLs allow-list:
   `https://pskelton0330.github.io/Classic-Word-Game/`
4. In **Authentication → Sign In / Providers → Email**, keep email sign-in enabled. In **Authentication → Settings**, turn off **Allow new users to sign up** after adding the permitted players under **Authentication → Users → Add user → Send invitation**. This ensures only invited accounts can write shared words.
5. Once the site deploys, open **Dictionary → My Words**, sign in with an invited email, and use **Share this device’s saved words** to migrate any existing local entries.

The browser app uses the project's publishable key, which is designed for client use. The SQL enables row-level security: anyone can read the game word list, while signed-in users can add words and remove only words they added. Never put a secret/service-role key in this repository.
