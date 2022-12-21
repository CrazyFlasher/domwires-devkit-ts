import {build} from "esbuild";
import NodeModulesPolyfills from '@esbuild-plugins/node-modules-polyfill';
import GlobalsPolyfills from '@esbuild-plugins/node-globals-polyfill';
import fs from "fs";

class Build
{
    private static readonly BASE: string = "./example/client";
    private static readonly DIST: string = Build.BASE + "../../../dist_client";

    public constructor()
    {
        build({
                plugins: [NodeModulesPolyfills(), GlobalsPolyfills({process: true, buffer: true})],
                entryPoints: [
                    Build.BASE + '/SampleClientApp.ts',
                ],
                outfile: Build.DIST + "/main.js",
                bundle: true,
                loader: {".ts": "ts"}
            }
        ).then(() => console.log("⚡ Done")).catch(() => process.exit(1));

        fs.rmSync(Build.DIST, {recursive: true, force: true});
        fs.mkdirSync(Build.DIST);

        this.toDist(Build.BASE + "/dev.json", "dev.json");
        this.toDist(Build.BASE + "/index.html", "index.html");
    }

    private toDist(input: string, file?: string): void
    {
        fs.copyFileSync(input, Build.DIST + (file ? "/" + file : ""));
    }
}

new Build();