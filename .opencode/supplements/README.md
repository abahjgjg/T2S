# Supplemental Repositories for CMZ Agent

This directory manages supplemental repositories that enhance the CMZ agent's capabilities.
Each repository is cloned as a reference/study material without interfering with the main workspace.

## Repository List

1. **oh-my-opencode** - Agent harness and orchestration
   - URL: https://github.com/code-yeongyu/oh-my-opencode.git
   - Purpose: Study agent orchestration patterns
   
2. **opencode-antigravity-auth** - Authentication patterns
   - URL: https://github.com/NoeFabris/opencode-antigravity-auth.git
   - Purpose: Security and auth best practices
   
3. **AI-Agents-public** - Shared skills and frameworks
   - URL: https://github.com/vasilyu1983/AI-Agents-public.git
   - Purpose: Skill templates and git commit message patterns
   
4. **superpowers** - Development superpowers
   - URL: https://github.com/obra/superpowers.git
   - Purpose: Systematic debugging and development workflows
   
5. **system_prompts_leaks** - Prompt engineering insights
   - URL: https://github.com/asgeirtj/system_prompts_leaks.git
   - Purpose: Study effective prompt patterns
   
6. **UltraRAG** - RAG framework
   - URL: https://github.com/OpenBMB/UltraRAG.git
   - Purpose: Advanced RAG implementations

## Usage Guidelines

- These repositories are for REFERENCE ONLY
- Do not modify files in these directories
- Use them to learn patterns and best practices
- Integrate learnings into the main CMZ agent configuration
- Run `git pull` periodically to update references

## Integration Notes

All supplemental repositories have been analyzed and integrated into CMZ:
- Agent patterns from oh-my-opencode → agents.yaml
- Debugging strategies from superpowers → skills/
- Git commit patterns → vasilyu1983-ai-agents-public-git-commit-message skill
- Memory systems → muratcankoylan memory-systems skill
