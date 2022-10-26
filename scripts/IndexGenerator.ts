/**
 * Generates index files
 *
 * --in - path to input directory
 * --out - path to input directory
 **/
import {AbstractScript} from "./AbstractScript";

class IndexGenerator extends AbstractScript
{
    private input: string;
    private output: string;

    public constructor()
    {
        super();

        if (!this.args["in"])
        {
            this.logger.error("Path to input directory is not specified! Define it as flag --in=path_to_dir...");
            this.exit(1);
        }

        if (!this.args["out"])
        {
            this.logger.error("Path to output directory is not specified! Define it as flag --out=path_to_dir...");
            this.exit(1);
        }

        this.input = this.workingDirectory + this.args["in"];
        this.output = this.workingDirectory + this.args["out"];

        this.generate();
    }

    private generate(): void
    {
        let result = "";

        this.getFilePathList(this.input).map(value =>
        {
            let path = value.path.replace(this.workingDirectory + "/src", ".");
            path = path.substring(0, path.length - 3);

            const line = "export * from \"" + path + "\";";
            this.logger.info(line);

            result += line + "\n";
        });

        this.logger.warn("Saving to file:", this.output);
        this.fs.writeFileSync(this.output, result);
    }
}

new IndexGenerator();