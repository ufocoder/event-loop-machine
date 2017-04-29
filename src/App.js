import React from 'react';
import PropTypes from 'prop-types';
import waterfall from 'async/waterfall';
import withEventLoopMachine from './EventLoopMachine';

class App extends React.Component {

  static propTypes = {
    cursorMove: PropTypes.func,
    cursorRemove: PropTypes.func,
    setMachineStates: PropTypes.func,
    renderEventLoopMachine: PropTypes.func,

    activateStack: PropTypes.func,
    activateTask: PropTypes.func,
    activateMicroTask: PropTypes.func,

    pushLog: PropTypes.func,
    pushStack: PropTypes.func,
    pushTask: PropTypes.func,
    pushMicroTask: PropTypes.func,

    popStack: PropTypes.func,
    shiftTask: PropTypes.func,
    shiftMicroTask: PropTypes.func
  }

  componentDidMount() {
    this.props.setMachineStates([
      (callback) => waterfall([
        this.props.cursorMove(1),
        this.props.pushStack('script', true),
        this.props.pushTask('Run script', true),
      ], callback),
      this.props.pushLog('script start'),
      this.props.cursorMove(3),
      this.props.pushTask('setTimeout callback'),
      this.props.cursorMove(7),
      this.props.pushMicroTask('First promise then'),
      this.props.cursorMove(13),
      (callback) => waterfall([
        this.props.popStack(),
        this.props.pushLog('script end'),
      ], callback),
      this.props.activateMicroTask(),
      (callback) => waterfall([
        this.props.cursorMove(8),
        this.props.pushStack('Promise callback', true),
      ], callback),
      this.props.pushLog('promise1'),
      this.props.pushMicroTask('Second promise then'),
      this.props.popStack(),
      (callback) => waterfall([
        this.props.shiftMicroTask(),
        this.props.activateMicroTask(),
      ], callback),
      (callback) => waterfall([
        this.props.cursorMove(10),
        this.props.pushStack('Promise callback', true),
      ], callback),
      this.props.pushLog('promise2'),
      (callback) => waterfall([
        this.props.popStack(),
        this.props.shiftMicroTask()
      ], callback),
      (callback) => waterfall([
        this.props.shiftTask(),
        this.props.activateTask(),
      ], callback),
      (callback) => waterfall([
        this.props.cursorMove(4),
        this.props.pushStack('setTimeout callback'),
      ], callback),
      this.props.pushLog('setTimeout'),
      this.props.popStack(),
      this.props.shiftTask(),
      this.props.cursorRemove()
    ])
  }

  render() {
    return this.props.renderEventLoopMachine(`
      console.log('script start');

      setTimeout(function() {
        console.log('setTimeout');
      }, 0);

      Promise.resolve().then(function() {
        console.log('promise1');
      }).then(function() {
        console.log('promise2');
      });

      console.log('script end');
    `);
  }
}

export default withEventLoopMachine(App);
