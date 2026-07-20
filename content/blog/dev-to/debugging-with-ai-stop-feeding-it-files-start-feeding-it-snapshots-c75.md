---
title: "Debugging with AI: Stop Feeding It Files, Start Feeding It Snapshots"
slug: "debugging-with-ai-stop-feeding-it-files-start-feeding-it-snapshots-c75"
source: "https://dev.to/b1m0110/debugging-with-ai-stop-feeding-it-files-start-feeding-it-snapshots-c75"
published_at: "2026-06-08T20:17:10Z"
description: "AI coding agents are great at reading and understanding code. But debugging? That’s rarely just a..."
tags: ["typescript", "ai", "programming", "agentskills"]
---
AI coding agents are great at reading and understanding code. But debugging? That’s rarely just a code reading problem.

Most bugs surface because something at **runtime** didn’t behave: a request payload arrived in an unexpected shape, a condition took the wrong branch, a store dropped a field, or a queue handler mangled the data.

When that happens, the AI defaults to what it knows best (scanning files, Handlers, services, types, tests, helpers) It builds a theory from static text. Sometimes that works, but it’s slow, token-heavy, and noisy. The model is forced to *infer* runtime truth from source code alone, and it often gets it wrong.

**What if you could give the AI a clean, structured snapshot of the exact values that mattered?**

## The AI agent skill that makes debugging less guessy

That’s exactly why I built the [snaplog skill](https://github.com/KaiBelmo/snaplog).
Instead of asking your assistant to guess where the bug lives, the skill teaches it a tiny, repeatable workflow:

1. Describe the bug:
   “Actor, trigger, expected state, observed state.”
2. The AI identifies the likely boundary:
   For example, request input, branch decision, state transition, persistence write, or error path.
3. The AI adds one or two temporary `snaplog.injectLog()` calls:
   Only the variables that matter.
4. You reproduce the bug.
5. `snaplog` writes local structured logs:
   Usually under `.debug/debug.log` for Node.
6. The AI reads the snapshots and reasons from runtime facts:
   It no longer has to infer everything from static source code.
7. The temporary instrumentation gets removed.

This saves tokens because the AI gets a compact runtime artifact instead of repeatedly searching broad code paths.

## Under the hood: the library that makes it work

The skill itself is small on purpose. It works through a focused npm package: [`@kaibelmo/snaplog`](https://www.npmjs.com/package/@kaibelmo/snaplog).

It’s a local-first TypeScript runtime snapshot debugger that runs in Node.js, browsers, and browser extensions. Think of it as the sweet spot between messy `console.log` spam and a full-blown observability platform.

Here’s what using it looks like:

```ts
import { createSnaplogClient } from "@kaibelmo/snaplog";
import { createNodeSnaplogTransport } from "@kaibelmo/snaplog/node";

const snaplog = createSnaplogClient({
  runtime: "node",
  source: "checkout/applyDiscount",
  transport: createNodeSnaplogTransport(),
  serialize: {
    redactKeys: ["token", "password"]
  }
});

snaplog.injectLog({
  cart,
  discount,
  finalTotal,
  user
});
```

Run your reproduction steps, and you get clean, structured logs (default path `.debug/debug.log`):

```json
{
  "event": "snapshot",
  "variable": "finalTotal",
  "value": 89.99,
  "source": "checkout/applyDiscount",
  "timestamp": "..."
}
```

The library handles safe serialization, automatic redaction of sensitive keys, simple flow tracking, and multiple storage backends (file logs for Node, extension storage for browsers). It’s deliberately minimal, zero-dependency where possible, and gets out of your way once the bug is fixed.

## Why the skill and library work better together
With the `snaplog` skill, the AI isn’t adding random logs. It’s placing temporary snapshots at the exact points that matter, then reading the captured values directly.

Less code scanning. Fewer guesses. Faster debugging.

Instead of making the model imagine runtime state, you give it the facts.

```bash
npx skills add KaiBelmo/snaplog
```

Github repo: [github.com/KaiBelmo/snaplog](https://github.com/KaiBelmo/snaplog)  