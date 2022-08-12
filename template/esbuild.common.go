package main

import (
	"log"
	"os"
	"path/filepath"

	"github.com/evanw/esbuild/pkg/api"
)

type ioPaths struct {
	outPath               string
	configTransformerPath string
}

func commonAliasResolver() api.Plugin {
	aliasResolvers := api.Plugin{
		Name: "importAliases",
		Setup: func(pb api.PluginBuild) {
			pb.OnResolve(api.OnResolveOptions{Filter: "react-native$"},
				func(args api.OnResolveArgs) (api.OnResolveResult, error) {
					path, err := filepath.Abs("./node_modules/react-native-web/dist/cjs/index.js")
					if err != nil {
						log.Fatalln(err)
					}
					return api.OnResolveResult{Path: path}, nil
				},
			)

			// Using rtm bridge to translate React Native RTM SDK calls to web SDK calls
			pb.OnResolve(api.OnResolveOptions{Filter: "agora-react-native-rtm$"},
				func(args api.OnResolveArgs) (api.OnResolveResult, error) {
					path, err := filepath.Abs("./bridge/rtm/web/index.ts")
					if err != nil {
						log.Fatalln(err)
					}
					return api.OnResolveResult{Path: path}, nil
				},
			)

			// Using rtc bridge to translate React Native RTC SDK calls to web SDK calls for web and linux
			// Using rtc bridge to translate React Native RTC SDK calls to electron SDK calls for windows and mac
			pb.OnResolve(api.OnResolveOptions{Filter: "react-native-agora$"},
				func(args api.OnResolveArgs) (api.OnResolveResult, error) {
					path, err := filepath.Abs("./bridge/rtc/webNg/index.ts")
					if err != nil {
						log.Fatalln(err)
					}
					return api.OnResolveResult{Path: path}, nil
				},
			)

			pb.OnResolve(api.OnResolveOptions{Filter: "fpe-api/install"},
				func(args api.OnResolveArgs) (api.OnResolveResult, error) {
					path, err := filepath.Abs("./fpe-api/install.ts")
					if err != nil {
						log.Fatalln(err)
					}
					return api.OnResolveResult{Path: path}, nil
				},
			)

			pb.OnResolve(api.OnResolveOptions{Filter: "fpe-api"},
				func(args api.OnResolveArgs) (api.OnResolveResult, error) {
					path, err := filepath.Abs("./fpe-api/index.ts")
					if err != nil {
						log.Fatalln(err)
					}
					return api.OnResolveResult{Path: path}, nil
				},
			)

			pb.OnResolve(api.OnResolveOptions{Filter: "fpe-implementation"},
				func(args api.OnResolveArgs) (api.OnResolveResult, error) {
					path, err := filepath.Abs("./fpe-implementation/index.ts")
					if err != nil {
						log.Fatalln(err)
					}
					return api.OnResolveResult{Path: path}, nil
				},
			)

			pb.OnResolve(api.OnResolveOptions{Filter: "test-fpe"},
				func(args api.OnResolveArgs) (api.OnResolveResult, error) {
					fpePath, err := filepath.Abs("./test-fpe/index.ts")
					if err != nil {
						log.Fatalln(err)
					}
					fpeDummyPath, err := filepath.Abs("./fpe-implementation/dummyFpe.ts")
					if err != nil {
						log.Fatalln(err)
					}

					_, err = os.Stat(fpePath)
					if err != nil {
						return api.OnResolveResult{Path: fpeDummyPath}, nil
					}

					return api.OnResolveResult{Path: fpePath}, nil
				},
			)

			pb.OnResolve(api.OnResolveOptions{Filter: "agora-react-native-rtm/lib/typescript/src"},
				func(args api.OnResolveArgs) (api.OnResolveResult, error) {
					path, err := filepath.Abs("./bridge/rtm/web/index.ts")
					if err != nil {
						log.Fatalln(err)
					}
					return api.OnResolveResult{Path: path}, nil
				},
			)
		},
	}

	return aliasResolvers
}

func commonResolveExtensions() []string {
	// Adds platform specific extensions and OS specific extensions
	// .web.tsx works for web specific code
	resolveExtensions := []string{
		".rsdk.tsx",
		".rsdk.ts",
		".sdk.ts",
		".sdk.tsx",
		".web.ts",
		".web.tsx",
		".tsx",
		".ts",
		".jsx",
		".js",
		".node",
	}

	return resolveExtensions
}

func commonLoader() map[string]api.Loader {
	loader := map[string]api.Loader{
		// since esbuild targets latest js by default we dont need plugins that
		// convert optional chaining and class properties (node 16.11.0+ has both features)

		// use sx loaders for js|ts files as well
		".js":  api.LoaderTSX,
		".jsx": api.LoaderTSX,
		".ts":  api.LoaderTSX,
		".tsx": api.LoaderTSX,

		// todo: might need to deal with non-lowercase extensions for these media files
		".png":  api.LoaderDataURL,
		".jpg":  api.LoaderDataURL,
		".jpeg": api.LoaderDataURL,
		".gif":  api.LoaderDataURL,
	}

	return loader
}

func common(iopath *ioPaths) api.BuildOptions {
	commonBuildOpts := api.BuildOptions{
		// we can safely ignore (webpack) plugins for now because they seem to be used only for not reactsdk

		Plugins:           []api.Plugin{commonAliasResolver()},
		ResolveExtensions: commonResolveExtensions(),
		Loader:            commonLoader(),

		// embed config variables values into the code
		Define: map[string]string{
			"$config": "config",
		},
		Inject: []string{iopath.configTransformerPath},
	}

	return commonBuildOpts
}
