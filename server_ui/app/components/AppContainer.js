import React from 'react';
import io from 'socket.io-client';
import Immutable from 'immutable';
import App from './App';
import effectsJSON from '../JSON/effects.json';
import defaults from '../JSON/defaults.json';
import * as globals from './JSDoc_globals/globals';

/**
 * The AppContainer module. Responsible for maintaining the state of the entire app. Contains methods for app-wide manipulation
 *     and web socket communication with the server. Child component is App.
 * @module AppContainer
 * @see module:App
 */

/**
 * A React component.
 * @external Component
 * @see {@link https://facebook.github.io/react/docs/react-api.html#react.component}
 */

/**
 * A pure React component.
 * @external PureComponent
 * @see {@link https://facebook.github.io/react/docs/react-api.html#react.purecomponent}
 */

/**
 * The Immutable.js List datatype. Lists are ordered indexed dense collections, much like a JavaScript Array.
 * @external List
 * @see {@link https://facebook.github.io/immutable-js/docs/#/List}
 */

/**
 * The Immutable.js Map datatype. Immutable Map is an unordered Collection.Keyed of (key, value) pairs with 
 *     O(log32 N) gets and O(log32 N) persistent sets.
 * @external Map
 * @see {@link https://facebook.github.io/immutable-js/docs/#/Map}
 */

/**
 * Represents an audio effect
 * @global
 * @typedef {external:Map} Effect
 * @property {string} type - The type of effect
 * @property {string} ID - The unique ID of the audio effect
 * @property {boolean} isBypassed - True or false depending on whether or not the effect is bypassed
 * @property {boolean} isSoloing - True or false depending on whether or not the effect is soloing
 */

/**
 * Represents an axis mapping
 * @global
 * @typedef {external:Map} AxisMap
 * @property {string} effectID - The unique ID of the effect that contains the mapping
 * @property {string} param - The parameter the axis is mapped to
 */

/**
 * Represents an Immutable Map containing parameter info
 * @global
 * @typedef {external:Map} ParamInfoImmutable
 * @property {string} ParamInfoImmutable.effectID - The unique ID of the effect in the signal chain
 * @property {string} ParamInfoImmutable.paramName - The name of the parameter
 * @property {Number} ParamInfoImmutable.paramValue - A float representing the value of the parameter
 */

/**
 * Represents an object containing parameter info
 * @global
 * @typedef {Object} ParamInfoObj
 * @property {string} ParamInfoObj.effetID - The unique ID of the effect in the signal chain
 * @property {string} ParamInfoObj.paramName - The name of the parameter
 * @property {Number} ParamInfoObj.paramValue - A float representing the value of the parameter
 */

/** 
 * Class representing the container for the entire app. Responsible for maintaining the state of the entire app. 
 *     Contains methods for app-wide manipulation and web socket communication with the server.
 * @extends external:Component 
 */
class AppContainer extends React.Component {
    /**
     * Create the app container, create the initial state of the app and bind methods to this instance
     */
    constructor() {
        super();
        /**
         * @namespace AppContainerState
         * @property {string} message - A message to be displayed at the top of the app
         * @property {external:List.<Effect>} effects - An Immutable List containing the effects in the signal chain
         * @property {external:List.<string>} usedIDs - An Immutable List of the unique IDs associated with 
         *     the effects in the signal chain
         * @property {external:Map} parameterValues - An Immutable Map containing the default values for effect parameters
         * @property {external:Map} mapping - An Immutable Map describing the mapping state of the app
         * @property {boolean} mapping.isMapping - True or false depending on whether or not the app is in mapping mode
         * @property {string} mapping.currentAxis - Represents the coordinate axis currently being mapped
         * @property {external:Map} xyzMap - An Immutable Map containing information about coordinate axis mappings
         * @property {AxisMap} xyzMap.x - An Immutable Map representing the parameter mapping applied to the x axis
         * @property {AxisMap} xyzMap.y - An Immutable Map representing the parameter mapping applied to the y axis
         * @property {AxisMap} xyzMap.z - An Immutable Map representing the parameter mapping applied to the z axis
         * @property {external:Map} interactionBox - An Immutable Map representing the state of the InteractionBox
         * @property {external:List} interactionBox.coords - An Immutable List containing the current x, y, z coordinates 
         * @property {external:Map} interactionBox.dimensions - An Immutable Map representing the dimensions of the 
         *     InteractionBox as reported by the Leap
         * @property {boolean} interactionBox.isConnected - True or false depending on whether or not the Leap is connected
         * @property {boolean} interactionBox.isInBounds - True or false depending on whether or not the user's hand is in the
         *     field of view of the Leap
         * @property {boolean} interactionBox.isTracking - True or false depending on whether or not the Leap is tracking
         *     the user's hand motions
         */
        this.state = {
            message: '',
            effects: Immutable.List(),
            usedIDs: Immutable.List(),
            parameterValues: Immutable.fromJS(defaults),
            mapping: Immutable.Map({
                isMapping: false,
                currentAxis: ''
            }),
            xyzMap: Immutable.Map({
                x: Immutable.Map({
                    effectID: undefined,
                    param: undefined
                }),
                y: Immutable.Map({
                    effectID: undefined,
                    param: undefined
                }),
                z: Immutable.Map({
                    effectID: undefined,
                    param: undefined
                })
            }),
            interactionBox: Immutable.Map({
                coords: Immutable.List(),
                dimensions: Immutable.Map(),
                isConnected: false,
                isInBounds: false,
                isTracking: false
            })
        }
        
        this.effects = Immutable.fromJS(effectsJSON)
        this.handleMessage = this.handleMessage.bind(this);
        this.addEffectToChain = this.addEffectToChain.bind(this);
        this.updateParameterValue = this.updateParameterValue.bind(this);
        this.toggleMapping = this.toggleMapping.bind(this);
        this.mapToParameter = this.mapToParameter.bind(this);
        this.receiveLeapData = this.receiveLeapData.bind(this);
        this.receiveLeapStatus = this.receiveLeapStatus.bind(this);
        this.removeEffect = this.removeEffect.bind(this);
        this.toggleBypass = this.toggleBypass.bind(this);
        this.toggleSolo = this.toggleSolo.bind(this);
        this.emit = this.emit.bind(this);
        this.removeMapping = this.removeMapping.bind(this);
        this.reorderEffects = this.reorderEffects.bind(this);
    }

    /**
     * After the app is mounted, create the web sockets for communication with the server
     *     Emits a routing message to establish the initial input > output audio chain
     */
    componentDidMount() {
        this.socket = io('http://localhost:3000');
        this.socket.on('message', this.handleMessage);
        this.socket.on('leapData', this.receiveLeapData);
        this.socket.on('leapStatusUpdate', this.receiveLeapStatus);
        this.emit('route', {input: 'output'});
    }

    /**
     * Emit an event over the web socket to the server
     * @param {string} eventName - The name of the event to emit
     * @param {*} data - The data to be emitted in the event
     */
    emit(eventName, data) {
        this.socket.emit(eventName, data);
    }

    /**
     * Receive a message and update the state.
     * @param {string} message - The message received 
     */
    handleMessage(message) {
        this.setState({message: message});
    }

    /**
     * Used to update the state of the InteractionBox.
     *     Receives a Leap status update from the server, updates the appropraite state.
     * @param {Object} message - An OSC formatted message received from the server
     * @property {string} message.address - The OSC address in the header info of the message
     * @property {string} message.args - The OSC message body, either a plain string or JSON string
     */
    receiveLeapStatus(message) {
        const {address, args} = message;
        switch (address) {
            case '/BoxDimensions':
                const dimensions = JSON.parse(args);
                this.setState(({interactionBox}) => ({
                    interactionBox: interactionBox.update('isConnected', value => true)
                        .update('dimensions', value => this.state.interactionBox.get('dimensions').merge(Immutable.fromJS(dimensions)))
                }));
                break;
            case '/BoundStatus':
                this.setState(({interactionBox}) => ({
                    interactionBox: interactionBox.update('isInBounds', value => args[0] ? true : false)
                }));
                break;
            case '/TrackingMode':
                this.setState(({interactionBox}) => ({
                    interactionBox: interactionBox.update('isTracking', value => args[0] ? true : false)
                }));
                break;
            default:
                console.log('OSC message from unknown address received on port 8010');
                break;
        }
    }

    /**
     * Receive Leap hand tracking data from the server. Iterate through the coordinate data and determine if
     *     the current axis is mapped to an effect parameter. If it is, update that effect's parameter. Update
     *     the interactionBox coords state to update the location of the pointer in InteractionBox.
     * @param {Number[]} data - An array of floats representing the x, y, z coordinates of the user's hand.
     */
    receiveLeapData(data) {
        const coords = ['x', 'y', 'z'];
        let updatedParams = Immutable.List().asMutable();
        for (let i = 0; i < data.length; i++) {
            const effectID = this.state.xyzMap.getIn([coords[i], 'effectID']);
            if (effectID) {
                const paramName = this.state.xyzMap.getIn([coords[i], 'param']);
                updatedParams = updatedParams.push(Immutable.Map({
                    effectID: effectID,
                    paramName: paramName,
                    paramValue: data[i]
                }));
            }
        };
        this.updateParameterValue(updatedParams.asImmutable(), true);
        this.setState(({interactionBox}) => ({
            interactionBox: interactionBox.update('coords', value => Immutable.List(data))
        }));
    }

    /**
     * Creates a routing message to emit to the server based on an input List of effects in the signal chain.
     *     If no effects are in the signal chain, sends an input > output audio signal routing message, otherwise
     *     it will create a routing message that mirrors the representation in the signal chain.
     * @param {external:List.<Effect>} effectsArray - An Immutable List of audio effects
     */
    createRoutes(effectsArray) {
        let routeObj = {input: 'output'};
        effectsArray.forEach((effect, index) => {
            const ID = effect.get('ID');
            if (index == 0) {
                routeObj.input = ID;
            }
            routeObj[ID] = effectsArray.get(index + 1) ? effectsArray.get(index + 1).get('ID') : 'output';
        });
        this.emit('route', routeObj);
    }

    /**
     * Adds a specific type of effect to the signal chain. Checks to see which IDs for the same effect type 
     *     are already present in the signal chain, if it finds any, it will choose the first unused ID to add
     *     to the signal chain. If there are already three of the same type of effect in the signal chain,
     *     it will alert the user that the maximum number of any type of effect is 3. If an effect is added to the
     *     signal chain, it will call this.createRoutes to send a new routing message to the server.
     * @param {string} effectType - The type of effect to add to the signal chain
     */
    addEffectToChain(effectType) {
        const usableIDs = this.effects.getIn(['effects', effectType, 'IDs']);
        usableIDs.forEach((curID, index) => {
            if (this.state.usedIDs.includes(curID)) {
                if (index == usableIDs.size - 1) {
                    alert(`Maximum number of ${effectType} effects reached.`);
                }
            } else {
                const newEffectsArray = this.state.effects.push(Immutable.fromJS({
                    type: effectType,
                    ID: curID,
                    isBypassed: false,
                    isSoloing: false
                }));
                this.setState(({usedIDs, effects}) => ({
                    usedIDs: usedIDs.push(curID).sort(),
                    effects: newEffectsArray
                }));
                this.createRoutes(newEffectsArray);
                return false;
            }
        });
    }

    /**
     * Removes a specific effect from the signal chain. Given a unique effect ID, it will filter the List of
     *     effects in the signal chain and remove the specified effect. It will also update the state of usedIDs
     *     so that both the list of effects in the signal chain, and the list of used IDs will stay in sync. It
     *     then calls this.createRoutes to emit a routing event with the new signal chain.
     * @param {string} effectID - The unique effect ID to be removed from the signal chain
     */
    removeEffect(effectID) {
        const effectsFiltered = this.state.effects.filter((effect, index) => {
            return effect.get('ID') != effectID;
        });
        this.setState(({usedIDs}) => ({
            effects: effectsFiltered,
            usedIDs: usedIDs.delete(usedIDs.indexOf(effectID))
        }));
        this.createRoutes(effectsFiltered);
    }

    /**
     * Toggles the bypass state of a specific effect in the signal chain. It will check to see if any effects are currently
     *     soloing, if an effect is soloing, this function is disabled so that routing events are not emitted. Whichever
     *     effect is soloing must be un-soloed before toggling bypass on another effect. Aside from toggling the bypass state
     *     of the specific effect, it will also keep track of which effects are currently bypassed, since more than one can
     *     be bypassed at the same time. It calls this.createRoutes with the effects in the signal chain, without the bypassed
     *     effects. It also updates the bypassed state of the specified effect.
     * @param {string} effectID - The unique ID of the specific effect to be bypassed
     */
    toggleBypass(effectID) {
        if (!this.state.effects.find(effect => effect.get('isSoloing'))) {
            let isBypassed;
            let indexToUpdate;
            const effectsRoute = Immutable.List().asMutable();
            this.state.effects.forEach((effect, index) => {
                if (effect.get('ID') != effectID) {
                    if (!effect.get('isBypassed')) {
                        effectsRoute.push(effect);
                    }
                } else {
                    isBypassed = effect.get('isBypassed');
                    indexToUpdate = index;
                    if (isBypassed) {
                        effectsRoute.push(effect);
                    }
                }
            });
            this.createRoutes(effectsRoute.asImmutable());
            this.setState(({effects}) => ({
                effects: effects.update(indexToUpdate, effect => effect.update('isBypassed', value => !isBypassed))
            }));
        }
    }

    /**
     * Toggles the solo state of a specific effect in the signal chain. If the specified effect is going into solo mode,
     *     it will check to see if another effect is soloing, and if so, turns off solo mode for that effect. It
     *     will then call this.createRoutes to send a routing message that only includes the soloing effect. If the
     *     specific effect is coming out of solo mode, it will simply set the solo state to true for that effect, and
     *     then call this.createRoutes to include all the effects in the signal chain.
     * @param {string} effectID - The unique ID of the specific effect to be soloed
     */
    toggleSolo(effectID) {
        let isSoloing;
        let indexToUpdate;
        let effectsUpdated = this.state.effects.asMutable();
        effectsUpdated.forEach((effect, index) => {
            if (effect.get('ID') == effectID) {
                isSoloing = effect.get('isSoloing');
                indexToUpdate = index;
                return false;
            }
        });
        if (!isSoloing) {
            effectsUpdated.forEach((effect, index) => {
                if (effect.get('ID') != effectID) {
                    if (effect.get('isSoloing')) {
                        effectsUpdated.update(index, effect => effect.update('isSoloing', value => false));
                    }
                } else {
                    effectsUpdated.update(index, effect => effect.update('isSoloing', value => !isSoloing));
                }
            });
            this.createRoutes(Immutable.List([this.state.effects.get(indexToUpdate)]));
        } else {
            effectsUpdated.update(indexToUpdate, effect => effect.update('isSoloing', value => !isSoloing));
            this.createRoutes(this.state.effects);
        }
        this.setState({
            effects: effectsUpdated.asImmutable()
        });
    }

    /**
     * Updates the state of the mapping feature of the app. Every time it is called it will set isMapping to it's opposite.
     *     If axisName is provided, it will set the value of currentAxis equal to axisName, otherwise currentAxis will be empty.
     * @param {string} [axisName = false] - The name of the axis to toggle the mapping of
     */
    toggleMapping(axisName = false) {
        this.setState(({mapping}) => ({
            mapping: mapping.update('isMapping', value => !mapping.get('isMapping')).update('currentAxis', value => axisName ? axisName : '')
        }));
    }

    /**
     * Creates an object that describes an effect parameter. If the wasChangedByLeap parameter is false, in other words,
     *     if the user is changing a parameter value by clicking and dragging it, the app will emit an updateParam event
     *     with the parameter info.
     * @param {ParamInfoImmutable} paramInfo - The information describing the specific parameter
     * @param {boolean} wasChangedByLeap - True or false depending on whether or not the parameter was changed by the Leap
     * @returns {ParamInfoObj} - An object describing the specific parameter
     */
    createParameterObj(paramInfo, wasChangedByLeap) {
        const paramInfoObj = {};
        paramInfoObj.effectID = paramInfo.get('effectID');
        paramInfoObj.paramName = paramInfo.get('paramName');
        paramInfoObj.paramValue = paramInfo.get('paramValue');
        if (!wasChangedByLeap) {
            this.emit('updateParam', paramInfoObj);
        }
        return paramInfoObj;
    }

    /**
     * Updates the values of one or more specific parameters of one or more effects in the signal chain.
     * @param {external:List.<ParamInfoImmutable>} paramInfo - The information describing the specific parameter
     * @param {boolean} wasChangedByLeap - True or false depending on whether or not the parameter was changed by the Leap
     */
    updateParameterValue(paramInfo, wasChangedByLeap) {
        const updatedParams = {};
        paramInfo.forEach((paramInfo, index) => {
            const {effectID, paramName, paramValue} = this.createParameterObj(paramInfo, wasChangedByLeap);
            if (!updatedParams[effectID]) {
                updatedParams[effectID] = {}
            }
            updatedParams[effectID][paramName] = paramValue;
        });
        this.setState(({parameterValues}) => ({
            parameterValues: parameterValues.mergeDeep(Immutable.fromJS(updatedParams))
        }));
    }

    /**
     * Maps a coordinate axis to a specific parameter on an effect in the signal chain. Retrives the current axis being
     *     mapped from this.state.mapping.currentAxis and applies that axis to the parameter. If the axis to be mapped
     *     is already mapped to another parameter, it clears that mapping and emits an xyzMap event to clear it. If the
     *     specific effect parameter is already mapped to an axis, it will clear that mapping as well. Emits an xyzMap
     *     event with the new mapping of the specified parameter and the current mapping axis. It will call
     *     this.toggleMapping to turn the mapping state off and clear the current axis from the state, and will then
     *     update the state of the xyzMap.
     * @param {external:Map} paramInfo - A description of the parameter to map to
     * @property {string} effectID - The unique ID of the effect in the signal chain
     * @property {string} paramName - The name of the parameter to map to
     */
    mapToParameter(paramInfo) {
        const effectID = paramInfo.get('effectID');
        const paramName = paramInfo.get('paramName');
        const axisName = this.state.mapping.get('currentAxis');
        let xyzMapMutable = this.state.xyzMap.asMutable();

        if (xyzMapMutable.getIn([axisName, 'effectID'])) {
            const {effectID, param} = xyzMapMutable.get(axisName).toJS();
            this.socket.emit('xyzMap', {
                effectID: effectID,
                param: param,
                axis: 'n'
            });
        }

        xyzMapMutable.map((axisInfo, axis) => {
            if (axisInfo.get('effectID') == effectID && axisInfo.get('param') == paramName) {
                xyzMapMutable.updateIn([axis, 'effectID'], value => undefined);
                xyzMapMutable.updateIn([axis, 'param'], value => undefined);
            }
        });

        xyzMapMutable.updateIn([axisName, 'effectID'], value => effectID);
        xyzMapMutable.updateIn([axisName, 'param'], value => paramName);

        this.socket.emit('xyzMap', {
            effectID: effectID,
            param: paramName,
            axis: axisName
        });

        this.toggleMapping();
        this.setState(({xyzMap}) => ({
            xyzMap: xyzMap.mergeDeep(xyzMapMutable.asImmutable())
        }));
    }

    /**
     * Removes a Leap coordinate mapping from a specific effect parameter. Emits an xyzMap event to clear the mapping
     *     and sets the xyzMap state to clear the mapping.
     * @param {string} axis - The coordinate axis to remove a parameter mapping from
     * @param {string} effectID - The specific effect in the signal chain that contains the mapping
     * @param {string} paramName - The effect parameter that contains the mapping
     */
    removeMapping(axis, effectID, paramName) {
        this.emit('xyzMap', {
            effectID: effectID,
            param: paramName,
            axis: 'n'
        });
        this.setState(({xyzMap}) => ({
            xyzMap: xyzMap.updateIn([axis, 'effectID'], value => undefined).updateIn([axis, 'param'], value => undefined)
        }));
    }

    /**
     * Reorders the effects in the signal chain so that a chosen effect is either earlier or later in the signal chain.
     *     Performs the sorting by iterating through the effects in the signal chain, when it finds the specified effect,
     *     it nudges it one step closer to the end of the list. To make this sorting work in both directions, if the direction
     *     value is 'left', it reverses the list, sorts the list as previously described, and then reverses the sorted list.
     *     It then calls this.createRoutes with the sorted list to emit a routing message, and then updates the state of the
     *     effects in the signal chain.
     * @param {string} effectID - The unique ID of the effect in the signal chain to move.
     * @param {string} direction - The direction to in which to nudge the selected effect. A value of 'left' will
     *     nudge the effect one step closer to the raw audio input and a direction of 'right' will nudge the effect
     *     one step closer to the final output.
     */
    reorderEffects(effectID, direction) {
        let effectsList;
        if (direction == 'left') {
            effectsList = this.state.effects.asMutable().reverse();
        } else {
            effectsList = this.state.effects.asMutable();
        }
        effectsList = effectsList.sort((effectA, effectB) => {
            if (effectA.get('ID') == effectID) {
                return 1;
            } else {
                return 0;
            }
        });
        if (direction == 'left') {
            effectsList = effectsList.reverse();
        }
        const effectsUpdated = effectsList.asImmutable();
        this.createRoutes(effectsUpdated);
        this.setState({
            effects: effectsUpdated
        });
    }

    /**
     * Renders the entire app.
     * @see module:App
     */
    render() {
        return (
            <App
                message = {this.state.message}
                addEffectToChain = {this.addEffectToChain}
                parameterValues = {this.state.parameterValues}
                onParameterChange = {this.updateParameterValue}
                isMapping = {this.state.mapping.get('isMapping')}
                toggleMapping = {this.toggleMapping}
                mapToParameter = {this.mapToParameter}
                xyzMap = {this.state.xyzMap}
                removeEffect = {this.removeEffect}
                toggleBypass = {this.toggleBypass}
                toggleSolo = {this.toggleSolo}
                removeMapping = {this.removeMapping}
                reorderEffects = {this.reorderEffects}
                interactionBox = {this.state.interactionBox}
                effects = {this.state.effects} />
        );
    }
}

/** The AppContainer module */
export default AppContainer;
