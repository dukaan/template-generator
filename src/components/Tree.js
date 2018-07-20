import React, {Component} from 'react';
import SortableTree from 'react-sortable-tree';
import 'react-sortable-tree/style.css';
import Modal from "./Modal";
import store from "../store/store";
import {initElements, initTreeData, initTypes, setCurrentElementData} from "../store/actions";
import InspectorBase from "./inspector/InspectorBase";
import './Tree.css';

export default class Tree extends Component {

    state = {
        treeData: store.getState().treeData,
        activeNodeName: undefined
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
                                    onClick={() => {
                                        store.dispatch(setCurrentElementData(rowInfo.node));
                                        this.setState(prevState => ({
                                            ...prevState,
                                            activeNodeName: rowInfo.node.title
                                        }));
                                    }}
                                >
                                    inspect
                                </button>,
                            ],
                            className: 'treeElement ' + (this.state.activeNodeName === rowInfo.node.title ? 'active' : '')
                        })}
                    />
                </div>

                <InspectorBase/>

            </div>
        );
    }
}