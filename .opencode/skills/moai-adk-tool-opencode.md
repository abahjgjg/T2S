---
name: "MOAI ADK Tool OpenCode"
description: "Integration guide for MOAI ADK tools with OpenCode CLI. Use when setting up MOAI tools, configuring agent workflows, or integrating external toolchains."
---

# MOAI ADK Tool OpenCode

## What This Skill Does

Facilitates the integration of MOAI (Modular Open AI) ADK tools with OpenCode CLI for enhanced agent capabilities and tool orchestration.

## Prerequisites

- OpenCode CLI installed
- MOAI ADK toolkit
- Basic understanding of agent-tool interactions

## Quick Start

### Installation
```bash
# Install MOAI ADK
npm install @modu/ai-moai-adk

# Configure with OpenCode
opencode config set moai.enabled true
```

### Basic Usage
```javascript
// Register MOAI tool
import { MOAITool } from '@modu/ai-moai-adk';

const tool = new MOAITool({
  name: 'data-processor',
  handler: async (input) => {
    // Process data
    return result;
  }
});
```

## Configuration

### Tool Registration
- Define tool schemas
- Set up authentication
- Configure timeouts
- Enable logging

### Agent Integration
- Map tools to agent capabilities
- Set up tool chains
- Configure error handling
- Implement fallbacks
