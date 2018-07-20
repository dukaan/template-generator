import {INIT_ELEMENTS, INIT_TREEDATA, INIT_TYPES, SET_CURRENT_ELEMENT_DATA} from "./action-types";

export const initTypes = types => ({ type: INIT_TYPES, payload: types });
export const initElements = elements => ({ type: INIT_ELEMENTS, payload: elements });
export const initTreeData = treeData => ({ type: INIT_TREEDATA, payload: treeData });

export const setCurrentElementData = currentElementData => ({ type: SET_CURRENT_ELEMENT_DATA, payload: currentElementData });