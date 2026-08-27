---
title: "A 1x1 km hail hazard map for Austria from 14 years of observations"
date: 2026-08-27T10:00:00
categories: [MATH]
excerpt: "Our paper on the new Austrian hail hazard map is out. A digest."
---

Our paper *Building a high-resolution hail database for Austria and estimating hail hazard using a metastatistical approach* was published in *Weather and Climate Extremes* [1], open access.
The result is the hail hazard map now published on HORA [2].
This hail hazard map is accessible to everyone without registration.

This blog article provides an informal (!) digest of the paper's content and the main results.

## The problem

We want to answer questions like *how large is the hailstone that a given square kilometre in Austria likely sees once every 10/20/30 years?*

Two things make that hard:

1. **Hail is barely observed.** Human reports cluster where people and damageable things are. Radar covers everything but cannot measure hail directly.
2. **The record is short.** We have 14 years of 3D radar data (2009–2022) and want up to 30-year return levels. Classical extreme value statistics (block maxima, peak-over-threshold) throw away everything but the extremes, which is exactly what you cannot afford when the extremes are this rare. The usual workaround is to pool events over large regions and give up spatial resolution.

Previous work solved this by aggregating: 1° × 1° grids (≈ 110 km × 80 km in Central Europe), whole departments in France, grid points with "at least 30 years of data with at least one hail day". We wanted 1 km × 1 km.

## Part 1: building the database

Radar gives MESH (maximum estimated size of hail), derived from the vertical reflectivity profile. It is a proxy, and a biased one: C-band radar overestimates hail size.

The pipeline:

- **Quality-control the radar** by requiring an actual detected thunderstorm (radar cell *plus* lightning) at the same place and time. Ground clutter and wind turbines do not come with lightning.
- **Quality-control the reports** the same way, keeping only reports within 1 km of a detected thunderstorm outline on that day. ~5000 reports go in, 3943 come out.
- **Adjust MESH against the reports.** MESH is first converted to the largest expected hail size (LEHA) on 100 m² (roughly "what a spotter finds in their garden"), then linearly corrected by a pooled quantile regression: `size_adjusted = 1.47 · size_LEHA − 3.4`.
- **Merge reports back in** to cover what radar misses i.e. behind terrain.

The result is a daily maximum hailstone size per 1 km² cell, 14 years deep. It tracks reports well up to ~5 cm and then flattens out, because the archived radar reflectivity data is capped at 58 dBZ. That cap is a historical artifact of the archive, not of the hardware and hopefully will be lifted in future.

## Part 2: using *all* the data

Instead of block maxima we use the metastatistical extreme value distribution (MEVD): model the distribution of **ordinary** events, treat both the parameters and the number of events per year as random variables, and derive the extremes from that. Every hail day counts, including the 1 mm graupel ones. Literature shows that ordinary events reduce high-quantile uncertainty by up to 50% compared to classical EVT, and the advantage grows exactly when the return period exceeds the record length.

The ordinary events turn out to be Weibull distributed (shape ≈ 1.14, so nearly exponential but not quite), picked from 25 candidate distributions.

The spatio-temporal variant of the MEVD (STMEVD) lets the Weibull parameters vary smoothly in space and time. A previous study used a Bayesian additive model, which is where it got stuck: interaction terms are expensive, and adding atmospheric covariates was not feasible.

So we replaced the regression with a **distributional neural network**: six dense layers, 20 inputs, two outputs that *are* the Weibull scale and shape. Softplus on the output keeps them positive, Swish in the hidden layers keeps everything smooth (the STMEVD derivation wants smooth functions). Loss is the weighted negative log-likelihood of the predicted Weibull given the observed hail sizes. No labels, the network fits a distribution.

Two things I like about this trade:

- Covariates become cheap. CAPE, lightning amplitude, temperature, dew point, humidity, wind, gusts, snowfall border, plus coordinates and date, 20 inputs, and the interactions come for free with a dense net. Data-sparse grid cells borrow strength from similar cells (in a meteorological context) elsewhere.
- Fitting happens across the whole domain at once instead of per grid point, which is implicit knowledge transfer rather than a post-hoc spatial smoother.

## The imbalance problem

Big hailstones are rare and imbalanced *regression* is a much thinner literature than imbalanced classification.

One existing recipe to handle this sets weights at three control points (lower fence, median, upper fence of an adjusted boxplot) and interpolates. Applied here it discards half the data and inflates return levels absurdly.

Our replacement is simple: put a control point at every percentile of the observed hail size distribution and set the weight to `percentile / 100`. Interpolate with PCHIP. The largest hailstones get weight 1, the smallest 0.01, and the curve follows the actual frequency distribution.

## Results

50 independently trained networks, ensemble median per grid point, 98% confidence intervals via bootstrap over the ensemble.

- National median expected hailstone size: **3.5 cm** at a 10-year return period, **4.4 cm** at 30 years.
- In the most hail-prone quarter of the domain, 30-year return levels exceed **4.9 cm**.
- About **22% of Austria** falls into the most severe category (≥ 5 cm) at 30 years.
- Uncertainty stays below 0.4 cm for the vast majority of grid points.
- Hotspots: the transition from the Alpine foothills into the Graz Basin, the northern Alpine foreland across southern Germany and Austria, the northern Waldviertel toward the Czech Republic, and the Northern part of the Italian Friuli Venezia Giulia region.

The orographic signature: **small hail is frequent in the Alpine foothills, large hail happens in the adjacent plains.** Storms initiate over the foothills and reach full potential once they move out into the unstable, moist air of the flatlands.

Against a domain-wide null hypothesis of spatially uniform return levels, ~72% of grid cells are significantly distinct (p < 0.05), so the hotspots are structure rather than noise.

## Limitations

Being honest about the limits is important; here is the short version:

- The **58 dBZ cap** means hail above ~5 cm is systematically underestimated. Full-resolution polar volume data and dual-pol would remove it.
- **14 years** is short. Individual severe storms still leave visible footprints in the 30-year return levels; that fades as the record grows. We cap the estimated return period at roughly twice the record length for a reason.
- Ground truth is subjective and population-biased.
- The Valluga radar has been out since a lightning strike in 2017, which leaves a hole in western Austria.

We also ship a **confidence rating** per grid cell, combining radar geometry (beam height, shading, measurement volume) with data availability (≥ 15 hail days for full credit).

Code (Julia, Python, R) is MIT on Zenodo, return level maps likewise [3].

Best,
Gregor


[1] <https://doi.org/10.1016/j.wace.2026.100916>

[2] <https://www.hora.gv.at>

[3] <https://doi.org/10.5281/zenodo.15831488>
