⚠️ This website is currently at napkin-sketch level. It's not finished.

TODO:

- Use a frontend framework like Vue or React to component-ize things
- Figure out which fields are actually needed in the `features.csv` and
  `templates.csv` indexes
- Add vendor-specific code to fetch stars/downloads of OCI Repository sources

## Development

```sh
npx serve
```

<sup>Or any static HTTP server</sup>

Users can create issues from the `add-thing.yml` Issue Form which will then
trigger the `add-thing.yml` GitHub Actions workflow. This will then add the
_thing_ (feature, feature collection, template, or template collection) to the
main `_data/things.csv` file. This is the index of all the "entry points" (for
lack of a better term) that we then crawl to maintain a concrete list of
features and templates. Why can't we do this at runtime? Because to make the
search responsive we need to precompute all the features and templates otherwise
we'd be making 700+ API requests to fetch all the metadata for all the leaves of
the `_data/things.csv` list!

**Why a DB-like CSV file?** \
Because this isn't near the scale of update rate or quantity where a full-on DB/API
makes sense. For the volume of updates (a few per week) and the quantity of items
(<5000) it makes sense to use a simpler solution.
