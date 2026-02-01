---
name: "Context Engineering Memory Systems"
description: "Advanced techniques for context engineering and memory management in AI agents. Use when optimizing agent context windows, implementing memory systems, or managing long-term state."
---

# Context Engineering Memory Systems

## What This Skill Does

Provides strategies for effective context management and memory system design to maximize agent performance and coherence.

## Core Concepts

### Context Windows
- Understanding token limits
- Prioritizing relevant information
- Pruning unnecessary context
- Chunking strategies

### Memory Types
1. **Short-term Memory**
   - Conversation history
   - Recent actions
   - Temporary state

2. **Long-term Memory**
   - Persistent knowledge
   - Learned patterns
   - User preferences

3. **Working Memory**
   - Active task context
   - Current goals
   - Intermediate results

## Implementation Strategies

### Context Compression
```python
# Summarize long contexts
summary = compress_context(long_text, max_tokens=1000)

# Selective retention
important_facts = extract_key_points(conversation)
```

### Memory Hierarchies
- Episodic memory (events)
- Semantic memory (facts)
- Procedural memory (skills)

### Retrieval Augmentation
- Vector stores for similarity search
- Keyword indexing
- Hybrid retrieval methods
- Context ranking algorithms

## Best Practices

1. **Regular Cleanup**
   - Remove stale information
   - Consolidate related facts
   - Archive old conversations

2. **Priority Management**
   - Tag information by importance
   - Implement forgetting mechanisms
   - Balance breadth vs depth

3. **State Persistence**
   - Save checkpoints
   - Implement recovery mechanisms
   - Handle interruptions gracefully
