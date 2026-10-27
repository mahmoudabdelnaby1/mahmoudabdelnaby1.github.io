# Meta Marketing API Change Review

Use an official-source-first checklist to assess API changes against the fields and workflows your integration actually uses.

## When to use it
Use this workflow when reviewing a Meta API version change or preparing a release that depends on Marketing API behavior.

## What you need
Current official changelog; API versions in use; endpoint and field inventory; test account; integration owner; rollback plan.

## Workflow
1. Read the current official changelog and record its publication date.
2. Search the integration for affected endpoints, fields, permissions, and assumptions.
3. Map each change to an owner, severity, test case, and deadline.
4. Run tests in a non-production environment and compare expected payloads.
5. Document rollout, monitoring, fallback, and rollback before release.

## Practical output
A version-impact register and release QA checklist tied to official documentation.

## Scope and limits
This page does not assert a current API version or enumerate current deprecations. Recheck Meta's official developer documentation before every use.
