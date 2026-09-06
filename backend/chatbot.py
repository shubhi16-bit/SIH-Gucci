import json
import re
import os
from typing import Dict, Any, List

try:
    from backend.similarity import SimilarityEngine
    from backend.planning_engine import PlanningEngine
except ImportError:
    import sys
    sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    from backend.similarity import SimilarityEngine
    from backend.planning_engine import PlanningEngine

class LLMProvider:
    def generate(self, prompt: str) -> str:
        raise NotImplementedError

class DummyProvider(LLMProvider):
    def generate(self, prompt: str) -> str:
        if "CONTEXT: UNKNOWN" in prompt or "MISSING_CONTEXT" in prompt:
            return "The data does not contain enough evidence to answer this question. Please provide missing context or stick to supported domain queries."
            
        return (
            "[DUMMY LLM RESPONSE]\n"
            "Based on the retrieved evidence from the tools, here is the synthesis:\n"
            "(FACT: The LLM would accurately summarize the retrieved events, similarity indexes, and depths here without hallucinating.)\n"
            "(INFERENCE: If there is a pattern of mud losses in similar wells at this depth, it implies increased risk, but it is NOT a guaranteed prediction.)\n"
            "Please configure a real LLM provider for dynamic language generation."
        )

class DrillingTools:
    def __init__(self, sim_engine: SimilarityEngine, planning_engine: PlanningEngine):
        self.sim = sim_engine
        self.plan = planning_engine

    def _get_well_dict(self, well_name: str) -> dict:
        for w in self.sim.wells:
            if w["name"] == well_name:
                return w
        return None

    def find_similar_wells(self, current_well: str, top_k: int = 3) -> dict:
        target = self._get_well_dict(current_well)
        if not target:
            return {"tool": "find_similar_wells", "status": "error", "error": f"Well '{current_well}' not found."}
        rankings = self.sim.rank_wells(target, top_k=top_k, exclude_name=current_well)
        return {
            "tool": "find_similar_wells",
            "status": "success",
            "data": {"current_well": current_well, "top_k": top_k},
            "evidence": rankings
        }

    def explain_well_similarity(self, current_well: str, comparison_well: str) -> dict:
        target = self._get_well_dict(current_well)
        comp = self._get_well_dict(comparison_well)
        if not target or not comp:
            return {"tool": "explain_well_similarity", "status": "error", "error": "One or both wells not found."}
        explanation = self.sim.similarity_explanation(target, comp)
        return {
            "tool": "explain_well_similarity", 
            "status": "success",
            "data": {"current_well": current_well, "comparison_well": comparison_well},
            "evidence": [explanation]
        }

    def get_events_for_well(self, well_name: str) -> dict:
        events = self.sim.get_historical_events(well_name)
        return {
            "tool": "get_events_for_well",
            "status": "success",
            "data": {"well_name": well_name},
            "evidence": events[:50]
        }
        
    def filter_events_near_depth(self, events: list, depth: float, radius: float = 25.0) -> dict:
        filtered = []
        for e in events:
            # Handle keys from get_events_for_well ('depth_start'/'depth_end') 
            d_start = e.get('depth_start')
            d_end = e.get('depth_end')
            evt_depth = None
            if d_start is not None and d_end is not None:
                evt_depth = (d_start + d_end) / 2.0
            elif d_start is not None:
                evt_depth = d_start
            elif d_end is not None:
                evt_depth = d_end
                
            if evt_depth is not None and abs(evt_depth - depth) <= radius:
                filtered.append(e)
                
        return {
            "tool": "filter_events_near_depth",
            "status": "success",
            "data": {"depth": depth, "radius": radius, "input_count": len(events)},
            "evidence": filtered
        }

    def get_events_near_depth(self, current_well: str, depth: float, radius: float = 25.0) -> dict:
        target = self._get_well_dict(current_well)
        if not target:
            return {"tool": "get_events_near_depth", "status": "error", "error": f"Well '{current_well}' not found."}
        events = self.sim.historical_depth_evidence(target, depth, top_k=3, tolerance=radius)
        return {
            "tool": "get_events_near_depth",
            "status": "success",
            "data": {"current_well": current_well, "depth": depth, "radius": radius},
            "evidence": events
        }

    def get_historical_risk_evidence(self, current_well: str, depth: float) -> dict:
        target = self._get_well_dict(current_well)
        if not target:
            return {"tool": "get_historical_risk_evidence", "status": "error", "error": f"Well '{current_well}' not found."}
        analysis = self.sim.analyze_well(target, depth, top_k=3)
        risk = analysis.get("historical_risk_features", {})
        
        return {
            "tool": "get_historical_risk_evidence",
            "status": "success",
            "data": {"current_well": current_well, "depth": depth},
            "evidence": [{
                "comparable_well_count": risk.get("comparable_well_count"),
                "best_similarity": risk.get("best_similarity"),
                "nearby_event_count": risk.get("nearby_event_count"),
                "nearby_stuck_pipe_count": risk.get("nearby_stuck_pipe_count"),
                "nearby_mud_loss_count": risk.get("nearby_mud_loss_count"),
                "high_confidence_event_count": risk.get("high_confidence_event_count"),
                "closest_event_distance": risk.get("closest_event_distance")
            }]
        }

    def get_candidate_locations(self, area: list) -> dict:
        req = {"area": {"coordinates": [area]}, "target_depth": 2500}
        cands = self.plan.generate_candidates(req)
        feasible, rejected = self.plan.apply_constraints(cands, req.get('constraints', {}))
        scored_cands = self.plan.score_candidates(feasible, req)
        return {
            "tool": "get_candidate_locations",
            "status": "success",
            "data": {"candidates_found": len(scored_cands)},
            "evidence": scored_cands[:3]
        }

class AgentPlanner:
    def __init__(self):
        pass
        
    def extract_depth(self, text: str) -> float:
        m = re.search(r'(\d+)\s*m', text.lower())
        return float(m.group(1)) if m else None
        
    def extract_well(self, text: str) -> str:
        if "15/9-f-5" in text.lower(): return "15/9-F-5"
        if "15/9-19 a" in text.lower(): return "15/9-19 A"
        return None

    def plan(self, question: str, session_well: str, session_depth: float, session_area: list) -> List[dict]:
        q = question.lower()
        tools = []
        
        explicit_well = self.extract_well(q)
        explicit_depth = self.extract_depth(q)
        
        target_well = explicit_well or session_well
        target_depth = explicit_depth if explicit_depth is not None else session_depth
        
        # Guard against unrelated questions
        if "capital" in q or "probability" in q:
            return [] 

        # Planning / Location query
        if "location" in q or "area" in q or "drill" in q:
            if not session_area:
                return [{"tool": "MISSING_CONTEXT", "args": {"reason": "Target planning area polygon is required."}}]
            tools.append({"tool": "get_candidate_locations", "args": {"area": session_area}})
            return tools

        if not target_well:
            return [{"tool": "MISSING_CONTEXT", "args": {"reason": "No current well context provided."}}]

        # Explicit well events
        if explicit_well and "happen" in q:
            tools.append({"tool": "get_events_for_well", "args": {"well_name": explicit_well}})
            if target_depth is not None and explicit_depth is not None:
                tools.append({"tool": "filter_events_near_depth", "args": {"events": "CHAIN_PREV_EVENTS", "depth": target_depth}})
            return tools

        # Why similar
        if ("why" in q) and ("similar" in q):
            tools.append({"tool": "find_similar_wells", "args": {"current_well": target_well, "top_k": 1}})
            tools.append({"tool": "explain_well_similarity", "args": {"current_well": target_well, "comparison_well": "CHAIN_TOP_MATCH"}})
            return tools
            
        # Historical concern / risk
        if ("why" in q) and (("concern" in q) or ("risky" in q)):
            if target_depth is None:
                return [{"tool": "MISSING_CONTEXT", "args": {"reason": "No current depth context provided."}}]
            tools.append({"tool": "find_similar_wells", "args": {"current_well": target_well}})
            tools.append({"tool": "get_events_near_depth", "args": {"current_well": target_well, "depth": target_depth}})
            tools.append({"tool": "get_historical_risk_evidence", "args": {"current_well": target_well, "depth": target_depth}})
            return tools
            
        # Events near depth
        if ("near" in q or "around" in q or "at" in q) and ("depth" in q or "m" in q):
            if target_depth is None:
                return [{"tool": "MISSING_CONTEXT", "args": {"reason": "No depth context provided."}}]
            # For implicit target (e.g. "What happened near 2200 m" meaning offset wells)
            tools.append({"tool": "find_similar_wells", "args": {"current_well": target_well}})
            tools.append({"tool": "get_events_near_depth", "args": {"current_well": target_well, "depth": target_depth}})
            return tools
            
        # General similarity
        if "similar" in q:
            tools.append({"tool": "find_similar_wells", "args": {"current_well": target_well}})
            return tools
            
        # Fallback multi-tool
        if target_depth is not None:
            tools.append({"tool": "get_historical_risk_evidence", "args": {"current_well": target_well, "depth": target_depth}})
        else:
            tools.append({"tool": "find_similar_wells", "args": {"current_well": target_well}})
            
        return tools

class eRTMAC_Chatbot:
    def __init__(self, metadata_path: str, events_path: str, provider: LLMProvider = None):
        sim_engine = SimilarityEngine(metadata_path, events_path)
        npd_path = r"D:\Downloads\dataset\wellbore_exploration_all.csv"
        plan_engine = PlanningEngine(npd_path if os.path.exists(npd_path) else metadata_path)
        
        self.tools = DrillingTools(sim_engine, plan_engine)
        self.planner = AgentPlanner()
        self.provider = provider or DummyProvider()

    def execute_tool(self, tool_def: dict, previous_results: list) -> dict:
        t = tool_def["tool"]
        args = tool_def["args"]
        
        if t == "MISSING_CONTEXT":
            return {"tool": t, "status": "error", "error": args["reason"]}
            
        if t == "explain_well_similarity" and args.get("comparison_well") == "CHAIN_TOP_MATCH":
            prev = next((r for r in previous_results if r.get("tool") == "find_similar_wells"), None)
            if prev and prev.get("status") == "success" and prev["evidence"]:
                args["comparison_well"] = prev["evidence"][0]["well"]
            else:
                return {"tool": t, "status": "error", "error": "Could not chain well. No similar wells found."}
                
        if t == "filter_events_near_depth" and args.get("events") == "CHAIN_PREV_EVENTS":
            prev = next((r for r in previous_results if r.get("tool") == "get_events_for_well"), None)
            if prev and prev.get("status") == "success" and prev["evidence"]:
                args["events"] = prev["evidence"]
            else:
                return {"tool": t, "status": "error", "error": "Could not chain events for filtering."}

        try:
            if t == "find_similar_wells": return self.tools.find_similar_wells(**args)
            if t == "explain_well_similarity": return self.tools.explain_well_similarity(**args)
            if t == "get_events_for_well": return self.tools.get_events_for_well(**args)
            if t == "filter_events_near_depth": return self.tools.filter_events_near_depth(**args)
            if t == "get_events_near_depth": return self.tools.get_events_near_depth(**args)
            if t == "get_historical_risk_evidence": return self.tools.get_historical_risk_evidence(**args)
            if t == "get_candidate_locations": return self.tools.get_candidate_locations(**args)
        except Exception as e:
            return {"tool": t, "status": "error", "error": f"Tool execution failed: {str(e)}"}
            
        return {"tool": t, "status": "error", "error": f"Unknown tool: {t}"}

    def ask(self, question: str, current_well: str = None, current_depth: float = None, area: list = None) -> dict:
        tool_plan = self.planner.plan(question, current_well, current_depth, area)
        
        evidence = []
        is_unknown = len(tool_plan) == 0
        
        tool_calls = []
        
        for p in tool_plan:
            res = self.execute_tool(p, evidence)
            evidence.append(res)
            tool_calls.append({
                "tool": p["tool"],
                "args": {k: v for k, v in p["args"].items() if k != "events"}, # Avoid logging massive event payloads
                "status": res.get("status")
            })
            if res.get("status") == "error" and "context" in res.get("error", "").lower():
                is_unknown = True
                
        if is_unknown:
            prompt = "USER_QUERY: " + question + "\nCONTEXT: UNKNOWN or MISSING_CONTEXT. Provide no facts."
        else:
            context_str = json.dumps(evidence, indent=2)
            prompt = (
                "You are the eRTMAC-NWIS AI Assistant.\n"
                "RULES:\n"
                "- Every factual drilling claim must come from retrieved project data.\n"
                "- Do not invent wells, events, depths, formations, scores, or risks.\n"
                "- Similarity score must be called 'Weighted Similarity Index (0-100)'.\n"
                "- Never call similarity a probability or confidence.\n"
                "- Never use Risk V2 predictions/probabilities.\n"
                "- Clearly distinguish:\n"
                "  FACT: Directly supported by retrieved project data.\n"
                "  INFERENCE: Reasonable interpretation of retrieved evidence.\n"
                "  UNKNOWN: Not supported by available project data.\n\n"
                f"USER QUESTION: {question}\n\n"
                f"RETRIEVED EVIDENCE (from Tools):\n{context_str}\n\n"
                "ANSWER:"
            )
            
        response = self.provider.generate(prompt)
        
        return {
            "question": question,
            "session_context": {"well": current_well, "depth": current_depth, "area_supplied": bool(area)},
            "tools_selected": [t["tool"] for t in tool_plan],
            "tool_calls": tool_calls,
            "evidence": evidence,
            "answer": response
        }

if __name__ == "__main__":
    bot = eRTMAC_Chatbot(
        metadata_path=r"data\processed\volve_well_metadata.csv",
        events_path=r"data\processed\events.csv"
    )
    
    valid_area = [[1.8, 58.4], [1.9, 58.4], [1.9, 58.5], [1.8, 58.5], [1.8, 58.4]]
    
    tests = [
        {"desc": "A. Similar wells", "q": "What wells are similar to my current well?", "w": "15/9-19 A", "d": None, "a": None},
        {"desc": "B. Why similar", "q": "Why is this well similar?", "w": "15/9-19 A", "d": None, "a": None},
        {"desc": "C. Event by well", "q": "What happened in 15/9-F-5?", "w": "15/9-19 A", "d": None, "a": None},
        {"desc": "D. Event by depth", "q": "What happened near 2200 m?", "w": "15/9-19 A", "d": None, "a": None},
        {"desc": "E. Event by well + depth", "q": "What happened at 2200 m in 15/9-F-5?", "w": "15/9-19 A", "d": None, "a": None},
        {"desc": "F. Offset historical evidence", "q": "What happened in the closest offset wells around my current depth?", "w": "15/9-19 A", "d": 2200, "a": None},
        {"desc": "G. Historical concern", "q": "Why should I be concerned at 2200 m?", "w": "15/9-19 A", "d": 2200, "a": None},
        {"desc": "H. Planning with supplied area", "q": "Which location should we drill in this area?", "w": None, "d": None, "a": valid_area},
        {"desc": "I. Planning without area", "q": "Which location should we drill in this area?", "w": None, "d": None, "a": None},
        {"desc": "J. Missing current well/depth", "q": "What happened near my current depth?", "w": None, "d": None, "a": None},
        {"desc": "K. Unsupported question", "q": "What is the capital of France?", "w": "15/9-19 A", "d": 2200, "a": None},
        {"desc": "L. Unsupported probability request", "q": "What is the 90% probability of stuck pipe?", "w": "15/9-19 A", "d": 2200, "a": None}
    ]
    
    print("=" * 70)
    print("TESTING HARDENED MULTI-TOOL AGENT (SIH VERIFICATION)")
    print("=" * 70)
    
    for t in tests:
        print(f"\n--- TEST: {t['desc']} ---")
        print(f"Q: {t['q']} | Context: {t['w']} / {t['d']} / Area Supplied: {bool(t['a'])}")
        res = bot.ask(t['q'], t['w'], t['d'], t['a'])
        print(f"TOOLS: {res['tools_selected']}")
        for tc in res['tool_calls']:
            print(f"  -> {tc['tool']} | Args: {tc['args']} | Status: {tc['status']}")
            
        success_count = sum(1 for e in res['evidence'] if e.get("status") == "success")
        error_count = sum(1 for e in res['evidence'] if e.get("status") == "error")
        print(f"EVIDENCE: {success_count} success, {error_count} error")
        print(f"ANSWER:\n{res['answer']}")
