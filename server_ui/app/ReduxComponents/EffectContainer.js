import {connect} from 'react-redux';
import {removeEffect, reorderEffects, toggleBypass, toggleSolo} from '../actions/actionCreators';
import Effect from './Effect';
import {List, Map} from 'immutable';

const xyzMapToParameter = (xyzMap) => {
    let xyzMapList = List();
    xyzMap.forEach(axis => {
        if (axis.get('effectID') == effectID) {
            xyzMapList.push(Map({
                paramName: axis.get('paramName'),
                axis: axis.get('axis')
            }));
        }
    });
    return xyzMapList;
};


const mapStateToProps = (state, ownProps) => {
    return {
        xyzMapList: xyzMapToParameter(state.xyzMap, ownProps.effectID)
    };
};

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        removeEffect: () => {
            dispatch(removeEffect(ownProps.effectID));
        },
        reorderEffects: (direction) => {
            dispatch(reorderEffects(ownProps.effectID, direction));
        }, 
        toggleBypass: () => {
            dispatch(mapToParameter(ownProps.effectID));
        },
        toggleSolo: () => {
            dispatch(toggleSolo(ownProps.effectID));
        }
    };
};

const EffectContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(Effect);

export default EffectContainer;