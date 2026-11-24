# news-image-20261123-v2 — 23 November 2026: The World in One Day

[![make.fun](https://make.fun/badge/news-image-20261123.svg)](https://make.fun/c/news-image-20261123)
[![rank](https://make.fun/badge/news-image-20261123/vvtwentyfive/news-image-20261123-v2/rank.svg)](https://make.fun/c/news-image-20261123)
[![reward](https://make.fun/badge/news-image-20261123/vvtwentyfive/news-image-20261123-v2/reward.svg)](https://make.fun/c/news-image-20261123)

A code-rendered 1024x1024 newspaper front page summing up Monday 23 November 2026 in one image. `main.ts` (Node 22, stdlib only) draws every word and number with code — no pasted picture, no network, no randomness — and writes a byte-identical `entry.png` on every run.

## What the image shows

- **Giant date:** 23 NOVEMBER 2026, readable at a glance.
- **Market KPIs:** Nasdaq +6.5% (24,090), S&P 500 +4.7% (7,238), Nvidia +31%, Bitcoin $61,300.
- **Lead story:** Jensen Huang reinstated as Nvidia CEO 11 days after resigning; the Dow jumps 1,450 points to 49,595, Micron +19%, Marvell +18%, Tesla +11%.
- **Eight more stories:** COP31 climate talks collapse with no deal; Ukrainian naval drones hit two Russian ships off Libya; 15 killed around Kyiv; Indonesia sweets-factory fire kills at least 24; euro-area inflation 4.0%; Anthropic says AI helped prove the Riemann hypothesis; Tarik Skubal's 9-year, $450M Mets deal; BepiColombo enters orbit around Mercury after eight years.
- **Bottom ticker:** gold $3,635 (+3.4%), oil $80.25 (-3.8%), Dow 49,595 (+3.0%), CrowdStrike buys Zscaler for $44bn, EU proposes 22nd Russia sanctions package, FBI probes a police-database hack, US sanctions 20+ Iranian targets, Mexico captures FBI most-wanted El Chapo Isidro.

## Run

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Determinism

Two runs produce byte-identical `entry.png` (same sha256). Verified during build.
