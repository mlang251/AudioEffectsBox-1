import React from 'react';
import Radium from 'radium';

/**
 * The Effect module. Represents an effect in the signal chain. Appears as a child component of EffectContainer, child
 *     component is ParameterContainer.
 * @module Effect
 * @see module:EffectContainer
 * @see module:ParameterContainer
 */

/** 
 * Class representing an effect in the signal chain.
 * @extends external:PureComponent 
 */
class Effect extends React.PureComponent {
    /** Create the Effect component */
    constructor() {
        super();
    }

    /**
     * Render the effect into the signal chain. Receives ParameterContainer child components as props from EffectContainer
     * @see module:ParameterContainer
     */
    render() {
        return (
            <div style = {styles.effectDiv}>
                <div style = {styles.headerDiv}>
                    <p style = {styles.effectTitle}>{this.props.effectName}</p>
                    <div style = {styles.buttonDiv}>
                        <button
                            key = {`${this.props.ID}Solo`}
                            type = 'button'
                            style = {Object.assign({}, styles.buttonBase, styles.soloButton, styles[this.props.soloStyle])}
                            onClick = {() => this.props.handleSoloButtonClick(this.props.ID)}>S</button>
                        <button
                            key = {`${this.props.ID}Bypass`}
                            type = 'button'
                            style = {Object.assign({}, styles.buttonBase, styles.bypassButton, styles[this.props.bypassStyle])}
                            onClick = {() => this.props.handleBypassButtonClick(this.props.ID)}>B</button>
                        <button
                            key = {`${this.props.ID}Close`}
                            type = 'button'
                            style = {Object.assign({}, styles.buttonBase, styles.closeButton)}
                            onClick = {() => this.props.handleCloseButtonClick(this.props.ID)}>X</button>
                    </div>
                </div>
                {this.props.reorderButtonLeft}
                {this.props.params}
                {this.props.reorderButtonRight}
            </div>
        );
    }
}

/**
 * A style object whose members are passed to components when rendering.
 * @type {Object}
 */
const styles = {
    effectDiv: {
        display: 'inline-block',
        position: 'relative',
        borderWidth: 2,
        borderStyle: 'solid',
        borderColor: '#333',
        boxShadow: 'inset 0 0 5px #AAA',
        borderRadius: 5,
        paddingLeft: 40,
        paddingRight: 40,
    },
    headerDiv: {
        paddingLeft: 15,
        paddingRight: 15
    },
    buttonDiv: {
        display: 'inline-block'
    },
    effectTitle: {
        display: 'inline-block'
    },
    buttonBase: {
        display: 'inline-block',
        borderRadius: '50%',
        marginLeft: 5,
        marginRight: 5,
        borderWidth: 1.5,
        borderColor: '#333',
        borderStyle: 'solid',
        ':focus': {
            outline: 'none'
        }
    },
    soloButton: {

    },
    bypassButton: {

    },
    closeButton: {
        backgroundColor: '#999'
    },
    isActive: {
        backgroundColor: 'yellow'
    },
    isNotActive: {
        backgroundColor: '#999'
    }
}

/** The Effect component */
export default Radium(Effect);
