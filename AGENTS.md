# CMZ Agent - Project Guidelines

## Overview

This project is managed by **CMZ (Cognitive Machine Zero)**, an advanced autonomous agent with self-healing, self-learning, and self-evolution capabilities.

## Agent Configuration

### Primary Agent: CMZ
- **Model**: opencode/kimi-k2.5-free
- **Fallback Models**: 
  - opencode/glm-4.7-free
  - opencode/minimax-m2.1-free
- **Capabilities**:
  - Self-healing: Automatically detects and fixes errors
  - Self-learning: Continuously improves from interactions
  - Self-evolution: Optimizes and modernizes code

### Supporting Agents
- **Architect**: Strategy and system design (glm-4.7-free)
- **Librarian**: Documentation and exploration (minimax-m2.1-free)
- **Reviewer**: Code review and QA (kimi-k2.5-free)

## Available Skills

The following skills are installed in `.opencode/skills/`:

1. **debugging-strategies** - Systematic debugging approaches
2. **git-commit-message** - Conventional commit message formatting
3. **skill-builder** - Creating new agent skills
4. **backend-models-standards** - Database model best practices
5. **systematic-debugging** - 4-phase debugging methodology
6. **moai-foundation-context** - Context window management
7. **memory-systems** - Agent memory implementation

## Project Structure

```
.opencode/
├── agent/
│   ├── cmz.yaml              # CMZ agent configuration
│   └── cmz/knowledge/        # Learning knowledge base
├── agents.yaml               # All agent definitions
├── config.json               # OpenCode configuration
├── oh-my-opencode.json       # Oh My OpenCode settings
├── skills/                   # Installed skills
└── supplements/              # Reference repositories
    ├── oh-my-opencode/
    ├── superpowers/
    └── AI-Agents-public/
```

## Workflow Guidelines

### Before Starting Work
1. Check the iterate.yml workflow logs for recent issues
2. Review the current knowledge base in `.opencode/agent/cmz/knowledge/`
3. Verify which skills are relevant to the task

### During Work
1. Follow existing project conventions and patterns
2. Use LSP tools for refactoring when possible
3. Run linting and type checking before finishing
4. Build clean, error-free code

### After Work
1. Update the knowledge base with learnings
2. Create or update PRs
3. Ensure branch is up to date with main
4. Monitor GitHub Actions for failures

## Anti-Patterns to Avoid

- ❌ Circular dependencies
- ❌ God classes
- ❌ Mixing presentation with business logic
- ❌ Breaking existing functionality
- ❌ Over-engineering

## Commands

### Linting
```bash
npm run lint
```

### Type Checking
```bash
npx tsc --noEmit
```

### Build
```bash
npm run build
```

## Resources

- **Supplemental Repos**: `.opencode/supplements/`
- **Agent Config**: `.opencode/agent/cmz.yaml`
- **Skills**: `.opencode/skills/`

---
*This file is maintained by CMZ agent. Last updated: 2026-02-13*
