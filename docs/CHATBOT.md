# eRTMAC-NWIS AI Chatbot Architecture

## Overview
The eRTMAC-NWIS Chatbot is designed as an **evidence-grounded, retrieval-augmented generation (RAG)** assistant. Its primary objective is to allow engineers to query historical drilling hazards and similarity evidence using natural language, without the risk of AI hallucination or uncalibrated probabilistic predictions.

The chatbot backend (`backend/chatbot.py`) acts as a bridge between the user's natural language queries and the deterministic mathematical outputs of the `SimilarityEngine`.

## Architecture
1. **Intent Parsing:** The user's query is intercepted and mapped to a specific internal action (e.g., `SIMILAR_WELLS`, `HISTORICAL_EVENTS_DEPTH`, `WHY_SIMILAR`).
2. **Evidence Retrieval:** Based on the intent, the chatbot calls the exact same `SimilarityEngine` methods used by the rest of the backend (`rank_wells`, `historical_depth_evidence`, `get_historical_events`, etc.).
3. **Context Construction:** The deterministic outputs (similarity indexes, event descriptions, depths) are formatted into a dense, factual text block.
4. **LLM Generation:** The LLM is provided with strict system rules and the retrieved evidence context. It synthesizes the final response.

## Supported Intents & Example Questions

| Intent | Example Question | Retrieval Function |
|--------|------------------|---------------------|
| `SIMILAR_WELLS` | "What wells are similar to my current well?" | `SimilarityEngine.rank_wells` |
| `WHY_SIMILAR` | "Why is 15/9-F-5 considered similar?" | `SimilarityEngine.similarity_explanation` |
| `HISTORICAL_EVENTS_DEPTH` | "What historical events happened near 2200 m?" | `SimilarityEngine.historical_depth_evidence` |
| `HISTORICAL_EVENTS_WELL` | "What happened in the closest offset wells?" | `SimilarityEngine.get_historical_events` |
| `GENERAL_ANALYSIS` | "Show me the evidence behind this risk assessment." | `SimilarityEngine.analyze_well` |
| `UNKNOWN` | "What is the capital of France?" | Returns "NO EVIDENCE FOUND" |

## Data Sources
The chatbot relies entirely on the same real project data as the rest of the backend:
- `data/processed/volve_well_metadata.csv` (Provides the 26 real Volve wells)
- `data/processed/events.csv` (Provides the chronological hazard history)

## Hallucination Safeguards & Limitations

To ensure trust in high-stakes drilling operations, the chatbot is governed by strict rules:
1. **Fact vs. Inference:** The LLM is instructed to explicitly distinguish between facts found directly in the retrieved data and reasonable inferences.
2. **Unknown Domains:** If the user asks a question outside the domain of retrieved Volve project data (e.g., general knowledge), the LLM must explicitly state: *"The data does not contain enough evidence."*
3. **Risk V2 Limitations (No Probabilities):** Because the current Risk V2 model is not a validated predictive model, the chatbot is explicitly banned from returning predictive statements like *"92% probability of stuck pipe"* or *"The AI predicts a kick"*. 
4. **Deterministic Terminology:** The chatbot must refer to the Similarity Engine's output strictly as a **"Weighted Similarity Index (0-100)"**. It is not allowed to conflate this score with "confidence" or "probability."

## Current LLM Provider
Currently, the LLM provider is configured to use an abstract interface `LLMProvider`. Due to the absence of active API keys in the environment, a `DummyProvider` is utilized as the default. This allows the complete RAG retrieval layer to be fully functional and testable without requiring active API billing. The actual LLM integration (e.g., Google GenAI or OpenAI) can be swapped in seamlessly by subclassing `LLMProvider` once credentials are provided.

