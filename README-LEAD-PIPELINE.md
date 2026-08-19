# Endura Pinnacle Vending — Lead Pipeline

A one-page web app for working vending placement leads across Los Angeles County.
It runs entirely in your phone's browser. There is no login, no server, and nothing to pay for.

**Files:** `index.html` (the whole app) and `icon.png` (the home screen icon). That's it.

---

## 1. Turn on the website (once, on a computer or the phone)

1. Go to your repository on GitHub: **https://github.com/reviewed24-source/claude**
2. Click **Settings** (the tab along the top of the repo, on the right).
3. In the left sidebar, click **Pages**.
4. Under **Build and deployment → Source**, choose **Deploy from a branch**.
5. Under **Branch**, pick the branch that has this app on it — **`claude/endura-pinnacle-pipeline-tu5xe6`**
   (or your main branch, if you've already merged the pull request). Leave the folder set to **`/ (root)`**.
6. Click **Save**.
7. Wait about a minute, then refresh that Settings → Pages screen. It will show a green banner with your live link.

**Your address will be:**

```
https://reviewed24-source.github.io/claude/
```

If you get a 404 for the first few minutes, that's normal — GitHub is still publishing. Wait and refresh.

---

## 2. Put it on your iPhone home screen

1. Open **Safari** on your iPhone (it has to be Safari, not Chrome).
2. Go to **https://reviewed24-source.github.io/claude/**
3. Tap the **Share** button — the square with the arrow pointing up, at the bottom of the screen.
4. Scroll down the list and tap **Add to Home Screen**.
5. Name it something short like **Endura Leads**, then tap **Add**.

You now have an icon on your home screen. Tapping it opens the app full screen, with no browser bars —
it looks and behaves like a normal app, and it works with no signal (your leads are already on the phone).

---

## 3. How the app is laid out

Four buttons along the bottom:

| Tab | What it's for |
|---|---|
| **Pipeline** | Every lead, grouped by status with New at the top. Best fit first, then soonest follow-up. |
| **Today** | Your call list: anything overdue or due today, plus New leads scored 4 or 5. |
| **Add Lead** | The form for a lead you found yourself in the field. Only the business name is required. |
| **Data** | CSV import, backups, and the button that clears the example leads. |

At the top you always see how many leads are **New** and how many are **to call today**. Both are tappable.

**Changing a status takes one tap** — the row of five buttons at the bottom of each card, right in the list.
You never have to open a lead to move it along. Tapping **Dead** asks you why (No answer, Not interested,
Has a vendor, Too small, Wrong contact, Other) and saves the reason on the lead.

**Every lead has five one-tap actions:** Call, Text, Email, Map (opens Apple Maps), and Web.
Greyed-out means you don't have that piece of information on the lead yet.

**Notes are a log, not a box.** Every note you add is stamped with the date and kept, so you can read a
lead's history top to bottom. Status changes get logged automatically too.

---

## 4. Importing the CSV from your research automations

Data tab → **Import this morning's CSV**. You can either pick the file or paste the text straight in
(pasting is usually faster on a phone).

- Columns are matched by their header names, ignoring capitals. It understands the usual variations —
  *business / property / company / name*, *phone / tel / telephone*, *units / unit count / headcount /
  employees*, *fit / fit score*, *source / source URL*, and more.
- Before anything is saved, you get a screen showing what each column was matched to, with the first
  value from that column so you can sanity-check it. Anything guessed wrong, you fix from a dropdown.
- **Duplicates are skipped.** Two leads count as the same when the business name and street address are
  close matches — so "Vernon Cold Storage & Logistics, 4820 S Boyle Ave" and "Vernon Cold Storage and
  Logistics Inc., 4820 S. Boyle Avenue" are recognised as one business. You're told how many were skipped
  and which ones.
- **Nothing you already have is ever overwritten.** The status, follow-up date, and notes on a lead you
  already had are left exactly as they were.

---

## 5. Backups — please actually do these

Everything lives in Safari's storage on your phone. That storage can be wiped by iOS if the phone gets
low on space, or if you clear Safari's data. So:

- Data tab → **Export backup file** saves a `.json` file with every lead in it. On the iPhone, save it
  to Files (iCloud Drive is a good spot) or mail it to yourself.
- Data tab → **Restore from a backup file** puts everything back from one of those files.
- If it's been more than 30 days since your last export, a yellow banner appears at the top of the app
  until you back up.

---

## 6. The example leads

The app starts with five made-up Los Angeles leads so you can see how everything behaves.
When you're ready for the real thing: Data tab → **Clear the 5 example leads**. That removes only the
examples and leaves anything you've added or imported alone.

---

## 7. If you ever want to change something

Everything is in `index.html`. Edit that one file, commit it to the branch GitHub Pages is publishing
from, and the live site updates itself within a minute or two. Refresh the app on your phone to pick up
the new version.
