# workers for joblist.city

There **workers** take a list of companies (stored in independant
.toml files), fetch their available job positions from their job-board
provider (Personio, Greenhouse, Smartrecruiters...), and uploads the
normalized data to populate a search index (Algolia). This data is then
made available to be searched on [joblist.city](https://joblist.city).

## Deployment

Inside `.gitlab-ci.yaml` files, are defined jobs, triggered as
*schedules* via the Gitlab interface.

That way, the fetch-jobs-for-all-companies-and-populate-algolia-search
job, is triggered once daily.

## Development

- install dependencies: `npm install`
- run the script: `npm run start`

## A company

All companies feched are stored in `./content`. 
The format used is TOML.

A minimal company, is a file at `./content/company-name.toml`, with the following keys:

```toml
created_at = "2009-09-09T09:09:08.666Z"
title = "Example"
company_url = "https://example.com"
carreer_page_url = "https://example.com/careers"
job_board_provider = "smartrecruiters"
job_board_hostname = "example"
```

Addittional keys could be:
```
slug = "example-slug"
body = "Example description"
tags = ["example", "example1", "example2"]
address = "Berliner Str. 11"
postal_code = "10999"
city="berlin"
country="germany"
latitude = 52.493882
longitude = 13.430114
linkedin_url = "https://www.linkedin.com/company/example"
twitter_url = "https://twitter.com/example"
instagram_url = "https://www.instagram.com/example"
facebook_url = "https://www.facebook.com/example"
```

## Job board providers

The company key `job_board_provider` is one of those listed at `./providers` (without the .js extension).

Any *job_board_provider* with an open API can be implemented. Private
API keys could still be used in the Gitlab-ci context.

## Notes

```
curl -sS "https://<url>/<namespace>/<project>/-/jobs/artifacts/<refs>/download?job=<job_name>
```
