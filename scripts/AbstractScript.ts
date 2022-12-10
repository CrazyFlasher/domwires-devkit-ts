import "reflect-metadata";
import {Logger, LogLevel} from "domwires";

export abstract class AbstractScript
{
    protected readonly fs = require('fs');
    protected readonly os = require('os');
    private readonly m = require('minimist');
    protected readonly args = this.m(process.argv.slice(2));
    protected readonly workingDirectory = process.cwd();
    protected readonly logger = new Logger(LogLevel.VERBOSE);

    protected getFilePathList(path: string, subDirs = true): { name: string; path: string } []
    {
        let filePaths: { name: string; path: string }[] = [];

        if (this.fs.existsSync(path) && this.fs.lstatSync(path).isDirectory())
        {
            const dir = this.fs.opendirSync(path);
            let dirent;
            while ((dirent = dir.readSync()) !== null)
            {
                const fileName = dirent.name;
                const p = path + "/" + fileName;
                if (this.fs.lstatSync(p).isDirectory())
                {
                    if (subDirs)
                    {
                        filePaths = filePaths.concat(this.getFilePathList(p));
                    }
                }
                else
                {
                    if (fileName.substring(fileName.length - 3) == ".ts")
                    {
                        filePaths.push({name: fileName, path: p});
                    }
                }
            }
            dir.closeSync();
        }

        return filePaths;
    }

    protected exit(code = 0): void
    {
        process.exit(code);
    }
}