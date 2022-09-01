# App builder core

This repository is a part of [RTE app builder](https://appbuilder.agora.io).

## Development instructions

1. Clone the repo

2. Navigate into project directory and run:
   ```
   npm run dev-setup -- meeting
   npm run dev-setup -- live-streaming
   npm run dev-setup -- voice-chat
   npm run dev-setup -- audio-livecast
   ```
   This command will automatically set everything up for development

To build react sdk using esbuild,

1. Install the go compiler from https://go.dev/doc/install
2. Run `go mod tidy` to download dependencies

You can now build react sdk using esbuild through npm script
