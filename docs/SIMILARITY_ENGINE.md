# Similarity Engine

## Purpose

The Similarity Engine identifies historical Volve wells that are most
comparable to a proposed/current well.

It uses:

- Geographic similarity
- Depth similarity
- Formation similarity
- Trajectory similarity
- Well context

It also provides historical event information from the Volve DDR event dataset.

---

## Main File

```text
backend/similarity.py

### 1. Geographic Similarity

Geographic similarity compares the latitude and longitude of two wells.

The engine uses the Haversine formula to calculate the distance between
the wells.

The prototype uses:

Same location → 100% similarity
10 km or more → 0% similarity

The similarity decreases as the geographic distance increases.

### 2. Depth Similarity

Depth similarity compares the drilling depths of two wells.

The engine uses two depth measurements:

- True Vertical Depth (TVD)
- Total Depth

The calculation gives:

TVD → 70%
Total Depth → 30%

This gives more importance to TVD while still considering the overall
depth of the well.

For example, the proposed well has:

TVD = 3300 m
Total Depth = 4200 m

These values are compared with the corresponding values of each historical
well.

A smaller difference in depth results in a higher depth similarity score.

### 3. Formation Similarity

Formation similarity compares the geological formation information of two
wells.

The engine uses two formation fields:

- `formation_td` — Formation at Total Depth
- `formation_hc` — Hydrocarbon-bearing Formation

The engine creates a set of the available formation values for each well
and checks how much the two sets overlap.

For example, the proposed well has:

formation_td = SMITH BANK FM
formation_hc = HUGIN FM

Historical well `15/9-19 A` also has:

formation_td = SMITH BANK FM
formation_hc = HUGIN FM

Therefore, the two wells have a strong formation match.

A greater overlap between the formations results in a higher formation
similarity score.

### 4. Trajectory Similarity

Trajectory similarity compares how the wells deviate from the vertical
and their overall drilling depth.

The current prototype uses:

- Maximum inclination → 70%
- Total depth → 30%

Maximum inclination indicates the maximum angle reached by the well during
drilling.

For example:

Proposed well:
Maximum inclination = 58°

Historical well 15/9-19 A:
Maximum inclination = 59°

These values are very close, so the trajectory similarity is high.

The current implementation is a simplified trajectory proxy. It does not
compare the complete directional survey path of the wells.

Therefore, this should be considered a prototype approximation rather than
a full trajectory comparison.

### 5. Context Similarity

Context similarity compares the general context of two wells.

The current implementation uses:

- Field → 50%
- Well type → 50%

For example, the proposed well has:

Field = VOLVE
Well type = EXPLORATION

Historical well `15/9-19 A` has:

Field = VOLVE
Well type = EXPLORATION

Therefore, both context factors match and the context similarity is high.

A well from a different field or with a different well type receives a
lower context similarity score.