---
title: "Industrial Data Science WS 2025: course manuscript revised and now citable"
date: 2026-11-09T10:00:00
categories: [AI, MATH]
excerpt: "One year after teaching Industrial Data Science at MCI, the revised manuscript is out with a DOI. A teaser for what is inside."
---

One year ago, I taught *Industrial Data Science* in the Master of Mechatronics program at the Management Center Innsbruck (MCI).
The manuscript has now been revised (grammar, typos, minor content revisions) and released as v1.0.0 on Zenodo, so it is citable via a [DOI](https://doi.org/10.5281/zenodo.24092549).
It is [freely available online](https://noxthot.github.io/ws25_industrial_datascience_manuscript/) under CC BY-NC-SA 4.0.

## What is "Industrial Data Science" anyway?

The term is neither widely used nor standardized.
Roughly, it means applying data science to industrial settings: process optimization, quality control, predictive maintenance, and similar problems, all fed by large volumes of sensor and process data.
The literature more often calls it *Industrial AI*.
It differs from "regular" AI mostly in its demands: low error tolerance, real-time constraints, heterogeneous data sources, and a very clear expectation of value creation.

## The idea behind the course

Most data science courses work with clean, polished datasets.
Real machine data is not like that.
Sensors fail, buffers overflow, data types change halfway through, and documentation is either missing or wrong.

So the course is built as a slow descent from polished data to raw, live machine data, told in four acts:

- **Act 1: Polished Machine Data.** A warm-up with the synthetic AI4I 2020 predictive maintenance dataset, where we use exploratory data analysis to find out *when* a (simplified) milling machine fails.
- **Act 2: Time Series, a Curated Collection.** The toolbox: imputation, decomposition, similarity measures, clustering, classification, and regression on time series, each with runnable notebooks.
- **Act 3: Real Machine Data.** Here we get our hands dirty. Two simulated machines take center stage:
  - A **knife production line** whose epoxy application step produces defective handles. Wood is the most expensive part, and the curing oven downstream is energy-intensive, so every defect not caught early is costly. The task is to find the cause in raw sensor data and then tune the machine to reduce defects, first for the night shift and then for the day shift.
  - A **pick-and-place machine** with placement errors, simulated in real time and exposing its sensors via OPC UA. Students train a model to predict the placement error and close the loop by writing correction values back to the running machine.
- **Act 4: Lost Tapes.** An outlook on topics that did not fit into 45 hours: resampling, multimodal learning, and reinforcement learning in industry.

Along the way there are self-study sessions with exercises, from setting up JupyterLab with `uv` to wiring a trained model into a live feedback loop.
Both machine simulators are open source and run locally, so you do not need a factory to follow along.

## Who is it for?

The course was designed as a 3 × 15 hour introduction for mechatronics students with some Python background.
It does not try to cover the field in depth (each industrial context has its own data architecture and quirks).
It is meant as a hands-on starting point, and I hope it is useful to anyone moving from "data science on Kaggle" to "data science next to a machine".

## What comes next

I am teaching the course again right now, and I am using this run to restructure and revamp the content.
The finalized manuscript of this year's edition will be shared once the course has ended.
Until then, `v1.0.0` remains the citable reference for the 2025 edition.

If you use the material, please cite it via the [DOI](https://doi.org/10.5281/zenodo.24092549).
Feedback, corrections, and issues are always welcome on [GitHub](https://github.com/noxthot/ws25_industrial_datascience_manuscript).

Best,
Gregor
