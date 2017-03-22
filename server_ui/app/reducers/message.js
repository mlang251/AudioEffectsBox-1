import {UPDATE_MESSAGE} from '../actions/actionTypes';

const message = (state = '', action) => {
    const {message} = action.payload;
    switch (action.type) {
        case UPDATE_MESSAGE:
            return message;
        default:
            return state;
    }
};

export default message;

