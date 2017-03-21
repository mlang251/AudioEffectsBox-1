// Action types

export const UPDATE_MESSAGE = 'UPDATE_MESSAGE';
export const ADD_EFFECT = 'ADD_EFFECT';
export const CREATE_ROUTES = 'CREATE_ROUTES';
export const UPDATE_PARAMETER_VALUE = 'UPDATE_PARAMETER_VALUE';
export const TOGGLE_MAPPING = 'TOGGLE_MAPPING';
export const MAP_TO_PARAMETER = 'MAP_TO_PARAMETER';
export const RECEIVE_LEAP_DATA = 'RECEIVE_LEAP_DATA';
export const RECEIVE_LEAP_STATUS = 'RECEIVE_LEAP_STATUS';
export const REMOVE_EFFECT = 'REMOVE_EFFECT';
export const TOGGLE_BYPASS = 'TOGGLE_BYPASS';
export const TOGGLE_SOLO = 'TOGGLE_SOLO';
export const EMIT = 'EMIT';
export const REMOVE_MAPPING = 'REMOVE_MAPPING';
export const REORDER_EFFECTS = 'REORDER_EFFECTS';

// Action creators

export const updateMessage = (message) => {
    return {
        type: UPDATE_MESSAGE,
        payload: {
            message
        }
    };
};

export const addEffect = (effectType, ID) => {
    return {
        type: ADD_EFFECT,
        payload: {
            effectType,
            ID
        }
    };
};

export const createRoutes = (effectsArray) => {
    return {
        type: CREATE_ROUTES,
        payload: {
            effectsArray
        }
    };
};

export const updateParameterValue = (effectID, paramName, paramValue, wasChangedByLeap) => {
    return {
        type: UPDATE_PARAMETER_VALUE,
        payload: {
            effectID,
            paramName,
            paramValue,
            wasChangedByLeap
        }
    };
};

export const toggleMapping = (axisName) => {
    return {
        type: TOGGLE_MAPPING,
        payload: {
            axisName
        }
    };
};

export const mapToParameter = (effectID, paramName, axis) => {
    return {
        type: MAP_TO_PARAMETER,
        payload: {
            effectID,
            paramName,
            axis
        }
    };
};

export const receiveLeapData = (data) => {
    return {
        type: RECEIVE_LEAP_DATA,
        payload: {
            data
        }
    };
};

export const receiveLeapStatus = (address, args) => {
    return {
        type: RECEIVE_LEAP_STATUS,
        payload: {
            address,
            args
        }
    };
};

export const removeEffect = (ID) => {
    return {
        type: REMOVE_EFFECT,
        payload: {
            ID
        }
    };
};

export const toggleBypass = (effectID) => {
    return {
        type: TOGGLE_BYPASS,
        payload: {
            effectID
        }
    };
};

export const toggleSolo = (effectID) => {
    return {
        type: TOGGLE_SOLO,
        payload: {
            effectID
        }
    };
};

export const emit = (eventName, data) => {
    return {
        type: EMIT,
        payload: {
            eventName,
            data
        }
    };
};

export const removeMapping = (axis) => {
    return {
        type: REMOVE_MAPPING,
        payload: {
            axis
        }
    };
};

export const reorderEffects = (effectID, direction) => {
    return {
        type: REORDER_EFFECTS,
        payload: {
            ID,
            direction
        }
    };
};