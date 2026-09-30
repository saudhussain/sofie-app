## Task description

Implement a web app that exposes a touch interface to control Sofie with.

The design/layout of the touch interface is up to you.

The touch interface should present a dynamic number of buttons, depending on what's available in Sofie.

The "actions" available in Sofie are of two types:

- "Global Adlibs" - these are tied to a Rundown - so after activating a Rundown, these _don't_ change depending on content.
- "Adlibs" - these are tied to what content is currently playing in Sofie.

You can listen to the Adlibs using the async-api exposed from the live-status-gateway".
You can invoke adlib actions by using Sofie's OpenApi.

### Technologies

Use these technologies for this project

- Node.js
- Typescript
- React

### Language

All code, including comments, variable names etc should be in English.
User-facing documentation, if any, can be in Norwegian.

### AI tools

AI tools are permitted. However, you must review all code before submitting and you must be able to explain the implemented functionality.

### Delivery

Delivery is a zip-file with the project, sent to ola.christian.gundelsby@nrk.no and andre.eldar.eide@nrk.no

To start the project, I should just run:

```bash
npm i # alternatively: `yarn`
npm run dev # starts a dev server
```

### Links and hints

Useful links:

- System documentation: https://sofie-automation.github.io/sofie-core
- Sofie source: https://github.com/Sofie-Automation/sofie-core
- Sofie's OpenApi docs: https://github.com/Sofie-Automation/sofie-core/blob/main/packages/openapi/api/actions.yaml
- Live-status-Gateway docs: https://github.com/Sofie-Automation/sofie-core/blob/main/packages/live-status-gateway-api/api/asyncapi.yaml
- Example client that communicates with Live-Status-Gateway AsyncApi: https://github.com/Sofie-Automation/sofie-core/blob/main/packages/live-status-gateway/sample-client/index.html

## Getting started:

Quick guide to setting up Sofie on your local computer.

### Prerequisites:

- Docker

### Setting up Sofie

- Use provided Docker compose file to spin up Sofie
  `docker compose up -d`
  ( Note that the live-status-gateway container is in restart-loop. That's ok at this point, and is resolved by uploading the snapshots in next step. )
- First, we'll populate Sofie with some data (settings, Rundowns):
  Goto http://localhost:3000/settings/tools/snapshots?admin=1

  - Upload two snapshots:
    - Upload system snapshot "system-snapshot.json"
    - Upload rundown snapshot "rundown-snapshot.json"

- Go to the Sofie home page: http://localhost:3000

  - There should be one Rundown in the list. Click to enter it.
  - To activate the Rundown, right click at the blue top top bar and select activate.
  - Then you want to Take the first Part to start playing it
    - Either right click on top and select Take
    - Or hit F12

- You can access the APIs:
  - Sofie OpenApi: http://localhost:3000/api/v1.0
  - Live Status Gateway Async API (websocket): http://localhost:8080
    (tip: use the example client linked above)

## Grading and evaluation

When evaluating your performance, we're typically looking at:

- Your technical understanding and ability to implement a technical solution.
- Your ability to learn and digest documentation about a new domain (in this case, the Sofie system).
- Your skills in picking tools to aid in accomplishing a task.
- Your ability to express and present a technical feature.
