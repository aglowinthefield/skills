---
name: paprika
description: Read recipes, ingredients, categories, meal plans, menus, the grocery list, and the pantry out of the local Paprika Recipe Manager library on macOS. Use when the user asks about their recipes or Paprika, wants a recipe found, shown, or exported, asks what they can make with an ingredient, or wants their meal plan or grocery list.
---

# Paprika

Paprika keeps its library in a Core Data SQLite file inside its macOS group container. `scripts/paprika-sql` opens that file read-only, adds views with plain column names, and runs your SQL. It needs no login or network, and it sees edits as soon as Paprika saves them.

This skill only reads. Never write to Paprika's database, even through another path: Core Data caches rows while the app runs, and a direct write never syncs to the user's other devices.

## Run a query

```bash
scripts/paprika-sql -json "select name, rating, categories from recipes where rating = 5"
```

- Pass any `sqlite3` flags before the SQL: `-json` for data you will process, `-header -box` for a table to show the user, `-markdown` for notes.
- `scripts/paprika-sql --path` prints the data folder. Set `PAPRIKA_DATA` to point at a different one.
- Exit code 2 means a Paprika update changed the schema. The message names the missing table or column. Fix the view in `scripts/paprika-sql` and rerun before answering.

## Views

| View | Columns |
| --- | --- |
| `recipes` | `uid`, `name`, `rating` (0 to 5), `favorite`, `pinned`, `categories` (comma-separated), `servings`, `prep_time`, `cook_time`, `total_time`, `difficulty`, `source`, `source_url`, `description`, `ingredients`, `directions`, `notes`, `nutrition`, `photo_path`, `image_url`, `created` |
| `ingredients` | `recipe_uid`, `recipe`, `n` (line number), `line` |
| `categories` | `name`, `parent`, `recipe_count` |
| `meals` | `date`, `meal_type`, `name`, `recipe_uid`, `scale` |
| `menus` | `menu`, `notes`, `day`, `meal_type`, `name`, `recipe_uid`, `scale` |
| `groceries` | `list`, `aisle`, `name`, `ingredient`, `quantity`, `recipe`, `purchased` |
| `pantry` | `ingredient`, `quantity`, `aisle`, `location`, `in_stock`, `notes`, `expires`, `purchased` |

These views leave out trashed recipes. Dates and times are local. `ingredients`, `directions`, and `notes` are free text with one line per item, exactly as the user typed or imported them. Paprika has no structured ingredient model, so match ingredients with `like` and read the results, since "pepper" also matches "bell pepper".

`photo_path` is the full path to the recipe's photo on disk, so you can open or attach it. The raw Core Data tables (`ZRECIPE`, `ZMEAL`, and so on) are still there if a view lacks a column.

## Common queries

Find by name, ingredient, or category:

```sql
select name, rating, total_time from recipes where name like '%pasta%';
select distinct recipe from ingredients where line like '%leek%';
select name from recipes where categories like '%Fall Recipes%';
```

Show one recipe in full: select every column from `recipes` for its `uid` or exact `name`.

Recipes that use all of several ingredients:

```sql
select recipe from ingredients group by recipe_uid
having sum(line like '%leek%') > 0 and sum(line like '%potato%') > 0;
```

The meal plan for a week, and the open grocery list by aisle:

```sql
select date, meal_type, name from meals where date between '2026-11-23' and '2026-11-29' order by date;
select aisle, name, recipe from groceries where purchased = 0 order by aisle;
```

## Export

To export recipes, query `recipes` with `-json` and write one file per recipe. In Markdown, use the recipe name as the title, then source, servings, and times, then the ingredients as a list and the directions as numbered steps. Write the files where the user asks, never into the Paprika folder.
