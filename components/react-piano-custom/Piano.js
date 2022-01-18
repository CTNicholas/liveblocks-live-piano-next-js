import React from 'react';
import PropTypes from 'prop-types';
import ControlledPiano from './ControlledPiano';

class Piano extends React.Component {
  static propTypes = {
    glissando: PropTypes.bool,
    onlyAudio: PropTypes.bool,
    keyColors: PropTypes.object,
    noteRange: PropTypes.object.isRequired,
    activeNotes: PropTypes.arrayOf(PropTypes.number.isRequired),
    playNote: PropTypes.func.isRequired,
    stopNote: PropTypes.func.isRequired,
    onPlayNoteInput: PropTypes.func,
    onStopNoteInput: PropTypes.func,
    renderNoteLabel: PropTypes.func,
    className: PropTypes.string,
    disabled: PropTypes.bool,
    width: PropTypes.number,
    keyWidthToHeight: PropTypes.number,
    keyboardShortcuts: PropTypes.arrayOf(
      PropTypes.shape({
        key: PropTypes.string.isRequired,
        midiNumber: PropTypes.number.isRequired,
      }),
    ),
  };

  state = {
    activeNotes: this.props.activeNotes || [],
  };

  componentDidUpdate(prevProps) {
    // Make activeNotes "controllable" by using internal
    // state by default, but allowing prop overrides.
    if (
      prevProps.activeNotes !== this.props.activeNotes &&
      this.state.activeNotes !== this.props.activeNotes
    ) {
      this.setState({
        activeNotes: this.props.activeNotes || [],
      });
    }
  }

  handlePlayNoteInput = (midiNumber) => {
    this.setState((prevState) => {
      // Need to be handled inside setState in order to set prevActiveNotes without
      // race conditions.
      if (this.props.onPlayNoteInput) {
        this.props.onPlayNoteInput(midiNumber, { prevActiveNotes: prevState.activeNotes });
      }

      // Don't append note to activeNotes if it's already present
      if (prevState.activeNotes.includes(midiNumber)) {
        return null;
      }
      return {
        activeNotes: prevState.activeNotes.concat(midiNumber),
      };
    });
  };

  handleStopNoteInput = (midiNumber) => {
    this.setState((prevState) => {
      // Need to be handled inside setState in order to set prevActiveNotes without
      // race conditions.
      if (this.props.onStopNoteInput) {
        this.props.onStopNoteInput(midiNumber, { prevActiveNotes: this.state.activeNotes });
      }
      return {
        activeNotes: prevState.activeNotes.filter((note) => midiNumber !== note),
      };
    });
  };

  render() {
    const { activeNotes, onPlayNoteInput, onStopNoteInput, ...otherProps } = this.props;
    return (
      <ControlledPiano
        activeNotes={this.state.activeNotes}
        onPlayNoteInput={this.handlePlayNoteInput}
        onStopNoteInput={this.handleStopNoteInput}
        {...otherProps}
      />
    );
  }
}

export default Piano;
