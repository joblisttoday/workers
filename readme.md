# workers for joblist.city

The **workers**:
- clone a list of companies, stored as a git repostiry: [github/joblistcity/companies](https://github.com/joblistcity/companies)
- fetch all available job positions from every companies by talking with job-boards providers APIS
- job-board providers implemented are: `greenhouse`, `recruitee`, `smartrecruiters` ... (see https://gitlab.com/joblist/job-board-providers).
- uploads the normalized data to populate an algolia search index
- jobs data is searchable on [joblist.today](https://joblist.today), etc.

## Development

- install dependencies: `npm install`
- run the script: `npm run` to find all available scripts
- check the file `.env.example` and create the `.env` file with the correct values

> the default `NODE_ENV` values should not be `production`, and can be anything else (or left empty). All scripts should work with development databases by default, so we don't break anything in production when developing.

## Deployment

> When not run for development purpose, set `process.env.NODE_ENV` to `production'`

Inside `.gitlab-ci.yaml` files, are defined jobs, triggered as
*schedules* via the Gitlab interface.

That way, jobs will be fetched for all companies, and an algolia index populated; triggered once daily.

## Job board providers

The possible **values** of the **key** `company.job_board_provider`, is one of those known to https://gitlab.com/joblist/job-board-providers
## Database(s)

> Tried firebase, algolia, supabase, static files.

Now the status is that the data is edited in static files (markdown on
the github data repository), and then consolidated into a [sqlite
wasm](https://www.npmjs.com/package/@sqlite.org/sqlite-wasm) database.

It is stored as an artifact in gitlab workers repo, then fetched by
the client (which fetches the latest).

- run `sqlite3 .db-sqlite/joblist.db` to create/open/use the database.
- run `npm run save-companies` or `npm run save-jobs` to load the
  database with its data

### Tips

#### export to json with sqlite

```bash
sqlite3 .db-sqlite/joblist.db '.mode json' '.once out.json' 'select * from companies'
```
> [source](https://stackoverflow.com/questions/5491858/how-to-export-sqlite-to-json)

#### attach an other db with sqlite

```bash
sqlite .db-sqlite/joblist.db
```
then in the sqlite3 shell
```bash
ATTACH DATABASE '.db-sqlite/stripe.db' AS stripeDb;
select * from stripeDb.highlight_companies;
```
