# Project workflow

## Completion response

After implementing a feature, fix, or other requested project change:

1. Briefly explain what changed and report relevant validation, including any checks that failed or could not run.
2. Provide a commit message the user can copy and paste. Put the title and description together in a single fenced `text` block, separated by a blank line. Keep explanations and validation results outside this block unless they are useful commit context.
3. Suggest the most useful next feature or improvement, with a brief reason based on the current project. Treat it as a suggestion; implement it only when requested.

## Commit message format

- Use a concise, imperative title with a Conventional Commit prefix such as `feat:`, `fix:`, `style:`, `refactor:`, or `docs:`.
- In the description, explain the concrete changes and their purpose. Use short paragraphs or bullets as appropriate.
- Describe only changes made for the completed task. Do not include unrelated existing changes or claim checks passed when they did not.
- Provide the message without running `git commit` unless the user asks to commit.

Example:

```text
style: add pointer cursors to buttons and links

Apply the shared cursor-pointer style to buttons and anchor links so
interactive controls display a consistent cursor across the app.
```
