<p align="center">
<img src="https://raw.githubusercontent.com/Nexirift/media-kit/main/nexirift/banner.svg" width="600" />
</p>

# Better Auth Plugins

This is a collection of plugins for [Better Auth](https://github.com/better-auth/better-auth) that were built by Nexirift with the intention of being used with [Cosmos](https://github.com/Nexirift/cosmos).

## Building

### Prerequisites

- Node.js v22.13.0 or greater
- Bun v1.2.2 or greater
- Local NPM registry


### Local NPM Registry

Our internal packages are not hosted on the public NPM registry, such as `@nexirift/db`. To use our internal projects, you will need to set up a local NPM registry. During our testing, we noticed that Next.js and shadcn/ui don't like Bun's linked packages.

1. Install Verdaccio: `bun i -g verdaccio`
2. Start the Verdaccio server locally: `verdaccio`
3. Create an account: `bunx npm adduser --registry http://localhost:4873`
    - Example: `developer` | `P@ssw0rd` | `developer@nexirift.com`
4. Clone any `@nexirift/*` packages using Git
5. Run `bun publish` on the cloned repositories

*More information: https://verdaccio.org/docs/setup-bun*

### Installation

1. Clone this repository: `git clone https://github.com/Nexirift/better-auth-plugins.git`
2. Install dependencies with `bun install`
3. Build the source code using `bun run build`
