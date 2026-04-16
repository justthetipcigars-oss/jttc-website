# JTTC Tasting Journal — Planning Document

---

## Concept

One journal entry per cigar per user. The entry can be edited at any time.
Every save creates a revision so the user can look back and see how their
notes on that cigar have changed over time.

---

## How Users Get Here

The journal entry for a cigar can be reached from four places:
- Purchase History
- Tasting Journal (standalone page listing all their entries)
- Ashtray
- Humidor

When accessed from a product context (e.g. clicking a cigar in Purchase
History), the entry is pre-populated with data pulled from that product's
Lightspeed record. The user just fills in the experiential fields.

---

## Auto-Filled Fields (from Lightspeed)

These are pulled automatically when the user opens a journal entry from a
product. The user can correct them if needed.

| Field       | Source                                      |
|-------------|---------------------------------------------|
| Cigar Name  | product.name                                |
| Brand       | product.brand                               |
| Size        | product.variantOptions["Size"]              |
| Wrapper     | parsed from product.description             |
| Binder      | parsed from product.description             |
| Filler      | parsed from product.description             |

NOTE: Description parsing depends on consistent formatting.
Agreed format to use in product descriptions:
  Wrapper: [value] | Binder: [value] | Filler: [value]

---

## User-Filled Fields

These are what the member enters from their smoking experience.

### Date Smoked
- Date picker, defaults to today

### Flavor Meter
Three separate 5-point scales. Display as segmented buttons or a slider.
Labels: Very Mild | Mild | Medium | Med-Full | Full

- Body        (1–5)
- Flavor      (1–5)
- Strength    (1–5)

### Flavor Wheel
Not an interactive chart. A link/button opens a reference flavor wheel
(external resource or modal image) so the user can identify what they're
tasting.

### Flavor Tags
A set of selectable tags the user picks to log what they detected.
Stored as a text array in Supabase — queryable for dashboard aggregation.

Tag list (CONFIRMED):

Earth & Wood:   Leather, Cedar, Oak, Earth, Hay, Tobacco
Spice:          Black Pepper, White Pepper, Cinnamon, Nutmeg, Clove
Sweet:          Chocolate, Dark Chocolate, Coffee, Espresso, Vanilla, Caramel, Honey, Molasses
Fruit:          Citrus, Cherry, Fig, Raisin, Dried Fruit, Plum
Floral & Herbal: Floral, Grass, Herbal, Mint, Tea
Nut & Cream:    Almond, Walnut, Peanut, Cream, Butter, Toast, Bread

### Notes
Free-text area. No character limit. This is their personal tasting notes.

### Ratings (1–5 stars each)
- Appearance
- Value for Money
- Flavor
- Overall Rating

### Would You Try Again?
Yes / No toggle

---

## Revision History

Every time the user saves edits to an entry, the previous version is
archived. They can view past revisions from the entry page.

Display: a simple list of past saves with the date — clicking one shows
a read-only snapshot of that version.

---

## Data Storage (Supabase)

### Table: cigar_journal
One row per user per cigar. Stores the current/live version.

| Column            | Type      | Notes                              |
|-------------------|-----------|------------------------------------|
| id                | uuid      | primary key                        |
| user_id           | uuid      | FK to auth.users                   |
| product_id        | text      | Lightspeed product ID              |
| cigar_name        | text      | auto-filled                        |
| brand             | text      | auto-filled                        |
| size              | text      | auto-filled                        |
| wrapper           | text      | auto-filled, editable              |
| binder            | text      | auto-filled, editable              |
| filler            | text      | auto-filled, editable              |
| date_smoked       | date      |                                    |
| body              | int (1–5) |                                    |
| flavor_intensity  | int (1–5) |                                    |
| strength          | int (1–5) |                                    |
| notes             | text      |                                    |
| appearance_rating | int (1–5) |                                    |
| value_rating      | int (1–5) |                                    |
| flavor_rating     | int (1–5) |                                    |
| overall_rating    | int (1–5) |                                    |
| flavor_tags       | text[]    | array of selected flavor tag names |
| band_photo_url    | text      | user-uploaded photo of cigar band  |
| would_try_again   | boolean   |                                    |
| created_at        | timestamp |                                    |
| updated_at        | timestamp |                                    |

### Table: cigar_journal_revisions
One row per saved edit. Stores the full snapshot before each change.

| Column     | Type      | Notes                              |
|------------|-----------|------------------------------------|
| id         | uuid      | primary key                        |
| journal_id | uuid      | FK to cigar_journal.id             |
| user_id    | uuid      | FK to auth.users                   |
| snapshot   | jsonb     | full copy of the entry at that time|
| saved_at   | timestamp |                                    |

---

## Decisions Made

1. Flavor tags: YES — structured tags plus free-form notes
2. Band photo upload: YES — stored in Supabase Storage (same bucket as avatars)
3. Revision history: capped at 5 saved versions per entry
4. Journal standalone page: sorted by highest rated, with search.
   Two sections:
   - Logged entries (cigars they've journaled, sorted by overall rating)
   - Unlogged cigars (from purchase history, no entry yet — "Start Entry" button)
5. Description format: product descriptions in Lightspeed need to follow this
   exact pattern so wrapper/binder/filler can be auto-parsed:
     Wrapper: Ecuador | Binder: Nicaragua | Filler: Dominican, Honduras
   This is an editorial task — update product descriptions in Lightspeed
   to use this format before the auto-fill feature will work reliably.

## All Decisions Made — Ready To Build

---

## Pages To Build (in order)

1. /account/journal             — lists all the user's journal entries
2. /account/journal/[slug]      — the individual entry / edit page
3. Popup in Purchase History    — click a cigar, choose "Tasting Journal"
4. Same popup wired to Humidor, Ashtray (later)

---

_Last updated: 2026-04-16_
