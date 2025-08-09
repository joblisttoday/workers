#!/usr/bin/env bash

npm run database-git
npm run save-companies
npm run save-jobs
npm run processing-companies
npm run processing-jobs
npm run processing-stripe
npm run analyze-companies
npm run analyze-jobs
# npm run heatmap-agg
npm run optimize-database
npm run generate-duckdb
