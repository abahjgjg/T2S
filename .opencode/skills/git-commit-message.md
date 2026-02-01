---
name: "Git Commit Message"
description: "Standards and best practices for writing effective git commit messages. Use when committing code, reviewing commits, or establishing commit conventions."
---

# Git Commit Message Standards

## What This Skill Does

Establishes consistent, informative git commit message conventions that improve collaboration and code history readability.

## Commit Message Format

```
<type>: <subject>

<body>

<footer>
```

## Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, semicolons, etc.)
- **refactor**: Code refactoring
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **chore**: Build process or auxiliary tool changes

## Guidelines

### Subject Line
- Use imperative mood ("Add feature" not "Added feature")
- Keep under 50 characters
- Don't capitalize first letter
- No period at the end

### Body
- Explain what and why, not how
- Wrap at 72 characters
- Use bullet points for multiple changes
- Reference issues and PRs

### Examples

#### Good
```
feat: add user authentication

Implement JWT-based authentication system with:
- Login endpoint with email/password
- Token refresh mechanism
- Logout functionality

Closes #123
```

#### Bad
```
Added some stuff to the auth thing

I made changes to the login code and added some new 
features for users to log in better.
```

## Best Practices

1. **Atomic Commits**: One logical change per commit
2. **Clear Intent**: Message explains the purpose
3. **Context**: Link to relevant issues/PRs
4. **Consistency**: Follow team conventions
5. **Review Ready**: Messages should help code review
