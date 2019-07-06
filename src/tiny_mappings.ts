export class Mapping {
    intermediary: string
    yarn: string

	constructor(intermediary: string, yarn: string) {
        this.intermediary = intermediary;
        this.yarn = yarn;
	}
   
}

export class Mappings {
    classes: Mapping[] = []
    fields: Mapping[] = []
    methods: Mapping[] = []


    findClass(name: string) {
        for (let i = 0; i < this.classes.length; i++) {
            if (this.classes[i].intermediary === name) {
                return this.classes[i]
            }
        }
    }

    findMethod(name: string) {
        for (let i = 0; i < this.methods.length; i++) {
            if (this.methods[i].intermediary === name) {
                return this.methods[i]
            }
        }
    }

    findField(name: string) {
        for (let i = 0; i < this.fields.length; i++) {
            if (this.fields[i].intermediary === name) {
                return this.fields[i]
            }
        }
    }

    find(name: string) {
        let type = name.split("_")[0].split("/").pop()
        switch (type) {
            case "class":
                return this.findClass(name)
            case "method":
                return this.findMethod(name)
            case "field":
                return this.findField(name)
            default:
            //throw `Unsupported intermediary type ${type} for input ${name}`;
        }
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
                mappings.classes.push(new Mapping(split[namespace.intermediary + 1], split[namespace.named + 1]))
                break
            case "FIELD":
                mappings.fields.push(new Mapping(split[namespace.intermediary + 3], split[namespace.named + 3]))
                break
            case "METHOD":
                mappings.methods.push(new Mapping(split[namespace.intermediary + 3], split[namespace.named + 3]))
                break
            default:
                //Nope
        }
    })

    console.log(`Loaded ${mappings.classes.length} classes, ${mappings.fields.length} fields, ${mappings.methods.length} methods`)

    return mappings
}