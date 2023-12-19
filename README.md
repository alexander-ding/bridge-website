# Bridge Website

This repository houses the source of the [demo website](https://alexding.me/bridge) hosted using [Bridge](https://github.com/alexander-ding/bridge), an RFC-compliant IP/TCP/HTTP implementation in Rust.
The template is a fork of [my personal website](https://alexding.me), though it is not officially a fork on GitHub as the two repositories are housed under the same account.

## Development Guide

Ensure you have [pnpm](https://pnpm.io/) or install it with [these instructions](https://pnpm.io/installation).

Clone the repository and install dependencies.

```bash
git clone https://github.com/alexander-ding/alexding.me
cd alexding.me && pnpm install
```

Besides downloading Node packages, this also sets up [Husky](https://typicode.github.io/husky/#/) git hooks to automatically [lint staged files](https://github.com/okonet/lint-staged) when creating commits.

To spin up a development server, run

```bash
pnpm dev
```

To create a production build locally, run

```bash
pnpm build
```

To serve the local builds, run

```bash
npx serve dist
```
