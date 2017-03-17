import {List, Map} from 'immutable';
import {ADD_EFFECT, REMOVE_EFFECT, REORDER_EFFECTS} from '../actions/actions';

const effects = (state = List(), action) => {
    switch (action.type) {
        case ADD_EFFECT:
            return state.
        case REMOVE_EFFECT:
        case REORDER_EFFECTS:
        default:
            return state;
    }
}

export default effects;