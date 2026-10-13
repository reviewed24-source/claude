# Snack Swipe

A Tinder-style voting page for a vending machine. Each card is a snack: swipe right (or press →) to stock it, swipe left (or press ←) to pass. Stocked snacks drop into slots A1–D4 of the vending machine next to the deck.

## Run it

It's a single static page with no build step:

```sh
cd snack-swipe
python3 -m http.server 8000
# open http://localhost:8000
```

Opening `index.html` directly from disk also works.

## What's in it

- **Swipe**: drag the card with a mouse or a finger, use the Pass and Stock it buttons, or press ← / →. Undo (or Backspace) brings back the last card.
- **Results**: your machine with slot codes, plus stocked and passed lists. Each row has a button to change your mind.
- **Saved progress**: votes are kept in the browser's `localStorage`, so a reload picks up where you left off.
- **Everyone's picks**: when the page is published as a Claude artifact, each viewer's ballot is saved to the artifact's shared database (`votes/<viewer id>`, one document per person) and the Results tab ranks every snack by the share of people who want it. When the page is opened anywhere else, this section stays hidden and everything else still works.

## Adding or changing snacks

Edit the `SNACKS` array near the top of the `<script>` in `index.html`. Each entry needs an `id` that matches an image at `images/<id>.webp`, plus a name, a short description, a category, a size and a background tint for the card. Product photos were trimmed to the package edge and saved as WebP at up to 720 px.
