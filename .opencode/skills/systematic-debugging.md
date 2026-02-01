---
name: "Systematic Debugging"
description: "Systematic approach to debugging software issues with structured methodologies and tools. Use when investigating bugs, performance issues, or system failures."
---

# Systematic Debugging

## What This Skill Does

Provides a structured, methodical approach to debugging that eliminates guesswork and ensures thorough problem resolution.

## The Debugging Process

### Phase 1: Reproduction
1. **Consistent Reproduction**
   - Find the minimal steps to reproduce
   - Document exact conditions
   - Identify triggers and patterns

2. **Environment Isolation**
   - Check if issue is environment-specific
   - Test in clean environment
   - Verify dependencies

### Phase 2: Investigation
1. **Information Gathering**
   - Collect error messages
   - Review logs
   - Check recent changes

2. **Hypothesis Formation**
   - List possible causes
   - Rank by probability
   - Form testable hypotheses

### Phase 3: Testing
1. **Hypothesis Testing**
   - Test one hypothesis at a time
   - Document results
   - Rule out impossible causes

2. **Isolation Techniques**
   - Binary search debugging
   - Comment out code sections
   - Use debuggers effectively

### Phase 4: Resolution
1. **Implement Fix**
   - Make minimal changes
   - Follow coding standards
   - Add regression tests

2. **Verify Solution**
   - Confirm fix works
   - Test edge cases
   - Ensure no regressions

## Debugging Tools

### Console/Logging
```javascript
// Strategic logging
console.log('DEBUG: Value at point A:', value);
console.trace('Stack trace at error point');
console.table(dataArray);
```

### Debugger Usage
- Set breakpoints strategically
- Use conditional breakpoints
- Inspect call stacks
- Watch variable changes

### Performance Debugging
- Profile code execution
- Identify bottlenecks
- Memory leak detection
- Network request analysis
