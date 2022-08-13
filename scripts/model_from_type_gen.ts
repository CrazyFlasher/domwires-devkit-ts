/**
 * Generates DomWires compatible models from types.
 * Will search for all types marked with @Model metatag and generate class, interfaces and enum.
 * See unit test ModelFromTypeGen.
 * Usage: ts-node ./scripts/ModelFromTypeGen.ts --in=path to input folder --templatesPath=path_to_templates
 *
 * --in - path to input directory
 * --overwrite - overwrite existing files (optional)
 * --verbose - extended logs (optional)
 **/

class ModelFromTypeGen
{
    private modelTemplate: string;
    private iModelTemplate: string;
    private iModelImmutableTemplate: string;
    private modelMessageTypeTemplate: string;

    private getterTemplate: string;
    private setterTemplate: string;

    private modelName: string;

    private readonly input: string;
    private readonly templatesPath: string;
    private output: string;
    private readonly overwrite: boolean;
    private readonly verbose: boolean;

    private enumValueList: Array<string>;
    private typedefFile: string;
    private typeDefFileName: string;
    private hasErrors = false;

    private readonly workingDirectory: string;

    private fs = require('fs');
    private minimist = require('minimist');
    private os = require('os');

    private suffix: string;
    private typeDefImports: string;
    private readonly relatedImportPath: string;
    private importBaseFrom: string;

    public constructor()
    {
        const args = this.minimist(process.argv.slice(2));

        this.workingDirectory = process.cwd();

        if (!args["in"])
        {
            console.info("Path to input directory is not specified!");
            console.info("Define it as flag --in=path_to_dir...");
            process.exit(1);
        }
        if (!args["templatesPath"])
        {
            console.info("Path to templates directory is not specified!");
            console.info("Define it as flag --templatesPath=path_to_templates...");
            process.exit(1);
        }
        if (args["relatedImportPath"])
        {
            this.relatedImportPath = args["relatedImportPath"];
            console.info("Replace import path from type file to: " + this.relatedImportPath);
        }

        this.templatesPath = this.workingDirectory + args["templatesPath"];
        this.input = this.workingDirectory + args["in"];
        this.overwrite = args["overwrite"];
        this.verbose = args["verbose"];

        this.loadTemplate();
        this.convertDir(this.input);
    }

    private loadTemplate(): void
    {
        this.modelTemplate = this.fs.readFileSync(this.templatesPath + "/ModelTemplate").toString();
        this.iModelTemplate = this.fs.readFileSync(this.templatesPath + "/IModelTemplate").toString();
        this.iModelImmutableTemplate = this.fs.readFileSync(this.templatesPath + "/IModelImmutableTemplate").toString();
        this.modelMessageTypeTemplate = this.fs.readFileSync(this.templatesPath + "/ModelMessageTypeTemplate").toString();
        this.getterTemplate = this.fs.readFileSync(this.templatesPath + "/GetterTemplate").toString();
        this.setterTemplate = this.fs.readFileSync(this.templatesPath + "/SetterTemplate").toString();

        if (this.verbose)
        {
            this.traceTemplate("ModelTemplate", this.modelTemplate);
            this.traceTemplate("IModelTemplate", this.iModelTemplate);
            this.traceTemplate("IModelImmutableTemplate", this.iModelImmutableTemplate);
            this.traceTemplate("ModelMessageTypeTemplate", this.modelMessageTypeTemplate);
            this.traceTemplate("GetterTemplate", this.getterTemplate);
            this.traceTemplate("SetterTemplate", this.setterTemplate);
        }
    }

    private traceTemplate(name: string, content: string): void
    {
        console.info(this.sep() + "-------------- " + name + "--------------");
        console.info(this.sep() + content);
    }

    private convertDir(path: string): void
    {
        if (this.fs.existsSync(path) && this.fs.lstatSync(path).isDirectory())
        {
            const dir = this.fs.opendirSync(path);
            let dirent;
            while ((dirent = dir.readSync()) !== null)
            {
                const fileName = dirent.name;
                const p: string = path + "/" + fileName;
                if (this.fs.lstatSync(p).isDirectory())
                {
                    this.convertDir(p);
                }
                else
                {
                    if (fileName.substr(fileName.length - 3) == ".ts")
                    {
                        this.convertFile(p, fileName);
                    }
                }
            }
            dir.closeSync();
        }
    }

    private convertFile(path: string, fileName: string): void
    {
        this.typedefFile = this.fs.readFileSync(path).toString();

        this.typeDefFileName = fileName;

        this.typedefFile = this.removeAllEmptySpace(this.typedefFile);

        if (this.typedefFile.split("/* @Model */ export type ").length == 2)
        {
            this.typeDefImports = "";

            this.populateTypeDefImports();
            this.findSuffix();

            this.output = path.split(fileName)[0];

            console.info("Generate model from type: " + fileName);

            if (this.verbose)
            {
                console.info(this.sep() + this.typedefFile);
            }

            this.enumValueList = [];

            this.create(true);
            this.create(false);
        }
    }

    private findSuffix(): void
    {
        this.suffix = "Model";
        this.importBaseFrom = "domwires";

        const suffixArr: string[] = this.typedefFile.split("/*@Suffix=");
        if (suffixArr.length > 1)
        {
            this.suffix = suffixArr[1].slice(0, suffixArr[1].indexOf("*/"));
            this.importBaseFrom = "../I" + this.suffix;
            this.typedefFile = this.typedefFile.split("/*@Suffix=" + this.suffix + "*/").join("");

            console.info("SUFFIX: " + this.suffix);
        }
    }

    private create(isBase: boolean): void
    {
        this.save(this.generate(ObjectType.Immutable, isBase), isBase, false, false);
        this.save(this.generate(ObjectType.Mutable, isBase), isBase, false);
        this.save(this.generate(ObjectType.Class, isBase), isBase, false);
        if (!isBase) this.save(this.generate(ObjectType.Enum, isBase), isBase, true);
    }

    private save(result: OutData, isBase = false, isEnum = false, append = true): void
    {
        const overwrite: boolean = this.overwrite || isBase;

        if (this.hasErrors)
        {
            process.exit(1);
        }

        const dirName: string = this.output + this.getNewPackageName(this.typeDefFileName);

        const outputFile: string = dirName + "/" + result.fileName + ".ts";

        this.fs.mkdirSync(dirName, {recursive: true});

        let canSave = true;

        if (this.fs.existsSync(outputFile))
        {
            canSave = overwrite;

            if (!overwrite)
            {
                if (isEnum)
                {
                    canSave = true;

                    let body: string = this.fs.readFileSync(outputFile).toString();
                    body = this.removeAllEmptySpace(body);

                    let content: string = body.substring(body.indexOf("{") + 1, body.indexOf("}"));
                    let valueList: Array<string> = content.split(";");
                    if (valueList.length > 0) valueList.pop();
                    valueList = this.removeDuplicates(valueList.concat(this.enumValueList));

                    content = "";

                    for (const value of valueList)
                    {
                        content += (valueList.indexOf(value) != 0 ? this.tab() : "") + value + ";" + this.sep();
                    }

                    result.data = this.removeEmptyLines(this.modelMessageTypeTemplate
                        .split("${model_name}").join(this.modelName)
                        .split("${content}").join(content));

                    if (this.verbose)
                    {
                        console.info("Existing enum values: " + content);
                    }
                }
                else
                {
                    console.info("'" + outputFile + "' already exists. Use --overwrite to overwrite existing files...");
                }
            }
        }

        if (canSave)
        {
            if (!append)
            {
                this.fs.writeFileSync(outputFile, result.data);
            }
            else
            {
                this.fs.appendFileSync(outputFile, this.sep(2) + result.data);
            }

            if (this.verbose)
            {
                console.info("Output file: " + outputFile);
                console.info(this.sep() + result.data);
            }
        }
    }

    private generate(type: number, isBase = false): OutData
    {
        let template: string = null;

        if (type == ObjectType.Enum)
        {
            template = this.modelMessageTypeTemplate;
        }
        else if (type == ObjectType.Class)
        {
            template = this.modelTemplate;
        }
        else if (type == ObjectType.Mutable)
        {
            template = this.iModelTemplate;
        }
        else if (type == ObjectType.Immutable)
        {
            template = this.iModelImmutableTemplate;
        }

        const equalSplit: Array<string> = this.typedefFile.split("=");
        const typeDefSplit: Array<string> = this.typedefFile.split("/* @Model */ export type ");
        const ampersandSplit: Array<string> = this.typedefFile.split("&");

        if (ampersandSplit.length > 2)
        {
            console.info("Error: only single inheritance in supported: " + this.typeDefFileName);
            this.hasErrors = true;
        }
        if (typeDefSplit.length != 2)
        {
            console.info("Error: type is missing in: " + this.typeDefFileName);
            this.hasErrors = true;
        }

        const typeDefName: string = typeDefSplit[1].split("=")[0];

        let baseTypeDefWithPackage = "";
        let baseModelName: string = null;
        let baseData = "";

        if (isBase)
        {
            if (ampersandSplit.length > 1)
            {
                baseTypeDefWithPackage = ampersandSplit[0].substring(ampersandSplit[0].indexOf("=") + 1, ampersandSplit[0].length);
                baseModelName = baseTypeDefWithPackage + this.suffix;
                baseData = baseTypeDefWithPackage.charAt(0).toLowerCase() + baseTypeDefWithPackage.substring(1, baseTypeDefWithPackage.length);

                console.info("Base model: " + baseModelName);
            }
        }
        else
        {
            baseModelName = "ModelGen";
        }

        const modelPrefix: string = typeDefName + this.suffix;
        this.modelName = isBase ? "ModelGen" : modelPrefix;
        const enumName: string = modelPrefix;
        let modelBaseName = "Abstract" + this.suffix;
        let modelBaseInterface = "I" + this.suffix;
        const data: string = modelPrefix.charAt(0).toLowerCase() + modelPrefix.substring(1, modelPrefix.length) + "Data";
        let imports = "";
        let _override = this.suffix == "Model" ? "" : "override ";
        let _super = "";

        if (baseModelName != null || !isBase)
        {
            modelBaseName = baseModelName;
            modelBaseInterface = "I" + modelBaseName;

            _override = "override ";
            _super = "super.init();";
        }

        let out: string = template;

        if (type === ObjectType.Enum)
        {
            imports = "import {Enum} from \"domwires\";";
        }

        if (isBase)
        {
            out = out.split("${data}").join(data);

            if (type === ObjectType.Immutable)
            {
                if (ampersandSplit.length == 1)
                {
                    imports =
                        "import {I" + this.suffix + "Immutable, I" + this.suffix + ", Abstract" + this.suffix + "} from " +
                            "\"" + this.importBaseFrom + "\";" + this.sep() +
                        "import {inject, postConstruct} from \"inversify\";" + this.sep() +
                        "import {${typedef_name}" + this.suffix + "MessageType} from \"./I${typedef_name}" + this.suffix + "\";" + this.sep() +
                        "import {" + typeDefName + "} from \"../" + typeDefName + "\";" + this.sep() + this.typeDefImports;
                }
                else
                {
                    imports =
                        "import {" + modelBaseInterface + ", " + modelBaseInterface + "Immutable, " + modelBaseName + "} from \"../" + baseData + "/I" + modelBaseName + "\";" + this.sep() +
                        "import {inject, postConstruct} from \"inversify\";" + this.sep() +
                        "import {" + typeDefName + "} from \"../" + typeDefName + "\";" + this.sep() +
                        "import {${typedef_name}" + this.suffix + "MessageType} from \"./I${typedef_name}" + this.suffix + "\";";
                }
            }
        }
        else
        {
            out = out.split(this.tab() + "@inject(\"${typedef_name}\")" + this.sep() + this.tab() + "private ${data}: ${typedef_name};").join("");

            if (type === ObjectType.Immutable)
            {
                imports =
                    "import {IModelGenImmutable, IModelGen, ModelGen} from \"./IModelGen\";" + this.sep() +
                    "import {postConstruct} from \"inversify\";" + this.sep() +
                    "import {Enum} from \"domwires\";";
            }
        }

        out = out
            .split("${imports}").join(imports)
            .split("${_override}").join(_override)
            .split("${_super}").join(_super)
            .split("${model_name}").join(this.modelName)
            .split("${model_base_name}").join(modelBaseName)
            .split("${typedef_name}").join(typeDefName)
            .split("${model_base_interface}").join(modelBaseInterface);

        let content = "";
        let assign = "";

        if (type == ObjectType.Enum)
        {
            for (const value of this.enumValueList)
            {
                content += value + ";" + this.sep() + this.tab();
            }
        }

        if (isBase)
        {
            const paramList: Array<string> = ampersandSplit.length > 1
                ? ampersandSplit[1].substring(1, ampersandSplit[1].lastIndexOf("}")).split(";")
                : equalSplit[1].substring(1, equalSplit[1].lastIndexOf("}")).split(";");

            paramList.pop();

            for (const param of paramList)
            {
                if (param.split("readonly ").length != 2)
                {
                    console.info("Error: use 'readonly' to keep immutability: " + param);
                    this.hasErrors = true;
                }
            }

            for (let i = 0; i < paramList.length; i++)
            {
                let line = "";

                const param: string = paramList[i];
                const paramTypeSplit: Array<string> = param.split(":");
                const paramFinalSplit: Array<string> = param.split("readonly ");

                if (paramTypeSplit.length != 2)
                {
                    console.info("Error: cannot parse type from param: " + param);
                    this.hasErrors = true;
                }

                if (type == ObjectType.Immutable)
                {
                    line = paramTypeSplit.join("(): ").split("readonly ").join("get ") + ";" + this.sep() + this.tab();
                }
                else if (type == ObjectType.Mutable)
                {
                    const char: string = paramFinalSplit[1].charAt(0).toUpperCase();
                    const methodNameWithType: string = char + paramFinalSplit[1].substring(1, paramFinalSplit[1].length);
                    line = "set" + methodNameWithType;

                    const type: string = line.split(":")[1].split(";").join("");
                    const messageType: string = methodNameWithType.split(":")[0];
                    this.enumValueList.push(
                        "public static readonly " + this.getMessage(messageType) + " = new " + typeDefName + this.suffix + "MessageType()"
                    );

                    line = line.split(":").join("(value: " + type + "): ").split("): " + type).join("): I" + this.modelName);
                    line = line.split("readonly ").join(" ") + ";" + this.sep() + this.tab();
                }
                else if (type == ObjectType.Class)
                {
                    const name: string = paramFinalSplit[1].substring(0, paramFinalSplit[1].indexOf(":"));
                    const u_name: string = name.charAt(0).toUpperCase() + name.substring(1, name.length);
                    const type: string = paramFinalSplit[1].split(":")[1].split(";").join("");
                    const messageType: string = this.getMessage(u_name);

                    line = this.getterTemplate.split("${name}").join(name).split("${type}").join(type) + this.sep(2);
                    line += this.setterTemplate.split("${name}").join(name).split("${u_name}").join(u_name)
                        .split("${type}").join(type).split("${model_name}").join(this.modelName)
                        .split("${enum_name}").join(enumName)
                        .split("${message_type}").join(messageType) + this.sep(2);

                    assign += "this._" + name + " = this." + data + "." + name + ";" + this.sep() + this.tab(2);
                }

                if (type != ObjectType.Enum)
                {
                    content += line;
                }
            }
        }

        out = out.split("${content}").join(content).split("${assign}").join(assign);

        out = this.removeEmptyLines(out);

        return {fileName: isBase ? "IModelGen" : "I" + this.modelName, data: out};
    }

    private getMessage(messageType: string): string
    {
        let modified = "";
        for (let i = 0; i < messageType.length; i++)
        {
            if (i > 0 && messageType.charAt(i) === messageType.charAt(i).toUpperCase())
            {
                modified += "_";
            }

            modified += messageType.charAt(i);
        }

        return "ON_SET_" + modified.toUpperCase();
    }

    private removeEmptyLines(text: string): string
    {
        let formattedText = "";
        const lineList: Array<string> = text.split(this.sep());

        let prevLine: string = null;
        let add = true;

        for (let i = 0; i < lineList.length; i++)
        {
            const line: string = lineList[i];
            const nextLine: string = i < lineList.length - 1 ? lineList[i + 1] : null;

            if (!this.isEmpty(line))
            {
                add = true;
            }
            else if (prevLine == null)
            {
                add = true;
            }
            else if (nextLine && nextLine.substring(0, 7) === "export ")
            {
                add = true;
            }
            else if (this.isEmpty(prevLine) || (nextLine.split("}").length == 2) || (prevLine.split("{").length == 2))
            {
                add = false;
            }

            if (add)
            {
                formattedText += line + this.sep();
            }

            prevLine = line;
        }

        return formattedText;
    }

    private getNewPackageName(typeDefFileName: string): string
    {
        return typeDefFileName.charAt(0).toLowerCase() +
            typeDefFileName.substring(1, typeDefFileName.length).split(".ts")[0];
    }

    private sep(x = 1): string
    {
        let out = "";

        for (let i = 0; i < x; i++)
        {
            out += this.os.EOL;
        }

        return out;
    }

    private tab(x = 1): string
    {
        let out = "";

        for (let i = 0; i < x; i++)
        {
            out += "    ";
        }

        return out;
    }

    private removeDuplicates(arr: Array<string>): Array<string>
    {
        const newArr: Array<string> = [];

        for (const value of arr)
        {
            if (newArr.indexOf(value) == -1)
            {
                newArr.push(value);
            }
        }

        return newArr;
    }

    private isEmpty(input: string): boolean
    {
        for (let i = 0; i < input.length; i++)
        {
            if (input.charAt(i) != " ")
            {
                return false;
            }
        }

        return true;
    }

    private removeAllEmptySpace(input: string): string
    {
        return input
            .split("          ").join("")
            .split("        ").join("")
            .split("    ").join("")
            .split("  ").join("")
            .split(" ").join("")
            .split(this.os.EOL).join("")
            .split("readonly").join("readonly ")
            .split("var").join("var ")
            .split("package").join("package ")
            .split("export").join("export ")
            .split("import").join("import ")
            .split("/*@Model*/export type").join("/* @Model */ export type ");
    }

    private populateTypeDefImports(): void
    {
        let arr: string[] = this.typedefFile.split(";");
        arr = arr.filter(value => value.slice(0, 7) == "import ");

        arr.map(value => this.typeDefImports += value + ";" + this.sep() + this.tab());

        this.typeDefImports = this.typeDefImports.split("from").join(" from ").split(",").join(" ,");

        if (this.relatedImportPath)
        {
            this.typeDefImports = this.typeDefImports.split("./").join(this.relatedImportPath);
        }
    }
}

type OutData = {
    fileName: string;
    data: string;
};

enum ObjectType
{
    Immutable,
    Mutable,
    Class,
    Enum
}

new ModelFromTypeGen();