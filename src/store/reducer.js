import {INIT_ELEMENTS, INIT_TREEDATA, INIT_TYPES, SET_CURRENT_ELEMENT_DATA} from "./action-types";
import {Map} from 'immutable';

const initialState = Map({
    types: undefined,
    elements: undefined,
    treeData: undefined,
    currentElementData: undefined
});

const rootReducer = (state = initialState, action) => {
    switch (action.type) {
        case INIT_ELEMENTS:
            return {
                ...state,
                elements: action.payload
            };
        case INIT_TYPES:
            return {
                ...state,
                types: action.payload
            };
        case INIT_TREEDATA:
            return {
                ...state,
                treeData: action.payload
            };
        case SET_CURRENT_ELEMENT_DATA:
            return {
                ...state,
                currentElementData: action.payload
            };
        default:
            return state;
    }
};

export default rootReducer;