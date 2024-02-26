#!/bin/bash

echo "@database-git"
npm run database-git

echo "@save-companies"
npm run save-companies

echo "@save-jobs"
npm run save-jobs

echo "@processing-companies"
npm run processing-companies

echo "@processing-jobs"
npm run processing-jobs

echo "@analyze-companies"
npm run analyze-companies

echo "@analyze-jobs"
npm run analyze-jobs

echo "@heatmap-agg"
npm run heatmap-agg
