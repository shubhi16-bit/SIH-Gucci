import csv
import math


class SimilarityEngine:

    def __init__(self, metadata_path, events_path=None, weights=None):

        self.metadata_path = metadata_path
        self.events_path = events_path

        # Default similarity weights
        self.weights = weights or {
            "geographic": 0.25,
            "depth": 0.25,
            "formation": 0.30,
            "trajectory": 0.15,
            "context": 0.05
        }

        # Load Volve wells
        self.wells = self._load_wells()

        # Load historical events
        if events_path:
            self.events = self._load_events()
        else:
            self.events = []

    # =========================================================
    # LOAD VOLVE WELL METADATA
    # =========================================================

    def _load_wells(self):

        wells = []

        with open(
            self.metadata_path,
            "r",
            encoding="utf-8-sig"
        ) as file:

            reader = csv.DictReader(file)
            headers = reader.fieldnames

            # Detect if this is the normalized Volve metadata or raw NPD
            is_normalized = "wellbore_name" in headers

            for row in reader:

                if is_normalized:
                    well = {
                        "name": row.get("wellbore_name", "").strip(),
                        "field": row.get("field", "").strip(),
                        "well_type": row.get("well_type", "").strip(),
                        "latitude": self._to_float(row.get("latitude")),
                        "longitude": self._to_float(row.get("longitude")),
                        "total_depth": self._to_float(row.get("total_depth")),
                        "tvd": self._to_float(row.get("tvd")),
                        "max_inclination": self._to_float(row.get("max_inclination")),
                        "formation_td": row.get("formation_td", "").strip(),
                        "formation_hc": row.get("formation_hc", "").strip()
                    }
                else:
                    # Only use VOLVE wells from NPD data
                    if row.get("wlbField", "").strip().upper() != "VOLVE":
                        continue

                    well = {
                        "name": row.get("wlbWellboreName", "").strip(),
                        "field": row.get("wlbField", "").strip(),
                        "well_type": row.get("wlbWellType", "").strip(),
                        "latitude": self._to_float(row.get("wlbNsDecDeg")),
                        "longitude": self._to_float(row.get("wlbEwDecDeg")),
                        "total_depth": self._to_float(row.get("wlbTotalDepth")),
                        "tvd": self._to_float(row.get("wlbFinalVerticalDepth")),
                        "max_inclination": self._to_float(row.get("wlbMaxInclation")),
                        "formation_td": row.get("wlbFormationAtTd", "").strip(),
                        "formation_hc": row.get("wlbFormationWithHc1", "").strip()
                    }

                wells.append(well)

        return wells

    # =========================================================
    # LOAD HISTORICAL EVENTS
    # =========================================================

    def _load_events(self):

        events = []

        with open(
            self.events_path,
            "r",
            encoding="utf-8-sig"
        ) as file:

            reader = csv.DictReader(file)

            for row in reader:

                well_name = row.get(
                    "wellbore_id",
                    ""
                ).strip()

                # Remove "NO " prefix
                well_name = well_name.replace(
                    "NO ",
                    "",
                    1
                ).strip()

                event = {
                    "event_id": row.get(
                        "event_id",
                        ""
                    ).strip(),

                    "well_name": well_name,

                    "depth_start": self._to_float(
                        row.get("depth_start")
                    ),

                    "depth_end": self._to_float(
                        row.get("depth_end")
                    ),

                    "event_type": row.get(
                        "event_type",
                        ""
                    ).strip(),

                    "description": row.get(
                        "description",
                        ""
                    ).strip(),

                    "source": row.get(
                        "source",
                        ""
                    ).strip(),

                    "source_file": row.get(
                        "source_file",
                        ""
                    ).strip(),

                    "confidence": row.get(
                        "confidence",
                        ""
                    ).strip()
                }

                events.append(event)

        return events

    # =========================================================
    # CONVERT VALUE TO FLOAT
    # =========================================================

    @staticmethod
    def _to_float(value):

        try:

            if value is None:
                return None

            value = str(value).strip()

            if value == "":
                return None

            return float(value)

        except (ValueError, TypeError):

            return None

    # =========================================================
    # EXTRACT FEATURES
    # =========================================================

    def extract_features(self, well):

        return {
            "name": well.get("name"),

            "field": well.get("field"),

            "well_type": well.get("well_type"),

            "latitude": well.get("latitude"),

            "longitude": well.get("longitude"),

            "total_depth": well.get("total_depth"),

            "tvd": well.get("tvd"),

            "max_inclination": well.get(
                "max_inclination"
            ),

            "formation_td": well.get(
                "formation_td"
            ),

            "formation_hc": well.get(
                "formation_hc"
            )
        }

    # =========================================================
    # NORMALIZE NUMERICAL FEATURES
    # =========================================================

    def normalize_features(self, wells=None):

        if wells is None:
            wells = self.wells

        numerical_features = [
            "latitude",
            "longitude",
            "total_depth",
            "tvd",
            "max_inclination"
        ]

        normalized = []

        for well in wells:

            new_well = well.copy()

            for feature in numerical_features:

                values = [
                    w.get(feature)
                    for w in wells
                    if w.get(feature) is not None
                ]

                if not values:

                    new_well[feature] = 0.0
                    continue

                minimum = min(values)
                maximum = max(values)

                value = well.get(feature)

                if value is None:

                    new_well[feature] = 0.0

                elif maximum == minimum:

                    new_well[feature] = 1.0

                else:

                    new_well[feature] = (
                        (value - minimum)
                        /
                        (maximum - minimum)
                    )

            normalized.append(new_well)

        return normalized

    # =========================================================
    # FEATURE VECTOR
    # =========================================================

    def feature_vector(self, well):

        return [
            well.get("latitude", 0),
            well.get("longitude", 0),
            well.get("total_depth", 0),
            well.get("tvd", 0),
            well.get("max_inclination", 0)
        ]

    # =========================================================
    # HAVERSINE DISTANCE
    # =========================================================

    @staticmethod
    def _haversine(
        lat1,
        lon1,
        lat2,
        lon2
    ):

        earth_radius = 6371.0

        lat1 = math.radians(lat1)
        lat2 = math.radians(lat2)

        delta_lat = math.radians(
            lat2 - lat1
        )

        delta_lon = math.radians(
            lon2 - lon1
        )

        a = (
            math.sin(delta_lat / 2) ** 2
            +
            math.cos(lat1)
            *
            math.cos(lat2)
            *
            math.sin(delta_lon / 2) ** 2
        )

        c = 2 * math.atan2(
            math.sqrt(a),
            math.sqrt(1 - a)
        )

        return earth_radius * c

    # =========================================================
    # GEOGRAPHIC SIMILARITY
    # =========================================================

    def geographic_similarity(
        self,
        current,
        historical
    ):

        lat1 = current.get("latitude")
        lon1 = current.get("longitude")

        lat2 = historical.get("latitude")
        lon2 = historical.get("longitude")

        if None in (
            lat1,
            lon1,
            lat2,
            lon2
        ):

            return 0.0

        distance = self._haversine(
            lat1,
            lon1,
            lat2,
            lon2
        )

        # Same location = 100
        # 10 km or more = 0

        similarity = max(
            0.0,
            100.0 *
            (
                1.0
                -
                distance / 10.0
            )
        )

        return round(
            similarity,
            2
        )

    # =========================================================
    # DEPTH SIMILARITY
    # =========================================================

    def depth_similarity(
        self,
        current,
        historical
    ):

        tvd_current = current.get("tvd")
        tvd_historical = historical.get("tvd")

        td_current = current.get("total_depth")
        td_historical = historical.get("total_depth")

        # TVD similarity
        if (
            tvd_current is not None
            and tvd_historical is not None
        ):

            difference = abs(
                tvd_current
                -
                tvd_historical
            )

            reference = max(
                tvd_current,
                tvd_historical,
                1
            )

            tvd_score = max(
                0.0,
                100.0 *
                (
                    1.0
                    -
                    difference / reference
                )
            )

        else:

            tvd_score = 0.0

        # Total depth similarity
        if (
            td_current is not None
            and td_historical is not None
        ):

            difference = abs(
                td_current
                -
                td_historical
            )

            reference = max(
                td_current,
                td_historical,
                1
            )

            td_score = max(
                0.0,
                100.0 *
                (
                    1.0
                    -
                    difference / reference
                )
            )

        else:

            td_score = 0.0

        return round(
            0.70 * tvd_score
            +
            0.30 * td_score,
            2
        )

    # =========================================================
    # FORMATION SIMILARITY
    # =========================================================

    def formation_similarity(
        self,
        current,
        historical
    ):

        current_formations = set()
        historical_formations = set()

        for key in [
            "formation_td",
            "formation_hc"
        ]:

            value = current.get(key)

            if value:

                current_formations.add(
                    value.upper().strip()
                )

            value = historical.get(key)

            if value:

                historical_formations.add(
                    value.upper().strip()
                )

        if not current_formations:
            return 0.0

        if not historical_formations:
            return 0.0

        intersection = (
            current_formations
            &
            historical_formations
        )

        union = (
            current_formations
            |
            historical_formations
        )

        if not union:
            return 0.0

        similarity = (
            len(intersection)
            /
            len(union)
            *
            100.0
        )

        return round(
            similarity,
            2
        )

    # =========================================================
    # TRAJECTORY SIMILARITY
    # =========================================================

    def trajectory_similarity(
        self,
        current,
        historical
    ):

        current_inclination = current.get(
            "max_inclination"
        )

        historical_inclination = historical.get(
            "max_inclination"
        )

        current_depth = current.get(
            "total_depth"
        )

        historical_depth = historical.get(
            "total_depth"
        )

        # Inclination similarity
        if (
            current_inclination is not None
            and historical_inclination is not None
        ):

            difference = abs(
                current_inclination
                -
                historical_inclination
            )

            reference = max(
                abs(current_inclination),
                abs(historical_inclination),
                1
            )

            inclination_score = max(
                0.0,
                100.0 *
                (
                    1.0
                    -
                    difference / reference
                )
            )

        else:

            inclination_score = 0.0

        # Total depth similarity
        if (
            current_depth is not None
            and historical_depth is not None
        ):

            difference = abs(
                current_depth
                -
                historical_depth
            )

            reference = max(
                current_depth,
                historical_depth,
                1
            )

            depth_score = max(
                0.0,
                100.0 *
                (
                    1.0
                    -
                    difference / reference
                )
            )

        else:

            depth_score = 0.0

        return round(
            0.70 * inclination_score
            +
            0.30 * depth_score,
            2
        )

    # =========================================================
    # CONTEXT SIMILARITY
    # =========================================================

    def context_similarity(
        self,
        current,
        historical
    ):

        score = 0.0

        # Field match
        if (
            current.get("field")
            and historical.get("field")
            and
            current.get("field").upper()
            ==
            historical.get("field").upper()
        ):

            score += 50.0

        # Well type match
        if (
            current.get("well_type")
            and historical.get("well_type")
            and
            current.get("well_type").upper()
            ==
            historical.get("well_type").upper()
        ):

            score += 50.0

        return round(
            score,
            2
        )

    # =========================================================
    # OVERALL SIMILARITY
    # =========================================================

    def overall_similarity(
        self,
        current,
        historical
    ):

        geographic = self.geographic_similarity(
            current,
            historical
        )

        depth = self.depth_similarity(
            current,
            historical
        )

        formation = self.formation_similarity(
            current,
            historical
        )

        trajectory = self.trajectory_similarity(
            current,
            historical
        )

        context = self.context_similarity(
            current,
            historical
        )

        score = (
            self.weights["geographic"]
            *
            geographic

            +

            self.weights["depth"]
            *
            depth

            +

            self.weights["formation"]
            *
            formation

            +

            self.weights["trajectory"]
            *
            trajectory

            +

            self.weights["context"]
            *
            context
        )

        return round(
            score,
            2
        )

    # =========================================================
    # SIMILARITY EXPLANATION
    # =========================================================

    def similarity_explanation(
        self,
        current,
        historical
    ):

        return {
            "geographic": self.geographic_similarity(
                current,
                historical
            ),

            "depth": self.depth_similarity(
                current,
                historical
            ),

            "formation": self.formation_similarity(
                current,
                historical
            ),

            "trajectory": self.trajectory_similarity(
                current,
                historical
            ),

            "context": self.context_similarity(
                current,
                historical
            )
        }

    # =========================================================
    # GET ALL EVENTS FOR A WELL
    # =========================================================

    def get_historical_events(
        self,
        well_name
    ):

        normalized_name = (
            well_name
            .replace("NO ", "", 1)
            .strip()
        )

        return [
            event
            for event in self.events
            if event["well_name"]
            ==
            normalized_name
        ]

    # =========================================================
    # EVENT SUMMARY
    # =========================================================

    def event_summary(
        self,
        well_name
    ):

        events = self.get_historical_events(
            well_name
        )

        summary = {}

        for event in events:

            event_type = event[
                "event_type"
            ]

            if event_type not in summary:

                summary[event_type] = 0

            summary[event_type] += 1

        return summary

    # =========================================================
    # GET EVENTS NEAR CURRENT DEPTH
    # =========================================================

    def get_events_near_depth(
        self,
        well_name,
        current_depth,
        tolerance=15.0
    ):

        events = self.get_historical_events(
            well_name
        )

        nearby = []

        for event in events:

            depth_start = event.get(
                "depth_start"
            )

            depth_end = event.get(
                "depth_end"
            )

            # Use midpoint when both depths exist
            if (
                depth_start is not None
                and
                depth_end is not None
            ):

                event_depth = (
                    depth_start
                    +
                    depth_end
                ) / 2.0

            elif depth_start is not None:

                event_depth = depth_start

            elif depth_end is not None:

                event_depth = depth_end

            else:

                continue

            distance = abs(
                event_depth
                -
                current_depth
            )

            if distance <= tolerance:

                event_copy = event.copy()

                event_copy["event_depth"] = (
                    event_depth
                )

                event_copy["depth_distance"] = (
                    round(
                        distance,
                        2
                    )
                )

                nearby.append(
                    event_copy
                )

        # Closest events first
        nearby.sort(
            key=lambda x:
            x["depth_distance"]
        )

        return nearby

    # =========================================================
    # RANK HISTORICAL WELLS
    # =========================================================

    def rank_wells(
        self,
        current,
        top_k=5,
        exclude_name=None
    ):
        """
        Rank historical wells by similarity to `current`.

        Parameters
        ----------
        current : dict
            Query well dict (must have at minimum name, lat/lon or depth fields).
        top_k : int
            Number of top wells to return.
        exclude_name : str, optional
            If provided, skip any historical well whose name matches this string.
            Use to prevent a real historical well from appearing in its own results.
            When None, the target well is NOT automatically excluded — the caller
            must set exclude_name=current.get('name') to guarantee exclusion.
        """

        rankings = []

        for historical in self.wells:

            # Exclude the target well from its own results when requested
            if (
                exclude_name is not None
                and historical.get("name") == exclude_name
            ):
                continue

            score = self.overall_similarity(
                current,
                historical
            )

            explanation = (
                self.similarity_explanation(
                    current,
                    historical
                )
            )

            # Historical event summary
            event_summary = self.event_summary(
                historical.get("name")
            )

            # Total historical events
            total_events = sum(
                event_summary.values()
            )

            rankings.append({

                "well": historical.get(
                    "name"
                ),

                "score": score,

                "explanation": explanation,

                "event_summary": event_summary,

                "total_events": total_events
            })

        # Highest similarity first
        rankings.sort(
            key=lambda x:
            x["score"],
            reverse=True
        )

        return rankings[:top_k]

    # =========================================================
    # CLEAN SIMILARITY REPORT
    # =========================================================

    def similarity_report(
        self,
        current,
        top_k=5
    ):

        rankings = self.rank_wells(
            current,
            top_k
        )

        report = []

        for rank, item in enumerate(
            rankings,
            start=1
        ):

            explanation = item[
                "explanation"
            ]

            report.append({

                "rank": rank,

                "well": item[
                    "well"
                ],

                "similarity_score": item[
                    "score"
                ],

                "geographic_similarity": explanation[
                    "geographic"
                ],

                "depth_similarity": explanation[
                    "depth"
                ],

                "formation_similarity": explanation[
                    "formation"
                ],

                "trajectory_similarity": explanation[
                    "trajectory"
                ],

                "context_similarity": explanation[
                    "context"
                ],

                "total_historical_events": item[
                    "total_events"
                ],

                "historical_events": item[
                    "event_summary"
                ]
            })

        return report

    # =========================================================
    # HISTORICAL EVIDENCE NEAR CURRENT DEPTH
    # =========================================================

    def historical_depth_evidence(
        self,
        current,
        current_depth,
        top_k=3,
        tolerance=15.0
    ):

        # Get top comparable wells
        rankings = self.rank_wells(
            current,
            top_k
        )

        evidence = []

        for item in rankings:

            well_name = item[
                "well"
            ]

            nearby_events = (
                self.get_events_near_depth(
                    well_name,
                    current_depth,
                    tolerance
                )
            )

            for event in nearby_events:

                evidence.append({

                    "well": well_name,

                    "similarity_score": item[
                        "score"
                    ],

                    "event_type": event[
                        "event_type"
                    ],

                    "event_depth": event[
                        "event_depth"
                    ],

                    "depth_distance": event[
                        "depth_distance"
                    ],

                    "confidence": event[
                        "confidence"
                    ],

                    "description": event[
                        "description"
                    ]
                })

        # Closest events first
        evidence.sort(
            key=lambda x:
            x["depth_distance"]
        )

        return evidence

    # =========================================================
    # HISTORICAL RISK FEATURES
    # =========================================================

    def historical_risk_features(
        self,
        current,
        current_depth,
        top_k=3,
        tolerance=15.0
    ):

        evidence = self.historical_depth_evidence(
            current,
            current_depth,
            top_k,
            tolerance
        )

        rankings = self.rank_wells(
            current,
            top_k
        )

        stuck_pipe_count = 0
        mud_loss_count = 0
        high_confidence_count = 0

        distances = []

        for event in evidence:

            event_type = event[
                "event_type"
            ]

            if event_type == "STUCK_PIPE":

                stuck_pipe_count += 1

            if event_type == "MUD_LOSS":

                mud_loss_count += 1

            if event["confidence"] == "HIGH":

                high_confidence_count += 1

            distances.append(
                event["depth_distance"]
            )

        if distances:

            closest_event_distance = min(
                distances
            )

        else:

            closest_event_distance = None

        if rankings:

            best_similarity = rankings[
                0
            ]["score"]

        else:

            best_similarity = 0.0

        return {

            "current_depth": current_depth,

            "comparable_well_count": len(
                rankings
            ),

            "best_similarity": best_similarity,

            "nearby_event_count": len(
                evidence
            ),

            "nearby_stuck_pipe_count":
                stuck_pipe_count,

            "nearby_mud_loss_count":
                mud_loss_count,

            "high_confidence_event_count":
                high_confidence_count,

            "closest_event_distance":
                closest_event_distance
        }

        # =========================================================
    # COMPLETE WELL ANALYSIS
    # =========================================================

    def analyze_well(
        self,
        current,
        current_depth,
        top_k=5,
        tolerance=15.0
    ):

        similarity = self.similarity_report(
            current,
            top_k
        )

        depth_evidence = (
            self.historical_depth_evidence(
                current,
                current_depth,
                top_k,
                tolerance
            )
        )

        risk_features = (
            self.historical_risk_features(
                current,
                current_depth,
                top_k,
                tolerance
            )
        )

        return {
            "proposed_well": current,

            "current_depth": current_depth,

            "comparable_wells": similarity,

            "historical_depth_evidence":
                depth_evidence,

            "historical_risk_features":
                risk_features
        }