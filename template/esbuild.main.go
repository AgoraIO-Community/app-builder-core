package main

import (
	"flag"
	"log"

	"github.com/davecgh/go-spew/spew"
	"github.com/evanw/esbuild/pkg/api"
)

func main() {
	buildType := flag.String("buildtype", "", "rsdk|wsdk|web")
	outPath := flag.String("outpath", "../Builds/react-sdk/index.js", "path to write bundled js file")
	configTransformerPath := flag.String("configtransformerpath", "./esbuildConfigTransform.js", "path to inject file")
	flag.Parse()

	iopath := &ioPaths{
		outPath:               *outPath,
		configTransformerPath: *configTransformerPath,
	}
	log.Println("esbuild args = ", *buildType, *outPath, *configTransformerPath)

	var res api.BuildResult
	switch *buildType {
	case "rsdk":
		res = rsdk(iopath)
	case "wsdk":
		res := wsdk(iopath)
		for _, e := range res {
			if len(e.Errors) > 0 {
				spew.Dump(e)
				log.Fatalln("build failed")
			}
		}
		return
	case "web":
		res = web(iopath)
	default:
		log.Fatalln("unsupported build type", *buildType)
	}
	if len(res.Errors) > 0 {
		spew.Dump(res)
		log.Fatalln("build failed")
	}

	// text := api.AnalyzeMetafile(rsdkRes.Metafile, api.AnalyzeMetafileOptions{Verbose: false})
	// log.Printf("%s", text)
}
