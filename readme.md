# workers for joblist.city

The **workers**:
- clone a list of companies, stored as a git repostiry: [github/joblistcity/companies](https://github.com/joblistcity/companies)
- fetch all available job positions from every companies by talking with job-boards providers APIS
- job-board providers implemented are: `greenhouse`, `recruitee`, `smartrecruiters`
- uploads the normalized data to populate an algolia search index
- jobs data is searchable on [joblist.city](https://joblist.city), etc.

## Deployment

Inside `.gitlab-ci.yaml` files, are defined jobs, triggered as
*schedules* via the Gitlab interface.

That way, jobs will be fetched for all companies, and an algolia index populated; triggered once daily.

## Development

- install dependencies: `npm install`
- run the script: `npm run start`

## Job board providers

The possible **values** of the **key** `company.job_board_provider`, is one of those listed at `./src/providers` (filename, without the .js extension).

> Any `job_board_provider` with an open API can be implemented. Private API keys could still be used in the Gitlab-ci context.

To make a new provider, look at the other as example implementation (TODO: improve this!).
