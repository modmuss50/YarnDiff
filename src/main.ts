import pako from 'pako'

import axios, { AxiosResponse, AxiosRequestConfig } from 'axios'

import { Mapping, Mappings } from './tiny_mappings'
import * as tiny from "./tiny_mappings"

let sourceMappings : Mappings
let targetMappings : Mappings

function load() {

    populateVersions()

    let urlParams = new URLSearchParams(window.location.search)


    if (urlParams.has("version")) {
        let versions = urlParams.get("version").split("PLUS").join("+").split(",")

        console.log(versions);

        if (versions[0] === versions[1]) {
            setMessage("Same version selected")
            return
        }

        let requestConfig: AxiosRequestConfig = {
            responseType: 'arraybuffer'
        }

        axios.all([
            axios.get(`https://maven.modmuss50.me/net/fabricmc/yarn/${versions[0]}/yarn-${versions[0]}-tiny.gz`, requestConfig),
            axios.get(`https://maven.modmuss50.me/net/fabricmc/yarn/${versions[1]}/yarn-${versions[1]}-tiny.gz`, requestConfig)
        ]).then(axios.spread((sourceInput: AxiosResponse, targetInput: AxiosResponse) => {
            sourceMappings = tiny.parseTiny(extract(sourceInput.data))
            targetMappings = tiny.parseTiny(extract(targetInput.data))

            diffMappings(sourceMappings, targetMappings)
        }))

    } else {
        setMessage("Select yarn versions and click update.")
    }
}

function setMessage(text: string) {
    getElement("classes").innerText = text
    getElement("methods").innerText = text
    getElement("fields").innerText = text
}

function populateVersions() {
    let addToList = function (id: string, value: string) {
        var option = document.createElement("option")
        option.text = value
        getList(id).add(option)
    }

    axios.get("https://meta.fabricmc.net/v2/versions/yarn").then(function (res: AxiosResponse) {
        let json = res.data
        for (let i = 0; i < json.length; i++) {
            addToList("source", json[i].version)
            addToList("target", json[i].version)
        }

        let urlParams = new URLSearchParams(window.location.search)
        if (urlParams.has("version")) {
            let versions = decodeURI(urlParams.get("version").split('PLUS').join('+')).split(",")
            getElement("source").value = versions[0]
            getElement("target").value = versions[1]

        }
    })
}

getElement("update_button").addEventListener("click", updateVersions)

//Called when the update button is pressed
function updateVersions() {
    let sourceVersion = getElement("source").value
    let targetVersion = getElement("target").value

    insertParam("version", `${sourceVersion.replace("+", "PLUS")},${targetVersion.replace("+", "PLUS")}`)
}

function generateMigrationMap(){
    let diff = diffMemberArray(sourceMappings.classes, targetMappings)

    var xml = document.implementation.createDocument("", "", null)
    var migrationMap = xml.createElement("migrationMap")
    xml.appendChild(migrationMap)

    migrationMap.appendChild

    diff.forEach(source => {
        let target = targetMappings.find(source.intermediary)

        if (target !== undefined && source.yarn !== target.yarn) {

        }
    })
}

function diffMappings(source: Mappings, target: Mappings) {
    printDiff(diffMemberArray(source.classes, target), "classes")
    printDiff(diffMemberArray(source.methods, target), "methods")
    printDiff(diffMemberArray(source.fields, target), "fields")
}

function printDiff(diff, elementID: string) {
    document.getElementById(elementID).innerText = diff.map(value => `${value.source} -> ${value.target}`).join("\n")
}

function diffMemberArray(source: Map<string, Mapping>, targetMappings: Mappings) {
    let diff = []

    source.forEach(source => {
        let target = targetMappings.find(source.intermediary)

        if (target !== undefined && source.yarn !== target.yarn) {
            diff.push({
                source: source.yarn,
                target: target.yarn
            })
        }
    })
    return diff
}


function extract(input) {
    const byteArray = new Uint8Array(input)
    return pako.inflate(byteArray, { to: 'string' })
}

//Thanks https://stackoverflow.com/questions/486896/adding-a-parameter-to-the-url-with-javascript
function insertParam(key: string, value: string) {
    key = encodeURI(key)
    value = encodeURI(value)

    const kvp = document.location.search.substr(1).split('&')

    let i = kvp.length; var x; while (i--) {
        x = kvp[i].split('=')

        if (x[0] == key) {
            x[1] = value
            kvp[i] = x.join('=')
            break
        }
    }

    if (i < 0) { kvp[kvp.length] = [key, value].join('=') }

    //this will reload the page, it's likely better to store this until finished
    document.location.search = kvp.join('&')
}

function getElement(name: string): HTMLInputElement {
    return (document.getElementById(name) as HTMLInputElement)
}

function getList(name: string): HTMLSelectElement {
    return (document.getElementById(name) as HTMLSelectElement)
}

load()
