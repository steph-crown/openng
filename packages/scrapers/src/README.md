# Scrapers Source Guide

This directory contains resource-specific scraper modules and helper logic used to produce seed data before import to staging.

## Required documentation rule

For every resource directory under `packages/scrapers/src/{resource}/`:

- Include a `README.md`.
- Document each scraper/module in that directory.
- Explain pipeline step (`acquisition`, `transformation`, `verification`) and run order.
- Provide exact run commands.
- Document expected input files and output files.

## Current resource directories

- `postal-codes/`

If a new resource scraper directory is added, add its README in the same change.
