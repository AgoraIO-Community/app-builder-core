package main

import "github.com/evanw/esbuild/pkg/api"

func rsdk(iopath *ioPaths) api.BuildResult {
	commonBuildOpts := common(iopath)
	rsdkBuildOpts := api.BuildOptions{
		// build options common to rsdk and other components
		Plugins:           commonBuildOpts.Plugins,
		ResolveExtensions: commonBuildOpts.ResolveExtensions,
		Loader:            commonBuildOpts.Loader,
		Define:            commonBuildOpts.Define,
		Inject:            commonBuildOpts.Inject,

		// other esbuild options
		Write:             true,
		Bundle:            true,
		MinifyWhitespace:  true,
		MinifyIdentifiers: true,
		MinifySyntax:      true,

		// debug options. does not affect bundle size
		// Metafile: true,

		// rsdk specific build options
		EntryPoints: []string{"./index.rsdk.tsx"},
		External: []string{
			"react",
			"react-dom",
			"react-router",
			"react-router-dom",
			"@apollo/client",
		},

		// target es6 because other host applications typically do not transpile node_modules
		// i.e. they will not transpile agora-app-builder-sdk
		Target: api.Target(api.ES2015),

		// bundle in cjs format because this index.js is meant to be used by other host applications
		// like webpack which runs on node
		Format:  api.FormatCommonJS,
		Outfile: iopath.outPath,
	}

	rsdk := api.Build(rsdkBuildOpts)
	return rsdk
}
