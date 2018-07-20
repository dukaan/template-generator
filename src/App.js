import React, {Component} from 'react';
import './App.css';
import store from "./store/store";
import {initElements, initTreeData, initTypes} from "./store/actions";
import Tree from "./components/Tree";
import {
    AttributeEnumerations,
    HiddenTypeAttributes,
    HierarchyConstraints,
    MandatoryAttributes
} from "./template.config";
import {toggleExpandedForAll} from 'react-sortable-tree';

export const expandTree = (expand) => {
    const newTreeData = toggleExpandedForAll({
        treeData: store.getState().treeData,
        expand
    });
    store.dispatch(initTreeData(newTreeData));
}

class App extends Component {

    constructor(props) {
        super(props);
        this.downloadZip = this.downloadZip.bind(this);
    }

    state = {
        treeData: []
    };

    treeData = [];

    parseXmlFile(filePath) {
        fetch(filePath)
            .then(response => response.text())
            .then(data => {
                const types = {};
                const elements = {};

                // data imported from template.config_db.js
                const elementConstraints = HierarchyConstraints;
                const attributeConstraints = HiddenTypeAttributes;
                const mandatoryAttributes = MandatoryAttributes;
                const attributeEnums = AttributeEnumerations;

                // model_db.xsd (/public/) file parser
                const stringParser = require('xml2js').parseString;
                stringParser(data, function (err, model) {
                    model['xs:schema']['xs:complexType']
                        .filter(type => type.$.name !== 'Tagged' && type.$.name !== 'Fragment')
                        .forEach(type => {
                            const children = [];
                            const attributes = [];
                            try {
                                type['xs:complexContent'][0]['xs:extension'][0]['xs:attribute'].forEach(attribute => {
                                    attributes.push(attribute.$.name);
                                });
                            } catch (e) {
                            }
                            try {
                                type['xs:simpleContent'][0]['xs:extension'][0]['xs:attribute'].forEach(attribute => {
                                    attributes.push(attribute.$.name);
                                });
                            } catch (e) {
                            }
                            try {
                                type['xs:complexContent'][0]['xs:extension'][0]['xs:sequence'][0]['xs:element'].forEach(child => {
                                    // filling elements object
                                    elements[child.$.name] = {
                                        name: child.$.name,
                                        type: child.$.type,
                                        minOccurs: child.$.minOccurs,
                                        maxOccurs: child.$.maxOccurs,
                                        elementConstraints: elementConstraints[child.$.name] ? elementConstraints[child.$.name][0].forbid : [],
                                        attributeConstraints: attributeConstraints[child.$.name] ? attributeConstraints[child.$.name] : [],
                                        mandatoryAttributes: mandatoryAttributes[child.$.name] ? mandatoryAttributes[child.$.name] : [],
                                        attributeEnums: attributeEnums[child.$.name] ? attributeEnums[child.$.name] : [],
                                    }
                                    children.push(child.$.name);
                                });
                            } catch (e) {
                            }
                            try {
                                type['xs:sequence'][0]['xs:choice'][0]['xs:element'].forEach(child => {
                                    // filling elements object
                                    elements[child.$.name] = {
                                        name: child.$.name,
                                        type: child.$.type,
                                        minOccurs: child.$.minOccurs,
                                        maxOccurs: child.$.maxOccurs,
                                        elementConstraints: elementConstraints[child.$.name] ? elementConstraints[child.$.name][0].forbid : [],
                                        attributeConstraints: attributeConstraints[child.$.name] ? attributeConstraints[child.$.name] : [],
                                        mandatoryAttributes: mandatoryAttributes[child.$.name] ? mandatoryAttributes[child.$.name] : [],
                                        attributeEnums: attributeEnums[child.$.name] ? attributeEnums[child.$.name] : [],
                                    }
                                    children.push(child.$.name);
                                });
                            } catch (e) {
                            }

                            // adding root element 'issue'
                            elements['issue'] = {
                                name: 'issue',
                                type: 'Issue',
                                minOccurs: '1',
                                maxOccurs: '1',
                                elementConstraints: elementConstraints['issue'] ? elementConstraints['issue'][0].forbid : [],
                                attributeConstraints: attributeConstraints['issue'] ? attributeConstraints['issue'] : [],
                                mandatoryAttributes: mandatoryAttributes['issue'] ? mandatoryAttributes['issue'] : [],
                                attributeEnums: attributeEnums['issue'] ? attributeEnums['issue'] : {},
                            }

                            // filling types object
                            types[type.$.name] = {
                                name: type.$.name,
                                children: children,
                                attributes: attributes
                            }
                        });
                });

                this.treeData = this.initTree(types, elements);
                store.dispatch(initTreeData(this.treeData));
                store.dispatch(initTypes(types));
                store.dispatch(initElements(elements));
            });
    }

    initTree(types, elements) {
        const createNode = (elementName) => {
            return types[elements[elementName].type].children
                .filter(childName => elements[elementName].elementConstraints.indexOf(childName) === -1)
                .map(childName => {
                    return {
                        title: elements[childName].name,
                        subtitle: elements[childName].type,
                        children: createNode(childName),
                        elementData: elements[childName],
                        expanded: true
                    }
                })
        }

        const tree = [{
            title: elements.issue.name,
            subtitle: elements.issue.type,
            children: createNode(elements.issue.name),
            elementData: elements.issue,
            expanded: true
        }];

        return tree;
    }


    exportXml() {
        const createType = (xw, type) => {
            xw.startElement('xs:complexType');
            xw.writeAttribute('name', type.name);
            if (type.name === 'Issue') {
                xw.startElement('xs:sequence');
                xw.startElement('xs:choice');
                xw.writeAttribute('maxOccurs', 'unbounded');
                type.children.forEach(element => {
                    xw.startElement('xs:element');
                    xw.writeAttribute('name', store.getState().elements[element].name);
                    xw.writeAttribute('minOccurs', store.getState().elements[element].minOccurs);
                    xw.writeAttribute('maxOccurs', store.getState().elements[element].maxOccurs);
                    xw.writeAttribute('type', store.getState().elements[element].type);
                    xw.endElement();
                });
                xw.endElement();
                xw.endElement();
            } else {
                xw.startElement(type.name === 'RichText' || type.name === 'NoRichText' ? 'xs:simpleContent' : 'xs:complexContent');
                xw.startElement('xs:extension');
                xw.writeAttribute('base', type.name === 'RichText' || type.name === 'NoRichText' ? 'xs:string' : 'Fragment');
                if (type.children && type.children.length !== 0) {
                    xw.startElement('xs:sequence');
                    type.children.forEach(element => {
                        xw.startElement('xs:element');
                        xw.writeAttribute('name', store.getState().elements[element].name);
                        xw.writeAttribute('minOccurs', store.getState().elements[element].minOccurs);
                        xw.writeAttribute('maxOccurs', store.getState().elements[element].maxOccurs);
                        xw.writeAttribute('type', store.getState().elements[element].type);
                        xw.endElement();
                    });
                    xw.endElement();
                }
                type.attributes.forEach(attribute => {
                    xw.startElement('xs:attribute');
                    xw.writeAttribute('name', attribute);
                    xw.writeAttribute('type', 'xs:string');
                    xw.endElement();
                });
                xw.endElement();
                xw.endElement();
            }
            xw.endElement();
        }

        const XMLWriter = require('xml-writer');
        const xw = new XMLWriter;
        xw.startDocument();
        xw.startElement('xs:schema');
        xw.writeAttribute('xmlns', 'http://www.sprylab.com/2015/purple-issue-ds');
        xw.writeAttribute('targetNamespace', 'http://www.sprylab.com/2015/purple-issue-ds');
        xw.writeAttribute('xmlns:xs', 'http://www.w3.org/2001/XMLSchema');
        xw.writeAttribute('elementFormDefault', 'qualified');
        xw.writeAttribute('xmlns:r', 'http://www.artifacts.de/2012/richtext-1.0');
        xw.startElement('xs:import');
        xw.writeAttribute('schemaLocation', 'storytelling-richtext.xsd');
        xw.writeAttribute('namespace', 'http://www.artifacts.de/2012/richtext-1.0');
        xw.endElement();
        Object.keys(store.getState().types).forEach((types, index) => {
            createType(xw, store.getState().types[types]);
        });

        xw.startElement('xs:complexType');
        xw.writeAttribute('name', 'Fragment');
        xw.startElement('xs:complexContent');
        xw.startElement('xs:extension');
        xw.writeAttribute('base', 'Tagged');
        xw.startElement('xs:attribute');
        xw.writeAttribute('name', 'name');
        xw.writeAttribute('type', 'xs:string');
        xw.endElement();
        xw.endElement();
        xw.endElement();
        xw.endElement();

        xw.startElement('xs:complexType');
        xw.writeAttribute('name', 'Tagged');
        xw.startElement('xs:attribute');
        xw.writeAttribute('name', 'taggedId');
        xw.endElement();
        xw.startElement('xs:attribute');
        xw.writeAttribute('name', 'taggedPageId');
        xw.endElement();
        xw.endElement();

        xw.startElement('xs:element');
        xw.writeAttribute('name', 'issue');
        xw.writeAttribute('type', 'Issue');
        xw.endElement();
        xw.endElement();
        xw.endDocument();

        return xw.toString();
    }

    exportTemplateConfig() {
        const elements = store.getState().elements;
        const appendix = 'var RichtextConfig = {\n' +
            '    plugins: "textcolor colorpicker link paste fullscreen code allcaps nocaps",\n' +
            '    paste_as_text: true,\n' +
            '    toolbar: [\'fullscreen removeformat | bold italic underline | forecolor link | alignleft aligncenter alignright | allcaps nocaps\'],\n' +
            '    fontsize_formats: "118px 106px 94px 82px 70px 65px 60px 55px 50px 45px 40px 33px 28px 25px 20px",\n' +
            '    textcolor_map: [\n' +
            '        "000000", "Black",\n' +
            '        "FFFFFF", "White",\n' +
            '    ],\n' +
            '    background: \'#cccccc\',\n' +
            '};\n' +
            '\n' +
            'var MediaAttributes = {\n' +
            '    "*": {src: ["image"]}\n' +
            '};\n' +
            '\n' +
            'var ImageCroppingConfiguration = {\n' +
            '    "Free A/R": "NaN",\n' +
            '    "Square": 1,\n' +
            '    "4:3": 4 / 3,\n' +
            '    "3:4": 3 / 4,\n' +
            '    "3:2": 3 / 2,\n' +
            '    "2:3": 2 / 3,\n' +
            '    "16:9": 16 / 9,\n' +
            '    "9:16": 9 / 16,\n' +
            '};\n' +
            '\n' +
            'var TemplateAssets = [];'

        let mandatoryAttributes = {};
        Object.keys(elements).forEach((element, index) => {
            mandatoryAttributes[element] = elements[element].mandatoryAttributes;
        });
        let attributeEnums = {};
        Object.keys(elements).forEach((element, index) => {
            attributeEnums[element] = elements[element].attributeEnums;
        });
        let attributeConstraints = {};
        Object.keys(elements).forEach((element, index) => {
            attributeConstraints[element] = elements[element].attributeConstraints;
        });
        let elementConstraints = {};
        Object.keys(elements).forEach((element, index) => {
            elementConstraints[element] = [{forbid: elements[element].elementConstraints}];
        });

        // printing whole template.config_clean.js file
        const content = 'var MandatoryAttributes =' + JSON.stringify(mandatoryAttributes) + ';' +
            'var AttributeEnumerations =' + JSON.stringify(attributeEnums) + ';' +
            'var HierarchyConstraints =' + JSON.stringify(elementConstraints) + ';' +
            'var HiddenTypeAttributes =' + JSON.stringify(attributeConstraints) + ';' +
            appendix;

        return content;
    }

    exportModelConfig() {
        const pagedArrayString = store.getState().types['Issue'].children.map(child => {
            return '"' + child + '"'
        });
        const content = 'NameMapping = {\n' +
            '\tsortByIndex : true,\n' +
            '};\n' +
            '\n' +
            'var PagedElement = [' + pagedArrayString + '];\n' +
            'var RichtextContentTypes = [ "RichText" ];\n' +
            'var TagAttribute = "taggedId";\n' +
            'var TagPageAttribute = "taggedPageId";\n' +
            'var HiddenAttributes = [ TagAttribute, TagPageAttribute ];\n' +
            'var SectionNameAttribute = "name";';

        return content;
    }

    exportFreemarker() {
        const basic = '<#ftl ns_prefixes={"ds":"http://www.sprylab.com/2015/purple-issue-ds", "r" : "http://www.artifacts.de/2012/richtext-1.0"}>\n' +
            '\n' +
            '<issue>\n' +
            '    <#recurse doc>\n' +
            '</issue>\n' +
            '\n' +
            '<#macro "ds:issue">\n' +
            '    <#recurse issue>\n' +
            '</#macro>\n' +
            '    \n';

        let macros = Object.keys(store.getState().elements).map((key) => {
            return (
                '<#macro "ds:' + key + '">\n' +
                '</#macro>\n' +
                '    \n'
            )
        });
        macros = macros.toString().replace(new RegExp(',', 'g'), '');

        return basic + macros;
    }

    exportCss() {
        return 'p {\n' +
            '\tdisplay:block;\n' +
            '\tmargin: 0;\n' +
            '}\n' +
            '\n' +
            'span.black {color: #000000;}\n' +
            'span.white {color: #ffffff;}\n' +
            '\n' +
            'p.left {text-align: left;}\n' +
            'p.center {text-align: center;}\n' +
            'p.right {text-align: right;}\n' +
            '\n' +
            'span.link {text-decoration:underline; }\n' +
            'span.bold {font-weight:bold;}\n' +
            'span.italic { font-style: italic; }\n' +
            'span.underline { text-decoration: underline; }\n' +
            'a.link {text-decoration: none; }';
    }

    exportModelCss() {
        // TODO implementation
        return '';
    }

    exportBasicConfig() {
        return '# list of templates\n' +
            'templates=phone,tablet\n' +
            '\n' +
            '# name of the xsl file, default: <template-name>.xsl\n' +
            'template.phone=template.phone.ft\n' +
            '# list of operating systems the template is applicable, default: all\n' +
            '#template.phone.os=android\n' +
            '# list of device classes the template is applicable, default: all\n' +
            'template.phone.devices=phone\n' +
            '# name of the output folder/pkar name, default: <template-name>\n' +
            'template.phone.output=phone\n' +
            '\n' +
            'template.phone.downloadImages=false\n' +
            'template.phone.spacingText=--\n' +
            'template.tablet.downloadImages=false\n' +
            'template.tablet.spacingText=--\n' +
            '\n' +
            'template.tablet=template.tablet.ft\n' +
            'template.tablet.devices=tablet\n' +
            'template.tablet.output=tablet';
    }

    exportTaggingJson() {
        // TODO proper tagging.json export
        return '';
    }

    downloadZip() {
        var JSZip = require("jszip");
        var FileSaver = require('file-saver');

        const modelXsd = this.exportXml();
        const modelConfig = this.exportModelConfig();
        const templateConfig = this.exportTemplateConfig();
        const freemarker = this.exportFreemarker();
        const css = this.exportCss();
        const modelCss = this.exportModelCss();
        const basicConfig = this.exportBasicConfig();
        const taggingJson = this.exportTaggingJson();

        const zip = new JSZip();
        zip.file('config.properties', basicConfig);
        zip.file('template.config.js', templateConfig);
        zip.file('template.model.css', modelCss);
        zip.file('template.phone.ft', freemarker);
        zip.file('template.tablet.ft', freemarker);
        zip.file('text.phone.css', css);
        zip.file('text.tablet.css', css);
        zip.file('version.info', '0.0.1');

        const modelFolder = zip.folder('model');
        modelFolder.file('model.xsd', modelXsd);
        modelFolder.file('model.config.js', modelConfig);
        modelFolder.file('tagging.json', taggingJson);
        modelFolder.file(
            'newmodel.xml',
            '<issue xmlns="http://www.sprylab.com/2015/purple-issue-ds"\n' +
            '    xmlns:r="http://www.artifacts.de/2012/richtext-1.0"\n' +
            '    xmlns:xlink="http://www.w3.org/1999/xlink"\n' +
            '    name="">\n' +
            '</issue>'
        );

        // TODO chaining fetches properly
        // load basic files
        fetch('storytelling-richtext.xsd')
            .then(response => response.text())
            .then(data => {
                modelFolder.file('storytelling-richtext.xsd', data);
                fetch('xlink.xsd')
                    .then(response => response.text())
                    .then(data => {
                        modelFolder.file('xlink.xsd', data);
                        fetch('xml.xsd')
                            .then(response => response.text())
                            .then(data => {
                                modelFolder.file('xml.xsd', data);
                                zip.generateAsync({type: "blob"})
                                    .then(function (content) {
                                        FileSaver.saveAs(content, "template.zip");
                                    });
                            });
                    });
            });
    }


    componentWillMount() {
        this.parseXmlFile('model.xsd');
        store.subscribe(() => {
            this.setState({
                treeData: store.getState().treeData
            });
        });
    }

    render() {
        return (
            <div className="App">
                <div className="topBar">
                    <h1>Purple Template Generator</h1>
                    <div className="topBarButton">
                        <button onClick={() => expandTree(true)}>
                            Expand all
                        </button>
                        <button onClick={() => expandTree(false)}>
                            Collapse all
                        </button>
                        <button onClick={this.downloadZip}>
                            Download template
                        </button>
                    </div>
                </div>

                {
                    store.getState().treeData && store.getState().types && store.getState().elements &&
                    (
                        <Tree treeData={store.getState().treeData}/>
                    )
                }
            </div>
        );
    }
}

export default App;