export class Mapping {
    intermediary: string
    yarn: string

    constructor(intermediary: string, yarn: string) {
        this.intermediary = intermediary;
        this.yarn = yarn;
    }
   
}

export class Mappings {
    classes: Map<string, Mapping>
    fields: Map<string, Mapping>
    methods: Map<string, Mapping>

    constructor() {
        this.classes = new Map<string, Mapping>();
        this.fields = new Map<string, Mapping>();
        this.methods = new Map<string, Mapping>();
    }

    find(name: string) {
        let type = name.split("_")[0].split("/").pop();
        switch (type) {
            case "class":
                return this.classes.get(name);
            case "method":
                return this.methods.get(name);
            case "field":
                return this.fields.get(name);
            default:
            //throw `Unsupported intermediary type ${type} for input ${name}`;
        }
    }

    add(nameable: Map<string, Mapping>, mapping: Mapping) {
        nameable.set(mapping.intermediary, mapping);
    }
}

export function parseTiny(input : string) : Mappings {
    const mappings = new Mappings()

    let foundHeader = false;
    let namespace : {[key:string]:number;} = {};

    input.split("\n").map(function (value) {
        return value.split("\t")
    }).forEach(function (split) {

        //Reads the header to find the coloum of the mapping format
        if (!foundHeader) {
            if (split[0] !== 'v1') {
                throw "Unsupported mapping format"
            }
            foundHeader = true;
            for (let i = 1; i < split.length; i++) {
                namespace[split[i]] = i - 1
            }
            return
        }

        switch (split[0]) {
            case "CLASS":
                mappings.add(mappings.classes, new Mapping(split[namespace.intermediary + 1], split[namespace.named + 1]));
                break
            case "FIELD":
                mappings.add(mappings.fields, new Mapping(split[namespace.intermediary + 3], split[namespace.named + 3]));
                break
            case "METHOD":
                mappings.add(mappings.methods, new Mapping(split[namespace.intermediary + 3], split[namespace.named + 3]));
                break
            default:
                //Nope
        }
    })

    console.log(`Loaded ${mappings.classes.size} classes, ${mappings.fields.size} fields, ${mappings.methods.size} methods`)

    return mappings
}