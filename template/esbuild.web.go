package main

import "github.com/evanw/esbuild/pkg/api"

func web(iopath *ioPaths) api.BuildResult {
	commonBuildOpts := common(iopath)
	webBuildOpts := api.BuildOptions{
		// build options common to wsdk and other components
		Plugins:           commonBuildOpts.Plugins,
		ResolveExtensions: commonBuildOpts.ResolveExtensions,
		Loader:            commonBuildOpts.Loader,
	}

	web := api.Build(webBuildOpts)
	return web
}
