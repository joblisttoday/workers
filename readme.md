# workers for joblist.city

## Development

- install dependencies: `npm install`
- run the script: `npm run start`

## Project

These workers will:
- pull data from the job-board-providers apis, given a list of companies
- populate an algolia index with the jobs

1. a list of companies to fetch
2. for each companies, fetch the available jobs from its job-board-provider
3. upload available jobs to algolia, in the correct index and with the correct tables populated
4. display a frontend that searches the populated index and shows results
