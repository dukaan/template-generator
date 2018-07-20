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
    }

    state = {
        treeData: store.getState().treeData,
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
                                    }}
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