import React from 'react';
import './Inspector.css';
import store from "../../store/store";
import {initElements, initTreeData, initTypes} from "../../store/actions";

class AttributeInspector extends React.Component {

    currentElementData = undefined;

    constructor(props) {
        super(props);

        this.addAttributeRef = React.createRef();
        this.enumKeyRef = React.createRef();
        this.enumValueRef = React.createRef();
        this.attributeSelectRef = React.createRef();
    }

    handleAttributeChange(event, attribute) {
        let newAttributeConstraints = store.getState().elements[this.currentElementData.elementData.name].attributeConstraints.slice();
        // if checkbox is checked and attribute is already in constrains array -> remove it
        if (event.target.checked && newAttributeConstraints.indexOf(attribute) > -1) {
            newAttributeConstraints.splice(newAttributeConstraints.indexOf(attribute), 1);
        } else if (newAttributeConstraints.indexOf(attribute) === -1) { // else if attribute is not in constraints array already -> add it
            newAttributeConstraints.push(attribute);
        }

        let newElements = JSON.parse(JSON.stringify(store.getState().elements));
        newElements[this.currentElementData.elementData.name].attributeConstraints = newAttributeConstraints;
        store.dispatch(initElements(newElements));
        store.dispatch(initTreeData(this.initTree(store.getState().types, newElements)));
    }

    handleMandatoryChange(event, attribute) {
        let newMandatoryAttributes = store.getState().elements[this.currentElementData.elementData.name].mandatoryAttributes.slice();

        if (event.target.checked && newMandatoryAttributes.indexOf(attribute) === -1) {
            newMandatoryAttributes.push(attribute);
        } else if (newMandatoryAttributes.indexOf(attribute) > -1) {
            newMandatoryAttributes.splice(newMandatoryAttributes.indexOf(attribute), 1);
        }

        let newElements = JSON.parse(JSON.stringify(store.getState().elements));
        newElements[this.currentElementData.elementData.name].mandatoryAttributes = newMandatoryAttributes;
        store.dispatch(initElements(newElements));
        store.dispatch(initTreeData(this.initTree(store.getState().types, newElements)));
    }

    handleAddAttribute() {
        const newAttribute = this.addAttributeRef.current.value;
        let newTypes = JSON.parse(JSON.stringify(store.getState().types));
        // attribute is not empty and not already existent
        if (newTypes[this.currentElementData.elementData.type].attributes.indexOf(newAttribute) === -1 && newAttribute && newAttribute !== '') {
            newTypes[this.currentElementData.elementData.type].attributes.push(newAttribute);
        }
        store.dispatch(initTypes(newTypes));

        // add new attribute to constrained attributes on elements of the same type
        let newElements = JSON.parse(JSON.stringify(store.getState().elements));
        for (let elementName in newElements) {
            if (elementName !== this.currentElementData.elementData.name && newElements[elementName].type === this.currentElementData.elementData.type) {
                newElements[elementName].attributeConstraints.push(newAttribute);
            }
        }

        store.dispatch(initElements(newElements));
        store.dispatch(initTreeData(this.initTree(newTypes, newElements)));
    }

    handleAddEnum() {
        const key = this.enumKeyRef.current.value;
        const value = this.enumValueRef.current.value;
        const attribute = this.attributeSelectRef.current.value;

        let newElements = JSON.parse(JSON.stringify(store.getState().elements));
        if (!(attribute in newElements[this.currentElementData.elementData.name].attributeEnums)) {
            newElements[this.currentElementData.elementData.name].attributeEnums[attribute] = {
                [key]: value
            };
        } else if (!(key in newElements[this.currentElementData.elementData.name].attributeEnums[attribute])) {
            newElements[this.currentElementData.elementData.name].attributeEnums[attribute][key] = value;
        }

        store.dispatch(initElements(newElements));
        store.dispatch(initTreeData(this.initTree(store.getState().types, newElements)));
    }

    removeEnum(attribute, key) {
        let newElements = JSON.parse(JSON.stringify(store.getState().elements));
        delete newElements[this.currentElementData.elementData.name].attributeEnums[attribute][key];

        store.dispatch(initElements(newElements));
        store.dispatch(initTreeData(this.initTree(store.getState().types, newElements)));
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

    componentWillMount() {
        store.subscribe(() => {
            this.currentElementData = store.getState().currentElementData;
            this.setState();
        });
    }

    render() {
        return (
            <div className="attributeInspector">

                <h3>ATTRIBUTES</h3>

                {
                    this.currentElementData
                        ? <div>
                            {
                                store.getState().types[this.currentElementData.elementData.type].attributes.length === 0
                                    ? <div className="placeholderText">No attributes yet</div>
                                    : <table>
                                        <tbody>
                                        <tr>
                                            <th>name</th>
                                            <th>in use</th>
                                            <th>mandatory</th>
                                        </tr>
                                        {
                                            this.currentElementData
                                            && store.getState().types[this.currentElementData.elementData.type].attributes.map(attribute => {
                                                const uuidv4 = require('uuid/v4');
                                                return (
                                                    <tr key={uuidv4()}>
                                                        <td>
                                                            <label htmlFor={attribute}>{attribute}</label>
                                                            <ul>
                                                                {
                                                                    attribute in store.getState().elements[this.currentElementData.elementData.name].attributeEnums && Object.keys(store.getState().elements[this.currentElementData.elementData.name].attributeEnums[attribute]).map((key, index) => {
                                                                        const uuidv4 = require('uuid/v4');
                                                                        return (
                                                                            <li key={uuidv4()}>{key} - {store.getState().elements[this.currentElementData.elementData.name].attributeEnums[attribute][key]}
                                                                                <button
                                                                                    onClick={() => this.removeEnum(attribute, key)}>remove
                                                                                </button>
                                                                            </li>
                                                                        )
                                                                    })
                                                                }
                                                            </ul>
                                                        </td>
                                                        <td>
                                                            <input type="checkbox"
                                                                   id={attribute}
                                                                   name={attribute}
                                                                   value={attribute}
                                                                   defaultChecked={store.getState().elements[this.currentElementData.elementData.name].attributeConstraints.indexOf(attribute) === -1}
                                                                   onChange={(event) => this.handleAttributeChange(event, attribute)}/>
                                                        </td>
                                                        <td>
                                                            <input type="checkbox"
                                                                   id="mandatory"
                                                                   name="mandatory"
                                                                   value="mandatory"
                                                                   defaultChecked={store.getState().elements[this.currentElementData.elementData.name].mandatoryAttributes.indexOf(attribute) > -1}
                                                                   onChange={(event) => this.handleMandatoryChange(event, attribute)}/>
                                                        </td>
                                                    </tr>);
                                            })
                                        }
                                        </tbody>
                                    </table>
                            }

                            <div className="addAttributeWrapper">
                                <div>
                                    <span className="describeLabel">name</span><br/>
                                    <input type="text" ref={this.addAttributeRef}/>
                                </div>
                                <button onClick={this.handleAddAttribute.bind(this)}>add new attribute</button>
                            </div>

                            <div className="addEnumWrapper">
                                <div className="innerEnumWrapper">
                                    <div>
                                        <span className="describeLabel">key</span><br/>
                                        <input type="text" ref={this.enumKeyRef}/>
                                    </div>
                                    <div>
                                        <span className="describeLabel">value</span><br/>
                                        <input type="text" ref={this.enumValueRef}/>
                                    </div>
                                    <select ref={this.attributeSelectRef}>
                                        <option disabled selected value> -- select attribute --</option>
                                        {
                                            store.getState().types[this.currentElementData.elementData.type].attributes.map((attribute, index) => {
                                                const uuidv4 = require('uuid/v4');
                                                return (<option key={uuidv4()}>{attribute}</option>);
                                            })
                                        }
                                    </select>
                                </div>
                                <button onClick={() => this.handleAddEnum()}>add enumeration</button>
                            </div>
                        </div>
                        : <div className="placeholderText">Please select an element</div>
                }

            </div>
        );
    }
}

export default AttributeInspector;
