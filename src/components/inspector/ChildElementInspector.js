import React from 'react';
import './Inspector.css';
import store from "../../store/store";
import {initElements, initTreeData, initTypes} from "../../store/actions";

class ChildElementInspector extends React.Component {

    currentElementData = undefined;

    constructor(props) {
        super(props);

        this.addChildRef = React.createRef();
        this.addChildTypeRef = React.createRef();
        this.typeSelectRef = React.createRef();
    }

    handleElementChange(event, element) {
        let newElementConstraints = store.getState().elements[this.currentElementData.elementData.name].elementConstraints.slice();
        // if checkbox is checked and attribute is already in constrains array -> remove it
        if (event.target.checked && newElementConstraints.indexOf(element) > -1) {
            newElementConstraints.splice(newElementConstraints.indexOf(element), 1);
        } else if (newElementConstraints.indexOf(element) === -1) { // else if attribute is not in constraints array already -> add it
            newElementConstraints.push(element);
        }

        let newElements = JSON.parse(JSON.stringify(store.getState().elements));
        newElements[this.currentElementData.elementData.name].elementConstraints = newElementConstraints;
        store.dispatch(initElements(newElements));
        store.dispatch(initTreeData(this.initTree(store.getState().types, newElements)));
    }

    // TODO don't add to each element of same type when adding new child to specific element
    handleAddElement() {
        let newTypes = JSON.parse(JSON.stringify(store.getState().types));
        let newElements = JSON.parse(JSON.stringify(store.getState().elements));

        const newElementName = this.addChildRef.current.value;
        const typeName = this.typeSelectRef.current.value;
        const newTypeName = this.addChildTypeRef.current.value;

        if (newElementName && newElementName !== '' && newTypes[this.currentElementData.elementData.type].children.indexOf(newElementName) === -1 && (!newTypeName || newTypeName === '')) {
            newElements[newElementName] = {
                name: newElementName,
                type: typeName,
                minOccurs: '0',
                maxOccurs: 'unbounded',
                elementConstraints: newTypes[typeName].children,
                attributeConstraints: newTypes[typeName].attributes,
                mandatoryAttributes: [],
                attributeEnums: {}
            };
            newTypes[this.currentElementData.elementData.type].children.push(newElementName);
            store.dispatch(initTypes(newTypes));
            store.dispatch(initElements(newElements));
            store.dispatch(initTreeData(this.initTree(newTypes, newElements)));
        } else {
            newTypes[newTypeName] = {
                name: newTypeName,
                children: [],
                attributes: [],
            };
            newElements[newElementName] = {
                name: newElementName,
                type: newTypeName,
                minOccurs: '0',
                maxOccurs: 'unbounded',
                elementConstraints: newTypes[newTypeName].children,
                attributeConstraints: newTypes[newTypeName].attributes,
                mandatoryAttributes: [],
                attributeEnums: {}
            };
            newTypes[this.currentElementData.elementData.type].children.push(newElementName);
            store.dispatch(initTypes(newTypes));
            store.dispatch(initElements(newElements));
            store.dispatch(initTreeData(this.initTree(newTypes, newElements)));
        }
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
            <div className="childElementInspector">

                <h3>CHILD ELEMENTS</h3>

                {
                    this.currentElementData
                        ? <div>

                            {
                                store.getState().types[this.currentElementData.elementData.type].children.length === 0
                                    ? <div className="placeholderText">No children yet</div>
                                    : <table>
                                        <tbody>
                                        <tr>
                                            <th>name</th>
                                            <th>type</th>
                                            <th>in use</th>
                                        </tr>
                                        {
                                            this.currentElementData
                                            && store.getState().types[this.currentElementData.elementData.type].children.map(child => {
                                                const uuidv4 = require('uuid/v4');
                                                return (
                                                    <tr key={uuidv4()}>
                                                        <td>
                                                            <label htmlFor={child}>{child}</label>
                                                        </td>
                                                        <td>
                                                            <label>{store.getState().elements[child].type}</label>
                                                        </td>
                                                        <td>
                                                            <input type="checkbox"
                                                                   id={child}
                                                                   name={child}
                                                                   value={child}
                                                                   defaultChecked={store.getState().elements[this.currentElementData.elementData.name].elementConstraints.indexOf(child) === -1}
                                                                   onChange={(event) => this.handleElementChange(event, child)}/>
                                                        </td>
                                                    </tr>);
                                            })
                                        }
                                        </tbody>
                                    </table>
                            }

                            <div className="addChildWrapper">
                                <span className="describeLabel">name</span><br/>
                                <input type="text" ref={this.addChildRef}/><br/>

                                <span className="describeLabel">type</span><br/>
                                <select ref={this.typeSelectRef}>
                                    <option disabled selected value> -- select a type --</option>
                                    {
                                        Object.keys(store.getState().types).map((type, index) => {
                                            const uuidv4 = require('uuid/v4');
                                            return (<option key={uuidv4()}>{type}</option>);
                                        })
                                    }
                                </select>
                                OR
                                <input type="text" ref={this.addChildTypeRef}/>
                                <button onClick={this.handleAddElement.bind(this)}>add new child</button>
                            </div>

                        </div>
                        : <div className="placeholderText">Please select an element</div>
                }

            </div>
        );
    }
}

export default ChildElementInspector;
