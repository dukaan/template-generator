import React from 'react';
import './Inspector.css';
import AttributeInspector from "./AttributeInspector";
import ChildElementInspector from "./ChildElementInspector";

class InspectorBase extends React.Component {
    render() {
        return (
            <div className="inspectorBase">
                <AttributeInspector/>
                <ChildElementInspector/>
            </div>
        );
    }
}

export default InspectorBase;
