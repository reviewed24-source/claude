# Your Digital Business Card: Setup Guide

Hi Michael. This guide walks you through everything, one step at a time. You don't need to know any code. When a step says **click**, look for that exact word on the screen. When it says **type**, type exactly what's shown in the gray box.

**What's in your project folder**

| Folder or file | What it is |
|---|---|
| `card/index.html` | Your business card page |
| `card/contact.vcf` | The "Save Contact" file that phones read |
| `card/_headers` | A small settings file that tells the host how to send the contact file to phones. Don't delete it. |
| `card/assets/` | Logo, icons, video, and video cover image |
| `card-extras/google-apps-script.gs` | The code that sends form leads to a Google Sheet and your email |
| `card-extras/qr-code.png` and `qr-code.svg` | The QR code to print on your card |

**Do the parts in this order:**
1. Put the page online (Part 1)
2. Connect card.endurapinnacle.com (Part 2)
3. Test Save Contact (Part 3)
4. Turn on the lead form (Part 4)
5. Add your real video (Part 5)
6. Program your NFC card (Part 6)
7. Print the QR code (Part 7)
8. Run the checklist before your event (Part 8)

---

## Part 1: Put the page online with Netlify (free)

### Step A: Approve the changes on GitHub
1. Open the pull request link I sent you in the chat.
2. Scroll to the bottom. Click **Ready for review**.
3. Click the green **Merge pull request** button, then **Confirm merge**.

This puts the card files into the main version of your project, which Netlify will read.

### Step B: Create the Netlify site
1. Go to **app.netlify.com/signup**.
2. Click **Sign up with GitHub**. Approve when GitHub asks.
3. On the Netlify home screen, click **Add new project** (it may say **Add new site**). Then click **Import an existing project**.
4. Click **GitHub**. If it asks for permission, click **Authorize** or **Configure the Netlify app**, and allow access to the `claude` repository.
5. Click the repository named **claude**.
6. You'll see a settings form. Fill it in exactly like this:
   * **Branch to deploy:** `main`
   * **Base directory:** leave it empty
   * **Build command:** leave it empty
   * **Publish directory:** `card` (Netlify usually fills this in by itself)
7. Click **Deploy**.
8. Wait about 30 seconds until it says **Published**.

### Step C: Give it a nicer free address
1. Click **Project configuration** (or **Site configuration**) in the left menu.
2. Next to **Project name**, click **Change name**.
3. Type `endura-pinnacle-card` and click **Save**.
4. Your page is now live at **https://endura-pinnacle-card.netlify.app**. Open it on your phone to check it.

From now on, any change saved to the project on GitHub goes live on its own in about 30 seconds.

---

## Part 2: Use card.endurapinnacle.com

Your main website stays on Wix exactly as it is. We only add a "card." address that points to Netlify.

### Step A: Tell Netlify about the address
1. In Netlify, click **Domain management** in the left menu.
2. Click **Add a domain** (it may say **Add custom domain**).
3. Type `card.endurapinnacle.com` and click **Verify**.
4. Click **Add domain**.
5. Netlify may say **Awaiting External DNS** or **Check DNS configuration**. That's normal. Leave this tab open.
6. If Netlify offers to **set up Netlify DNS** or change your **name servers**, **do not do it**. That would take your Wix website offline.

### Step B: Add the CNAME record in Wix
(Use these steps if you bought endurapinnacle.com through Wix. If you bought it from GoDaddy, Namecheap, Google, or another company, sign in there instead and look for **DNS** settings. The record is the same.)

1. Go to **wix.com** and sign in.
2. Click your profile picture in the top right, then click **Domains**.
3. Next to **endurapinnacle.com**, click the **three dots (⋯)**, then click **Manage DNS Records**.
4. Scroll down to the section called **CNAME (Aliases)**.
5. Click **+ Add Record**.
6. In **Host Name**, type: `card`
7. In **Value** (or **Points to**), type: `endura-pinnacle-card.netlify.app`
8. Leave **TTL** as it is. Click **Save**. If Wix asks you to confirm, click **Save** again.

### Step C: Wait, then turn on HTTPS
1. It usually takes 15 minutes to 2 hours (rarely up to 48 hours).
2. Go back to Netlify's **Domain management** page. Under **HTTPS**, click **Verify DNS configuration**. Netlify then sets up the secure padlock for free on its own. If it shows a **Provision certificate** button, click it.
3. Open **https://card.endurapinnacle.com** on your phone. When it shows your card, this part is done.

**Don't print QR codes or program NFC cards until this address works.**

---

## Part 3: Test "Save Contact"

### On an iPhone
1. Open **Safari** and go to your card address (or scan the QR code with the **Camera** app, then tap the yellow link).
2. Tap the big green **Save Contact** button.
3. A contact preview appears showing "Michael Aguilar". (If you see a small "Download" message instead, tap it, then tap the file.)
4. Check the name, company, title, phone, email, website, and LinkedIn.
5. Scroll down and tap **Create New Contact**, then tap **Done**.
6. Open your **Contacts** app and find **Michael Aguilar** to confirm it saved.
7. Delete the test contact if you want: open it, tap **Edit**, scroll to the bottom, tap **Delete Contact**.

### On an Android phone
1. Open **Chrome** and go to your card address (or scan the QR code with the **Camera** app).
2. Tap **Save Contact**.
3. A message appears at the bottom saying the file downloaded. Tap **Open**. (If you miss it, swipe down from the top of the screen and tap the downloaded file.)
4. If Android asks which app to use, tap **Contacts**.
5. If it asks where to save, pick your **Google** account.
6. Tap **Save** or **Import**.
7. Open the **Contacts** app and check that Michael Aguilar is there with the phone, email, and websites.

---

## Part 4: Turn on the lead form (Google Sheet plus email, free)

You need a free Google account. Ideally use the one connected to info@endurapinnaclellc.com.

### Step A: Make the sheet
1. On a computer, go to **sheets.google.com** and sign in.
2. Click the big **+ Blank spreadsheet**.
3. Click **Untitled spreadsheet** at the top left and type `Business Card Leads`. Press **Enter**.

### Step B: Add the script
1. In the menu, click **Extensions**, then **Apps Script**. A new tab opens.
2. You'll see a box with `function myFunction() { }`. Click inside it, press **Ctrl+A** (or **Cmd+A** on a Mac) to select everything, and press **Delete**.
3. Open `card-extras/google-apps-script.gs` on GitHub. Click the **Copy raw file** button (two overlapping squares) at the top right of the file.
4. Go back to Apps Script, click in the empty box, and paste (**Ctrl+V** or **Cmd+V**).
5. Click the **Save** icon (a floppy disk) at the top.

### Step C: Run a test and give permission
1. At the top, next to **Debug**, there's a dropdown. Click it and choose **testSetup**.
2. Click **Run**.
3. A window says **Authorization required**. Click **Review permissions**.
4. Pick your Google account.
5. You'll see **Google hasn't verified this app**. That's normal, because you're the one who made it. Click **Advanced**, then **Go to Untitled project (unsafe)**.
6. Click **Allow** (or check the boxes and click **Continue**).
7. Go back to your spreadsheet tab. You should see a new tab at the bottom called **Leads** with a "Test Person" row. Check your email for a "New vending lead" message. You can delete the test row afterward.

### Step D: Publish it as a web app
1. In Apps Script, click the blue **Deploy** button (top right), then **New deployment**.
2. Click the **gear icon** next to "Select type" and choose **Web app**.
3. Fill in:
   * **Description:** `Card form`
   * **Execute as:** **Me**
   * **Who has access:** **Anyone** (this lets visitors submit the form; they can't see your sheet)
4. Click **Deploy**.
5. Copy the **Web app URL**. It starts with `https://script.google.com/macros/s/` and ends with `/exec`. Click **Done**.

### Step E: Connect the form to your page
The easiest way: **paste that URL to me in the chat** and I'll put it in for you.

If you want to do it yourself:
1. On GitHub, open `card/index.html`, then click the **pencil icon** (Edit).
2. Near the top, find the line `formEndpoint:  ""`.
3. Paste your URL between the two quote marks, like `formEndpoint:  "https://script.google.com/macros/s/ABC.../exec"`.
4. Click **Commit changes**, then **Commit changes** again. Netlify updates in about 30 seconds.
5. Fill in the form on your phone and check that a row appears and the email arrives.

**If you ever edit the script later:** click **Deploy**, then **Manage deployments**, the **pencil icon**, and set **Version** to **New version**. Then click **Deploy**. The URL stays the same.

Until the form is connected, anyone who submits it sees the error message with your phone number, so no lead is silently lost.

---

## Part 5: Add your real demo video

Right now the page shows a short placeholder made from your cooler photo.

**Recording tips:** hold the phone upright (vertical), about 30 seconds, good light, show the tap, the door unlocking, grabbing an item, and closing the door.

### Make the video small (under about 8 MB) with HandBrake (free)
1. On a computer, download **HandBrake** from **handbrake.fr** and install it.
2. Open HandBrake. Click **Open Source** and pick your video.
3. Under **Preset**, choose **General**, then **Fast 720p30**.
4. **Summary** tab: Format **MP4**, and check **Web Optimized** (sometimes called **Fast Start**).
5. **Dimensions** tab: make sure it shows a vertical size like **720 × 1280**. If it shows sideways numbers, the video is horizontal and should be re-recorded upright.
6. **Video** tab: Video Encoder **H.264 (x264)**, Framerate **30**, **Constant Quality** slider at **RF 28**.
7. **Audio** tab: Codec **AAC**, Bitrate **96**.
8. At the bottom, next to **Save As**, name it `demo.mp4`.
9. Click **Start Encode** (green play button).
10. Check the file size. Over 8 MB? Go back, set RF to **30**, and encode again.

### Send it to me
* **Easiest:** put the video in your **Google Drive** and tell me its name. I can grab it, compress it, and make a matching cover image for you.
* **Or yourself:** on GitHub, open the `card/assets` folder, click **Add file**, then **Upload files**, drag in `demo.mp4` (it replaces the placeholder), and click **Commit changes**.

---

## Part 6: Program your blank NTAG215 NFC card (free)

Do this **after** card.endurapinnacle.com works (Part 2).

1. Install **NFC Tools** (by wakdev) from the App Store or Google Play. It's free.
2. **Android only:** turn on NFC. Open **Settings**, search for **NFC**, and switch it on.
3. Open NFC Tools and tap the **Write** tab.
4. Tap **Add a record**.
5. Tap **URL / URI**. (Not "Contact" and not "Text". A web address record is what lets iPhones open it with no app.)
6. Make sure the prefix says **https://**, then type `card.endurapinnacle.com`. Tap **OK**.
7. You should see one record in the list. Tap **Write** (it may say **Write / 30 Bytes**).
8. Hold the card flat against your phone:
   * **iPhone:** the top edge on the back, near the camera.
   * **Android:** the middle of the back.
9. Keep it still until you see **Write complete**.

**Test it:** close NFC Tools. Unlock a phone (screen on) and tap the card to it. A notification should pop up; tap it and your card page opens. Try it on both an iPhone and an Android phone.

### ⚠️ About locking the tag (read before you tap anything)
NFC Tools has a **Lock tag** option under the **Other** tab. Locking is **permanent**. You can never change the card's address again, not even yourself.
* **Don't lock it** until you've tested it and you're sure card.endurapinnacle.com is your final address.
* Leaving it unlocked is fine for most people. The risk is very small (someone would need NFC Tools and to hold your card against their phone on purpose).
* If you want protection that can be undone, use **Other**, then **Set password** instead, and save that password somewhere safe.

---

## Part 7: Print the QR code

* Use `card-extras/qr-code.svg` for the printer (it stays sharp at any size). Use `qr-code.png` if the printer asks for an image.
* It points to **https://card.endurapinnacle.com/**, so only print after Part 2 works.
* It uses the highest error correction, so it still scans if the card gets scratched.
* Print it at least **0.8 inch (2 cm)** square. Black on white works best.
* Keep the white border around the code. Don't place it over a photo or a dark background.
* Scan the printer's proof with both an iPhone and an Android phone before printing the full order.

---

## Part 8: Checklist before your next event

- [ ] **https://card.endurapinnacle.com** opens on iPhone and Android, with the padlock showing
- [ ] **Save Contact** creates the contact correctly on an iPhone (Part 3)
- [ ] **Save Contact** creates the contact correctly on an Android phone (Part 3)
- [ ] **Text Me** opens Messages with the message filled in, sent to 626.222.3426
- [ ] **Call** dials 626.222.3426
- [ ] **Email** opens a new email to info@endurapinnaclellc.com
- [ ] **Website** and **LinkedIn** open the right pages
- [ ] Video plays on its own with no sound, and **Tap for sound** turns the sound on
- [ ] Lead form: a test submission adds a row to the sheet **and** emails you
- [ ] Texting the link to a friend shows the preview picture
- [ ] The NFC card opens the page on an iPhone and an Android phone
- [ ] The printed QR code scans on an iPhone and an Android phone
- [ ] Check with your phone's Wi-Fi turned off (cell signal only) that the page loads quickly

---

## Changing your details later

1. On GitHub, open `card/index.html` and click the **pencil icon**.
2. At the very top, there's a section marked **YOUR DETAILS: EDIT HERE**. Change only the text inside the quote marks.
3. Just below it, the lines starting with `<title>` and `<meta property="og:` also include your name and headline, which show up in link previews. Update them if needed.
4. **Also update `card/contact.vcf`** (pencil icon again) so the saved contact matches. The phone number goes on the `TEL` line, the email on the `EMAIL` line, and so on.
5. Click **Commit changes**. The site updates in about 30 seconds.

Or just tell me what to change, and I'll do it.
