import React, {Component} from 'react';
import SortableTree from 'react-sortable-tree';
import 'react-sortable-tree/style.css';
import Modal from "./Modal";
import store from "../store/store";
import {initElements, initTreeData, initTypes, setCurrentElementData} from "../store/actions";
import InspectorBase from "./inspector/InspectorBase";
import './Tree.css';

export default class Tree extends Component {

    constructor(props) {
        super(props);
        this.addAttributeRef = React.createRef();
        this.addChildRef = React.createRef();
        this.addChildTypeRef = React.createRef();
        this.typeSelectRef = React.createRef();

        this.enumKeyRef = React.createRef();
        this.enumValueRef = React.createRef();
    }

    state = {
        treeData: store.getState().treeData,
        isOpen: false,
        attributesModal: true,
        elementsModal: false,
        modalContent: undefined
    }

    toggleModal = (rowInfo, modalType) => {
        switch (modalType) {
            case 'attributes':
                this.setState(prevState => ({
                    ...prevState,
                    attributesModal: true,
                    elementsModal: false
                }));
                break;
            case 'elements':
                this.setState(prevState => ({
                    ...prevState,
                    attributesModal: false,
                    elementsModal: true
                }));
                break;
            default:
                break;
        }

        this.setState(prevState => ({
            ...prevState,
            isOpen: !this.state.isOpen,
            modalContent: rowInfo.node
        }));
    }


    handleAttributeChange(event, attribute) {
        let newAttributeConstraints = store.getState().elements[this.state.modalContent.elementData.name].attributeConstraints.slice();
        // if checkbox is checked and attribute is already in constrains array -> remove it
        if (event.target.checked && newAttributeConstraints.indexOf(attribute) > -1) {
            newAttributeConstraints.splice(newAttributeConstraints.indexOf(attribute), 1);
        } else if (newAttributeConstraints.indexOf(attribute) === -1) { // else if attribute is not in constraints array already -> add it
            newAttributeConstraints.push(attribute);
        }

        let newElements = JSON.parse(JSON.stringify(store.getState().elements));
        newElements[this.state.modalContent.elementData.name].attributeConstraints = newAttributeConstraints;
        store.dispatch(initElements(newElements));
        store.dispatch(initTreeData(this.initTree(store.getState().types, newElements)));
    }

    handleMandatoryChange(event, attribute) {
        let newMandatoryAttributes = store.getState().elements[this.state.modalContent.elementData.name].mandatoryAttributes.slice();

        if (event.target.checked && newMandatoryAttributes.indexOf(attribute) === -1) {
            newMandatoryAttributes.push(attribute);
        } else if (newMandatoryAttributes.indexOf(attribute) > -1) {
            newMandatoryAttributes.splice(newMandatoryAttributes.indexOf(attribute), 1);
        }

        let newElements = JSON.parse(JSON.stringify(store.getState().elements));
        newElements[this.state.modalContent.elementData.name].mandatoryAttributes = newMandatoryAttributes;
        store.dispatch(initElements(newElements));
        store.dispatch(initTreeData(this.initTree(store.getState().types, newElements)));
    }

    handleAddAttribute() {
        const newAttribute = this.addAttributeRef.current.value;
        let newTypes = JSON.parse(JSON.stringify(store.getState().types));
        // attribute is not empty and not already existent
        if (newTypes[this.state.modalContent.elementData.type].attributes.indexOf(newAttribute) === -1 && newAttribute && newAttribute !== '') {
            newTypes[this.state.modalContent.elementData.type].attributes.push(newAttribute);
        }
        store.dispatch(initTypes(newTypes));

        // add new attribute to constrained attributes on elements of the same type
        let newElements = JSON.parse(JSON.stringify(store.getState().elements));
        for (let elementName in newElements) {
            if (elementName !== this.state.modalContent.elementData.name && newElements[elementName].type === this.state.modalContent.elementData.type) {
                newElements[elementName].attributeConstraints.push(newAttribute);
            }
        }

        store.dispatch(initElements(newElements));
        store.dispatch(initTreeData(this.initTree(newTypes, newElements)));
    }

    handleElementChange(event, element) {
        let newElementConstraints = store.getState().elements[this.state.modalContent.elementData.name].elementConstraints.slice();
        // if checkbox is checked and attribute is already in constrains array -> remove it
        if (event.target.checked && newElementConstraints.indexOf(element) > -1) {
            newElementConstraints.splice(newElementConstraints.indexOf(element), 1);
        } else if (newElementConstraints.indexOf(element) === -1) { // else if attribute is not in constraints array already -> add it
            newElementConstraints.push(element);
        }

        let newElements = JSON.parse(JSON.stringify(store.getState().elements));
        newElements[this.state.modalContent.elementData.name].elementConstraints = newElementConstraints;
        store.dispatch(initElements(newElements));
        store.dispatch(initTreeData(this.initTree(store.getState().types, newElements)));
    }

    handleAddElement() {
        let newTypes = JSON.parse(JSON.stringify(store.getState().types));
        let newElements = JSON.parse(JSON.stringify(store.getState().elements));

        const newElementName = this.addChildRef.current.value;
        const typeName = this.typeSelectRef.current.value;
        const newTypeName = this.addChildTypeRef.current.value;

        if (newElementName && newElementName !== '' && newTypes[this.state.modalContent.elementData.type].children.indexOf(newElementName) === -1 && (!newTypeName || newTypeName === '')) {
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
            newTypes[this.state.modalContent.elementData.type].children.push(newElementName);
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
            newTypes[this.state.modalContent.elementData.type].children.push(newElementName);
            store.dispatch(initTypes(newTypes));
            store.dispatch(initElements(newElements));
            store.dispatch(initTreeData(this.initTree(newTypes, newElements)));
        }
    }

    handleTypeSelectChange() {
    }

    handleAddEnum(attribute) {
        const key = this.enumKeyRef.current.value;
        const value = this.enumValueRef.current.value;

        let newElements = JSON.parse(JSON.stringify(store.getState().elements));
        if (!(attribute in newElements[this.state.modalContent.elementData.name].attributeEnums)) {
            newElements[this.state.modalContent.elementData.name].attributeEnums[attribute] = {
                [key]: value
            };
        } else if (!(key in newElements[this.state.modalContent.elementData.name].attributeEnums[attribute])) {
            newElements[this.state.modalContent.elementData.name].attributeEnums[attribute][key] = value;
        }

        store.dispatch(initElements(newElements));
        store.dispatch(initTreeData(this.initTree(store.getState().types, newElements)));
    }

    removeEnum(attribute, key) {
        let newElements = JSON.parse(JSON.stringify(store.getState().elements));
        delete newElements[this.state.modalContent.elementData.name].attributeEnums[attribute][key];

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

    componentWillReceiveProps(nextProps) {
        this.setState(prevState => ({
            ...prevState,
            treeData: nextProps.treeData
        }));
    }

    render() {
        return (
            <div className="mainWrapper">

                <Modal show={this.state.isOpen && this.state.attributesModal}
                       onClose={this.toggleModal}>
                    Attributes
                    for {this.state.modalContent ? `${this.state.modalContent.title} (${this.state.modalContent.subtitle})` : ''}:<br/>
                    {
                        this.state.modalContent
                        && store.getState().types[this.state.modalContent.elementData.type].attributes.map(attribute => {
                            const uuidv4 = require('uuid/v4');
                            return (
                                <div key={uuidv4()}>
                                    <div style={{display: 'flex', flexDirection: 'row'}}>
                                        <input type="checkbox"
                                               id={attribute}
                                               name={attribute}
                                               value={attribute}
                                               defaultChecked={store.getState().elements[this.state.modalContent.elementData.name].attributeConstraints.indexOf(attribute) === -1}
                                               onChange={(event) => this.handleAttributeChange(event, attribute)}/>
                                        <label htmlFor={attribute}>{attribute}</label>

                                        <input type="checkbox"
                                               id="mandatory"
                                               name="mandatory"
                                               value="mandatory"
                                               defaultChecked={store.getState().elements[this.state.modalContent.elementData.name].mandatoryAttributes.indexOf(attribute) > -1}
                                               onChange={(event) => this.handleMandatoryChange(event, attribute)}/>
                                        <label htmlFor={attribute}>set mandatory</label>
                                        OR
                                        <button onClick={() => this.handleAddEnum(attribute)}>add new
                                            enumeration</button>
                                    </div>
                                    <ul>
                                        {
                                            attribute in store.getState().elements[this.state.modalContent.elementData.name].attributeEnums && Object.keys(store.getState().elements[this.state.modalContent.elementData.name].attributeEnums[attribute]).map((key, index) => {
                                                const uuidv4 = require('uuid/v4');
                                                return (
                                                    <li key={uuidv4()}>{key} - {store.getState().elements[this.state.modalContent.elementData.name].attributeEnums[attribute][key]}
                                                        <button onClick={() => this.removeEnum(attribute, key)}>remove
                                                        </button>
                                                    </li>
                                                )
                                            })
                                        }
                                    </ul>
                                </div>);
                        })
                    }

                    key:<input type="text" ref={this.enumKeyRef}/>
                    value:<input type="text" ref={this.enumValueRef}/><br/>
                    <input type="text" ref={this.addAttributeRef}/>
                    <button onClick={this.handleAddAttribute.bind(this)}>add new attribute</button>
                </Modal>

                <Modal show={this.state.isOpen && this.state.elementsModal}
                       onClose={this.toggleModal}>
                    Possible child elements
                    for {this.state.modalContent ? `${this.state.modalContent.title} (${this.state.modalContent.subtitle})` : ''}:<br/>
                    {
                        this.state.modalContent
                        && store.getState().types[this.state.modalContent.elementData.type].children.map(child => {
                            const uuidv4 = require('uuid/v4');
                            return (
                                <div key={uuidv4()}>
                                    <input type="checkbox"
                                           id={child}
                                           name={child}
                                           value={child}
                                           defaultChecked={store.getState().elements[this.state.modalContent.elementData.name].elementConstraints.indexOf(child) === -1}
                                           onChange={(event) => this.handleElementChange(event, child)}/>
                                    <label htmlFor={child}>{child}</label>
                                </div>);
                        })
                    }
                    element name:<input type="text" ref={this.addChildRef}/>
                    element type:
                    <select ref={this.typeSelectRef} onChange={this.handleTypeSelectChange.bind(this)}>
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
                </Modal>

                <div className="modelTree">
                    <SortableTree
                        treeData={this.state.treeData}
                        onChange={(treeData) => this.setState({treeData})}
                        generateNodeProps={rowInfo => ({
                            buttons: [
                                <button
                                    className="btn btn-outline-success"
                                    style={{
                                        verticalAlign: 'middle',
                                    }}
                                    onClick={() => this.toggleModal(rowInfo, 'attributes')}
                                >
                                    attributes
                                </button>,
                                <button
                                    className="btn btn-outline-success"
                                    style={{
                                        verticalAlign: 'middle',
                                    }}
                                    onClick={() => this.toggleModal(rowInfo, 'elements')}
                                >
                                    children
                                </button>,
                                <button
                                    className="btn btn-outline-success"
                                    style={{
                                        verticalAlign: 'middle',
                                    }}
                                    onClick={() => {store.dispatch(setCurrentElementData(rowInfo.node));}}
                                >
                                    inspect
                                </button>,
                            ],
                        })}
                    />
                </div>

                <InspectorBase/>

            </div>
        );
    }
}