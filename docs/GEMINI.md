

# Gemini Integration Notes

## Models Used
- `gemini-2.5-flash`: Used for high-speed trend research (with Search Grounding), initial idea generation, competitor analysis (Search Grounding), and **Location Scout (Maps Grounding)**.
- `gemini-3-pro-preview`: Used for deep reasoning required to generate the detailed blueprint.
- `gemini-2.5-flash-preview-tts`: Used for generating audio summaries of the blueprint.
- `gemini-2.5-flash-native-audio-preview-09-2025`: Used for live pitch practice (WebSocket PCM streaming).
- `veo-3.1-fast-generate-preview`: Used for generating 720p marketing teaser videos.

## Prompt Engineering
- **JSON Mode**: We explicitly ask for JSON schemas.
- **Grounding**: 
  - **Search Grounding**: Enabled for the initial trend search to ensure data recency via Google Search.
  - **Maps Grounding**: Enabled for the "Location Scout" feature to find physical places and competitors. We extract `groundingChunks` (specifically `maps` type) to display places.
- **Thinking Config**: Enabled for `gemini-3-pro-preview` in the `generateSystemBlueprint` function.
  - **Budget**: Set to `10240` tokens.
  - **Purpose**: Allows the model to reason through technical feasibility, market risks, and financial projections before generating the structured JSON output.

## Audio Capabilities
- Uses `gemini-2.5-flash-preview-tts` for text-to-speech.
- **Format**: Returns raw PCM audio (Int16, 24kHz) which is decoded client-side using `AudioContext`.
- **Latency**: Text is truncated to first 500 chars to ensure fast playback start.

## Video Capabilities (Veo)
- **Model**: `veo-3.1-fast-generate-preview`.
- **Implementation**:
  - Uses `ai.models.generateVideos` and polls via `ai.operations.getVideosOperation`.
  - **Key Requirement**: Users must select a specific paid API key via `window.aistudio.openSelectKey()` for billing purposes.
  - **Output**: 720p, 16:9 MP4 video. Displayed directly via `data:` URI or Object URL.

## Future Optimizations
- Explore `thinkingConfig` for `gemini-2.5-flash` for idea generation if higher quality brainstorming is needed, though latency is a concern there.