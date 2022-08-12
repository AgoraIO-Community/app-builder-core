package main

import (
	"fmt"
	"log"

	"github.com/evanw/esbuild/pkg/api"
	"github.com/mitchellh/copystructure"
)

func wsdk(iopath *ioPaths) []api.BuildResult {
	commonBuildOpts := common(iopath)
	partialWsdkBuildOpts := api.BuildOptions{
		// build options common to wsdk and other components
		Plugins:           commonBuildOpts.Plugins,
		ResolveExtensions: commonBuildOpts.ResolveExtensions,
		Loader:            commonBuildOpts.Loader,
		Define:            commonBuildOpts.Define,
		Inject:            commonBuildOpts.Inject,

		// other esbuild options
		Write:  true,
		Bundle: true,
		// MinifyWhitespace:  true,
		// MinifyIdentifiers: true,
		// MinifySyntax:      true,

		// debug options. does not affect bundle size
		// Metafile: true,

		EntryPoints: []string{"./index.wsdk.tsx"},
	}

	var wsdk []api.BuildResult
	wsdkTargets := []api.Format{api.FormatCommonJS, api.FormatIIFE, api.FormatESModule}
	for _, t := range wsdkTargets {
		buildOpts, err := copystructure.Copy(partialWsdkBuildOpts)
		if err != nil {
			log.Fatalln("could not configure build options for websdk", err)
		}
		wsdkBuildOpts := buildOpts.(api.BuildOptions)
		var target string
		switch t {
		case api.FormatCommonJS:
			target = "commonjs2"
		case api.FormatIIFE:
			target = "var"
			wsdkBuildOpts.GlobalName = "AgoraAppBuilder"
		case api.FormatESModule:
			target = "esm"
		}
		wsdkBuildOpts.Format = t
		wsdkBuildOpts.Outfile = fmt.Sprintf("%s/app-builder-web-sdk.%s.js", iopath.outPath, target)
		wsdk = append(wsdk, api.Build(wsdkBuildOpts))
	}

	return wsdk
}
