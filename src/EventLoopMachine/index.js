import React from 'react';
import Highlight from 'react-highlight';
import cloneDeep from 'lodash.clonedeep';

import 'highlight.js/styles/monokai.css';
import './assets/styles.css';

const LINE_HEIGHT = 25

export default function eventLoopMachine(Сomponent) {

  return class extends React.Component {

    constructor(props) {
      super(props);

      const initialState = {
        line: null,
        stack: [],
        queueTask: [],
        queueMicroTask: [],
        log: []
      };

      this.state = {
        machine: cloneDeep(initialState),
        step: -1,
        steps: [],
        cache: {
          '-1': cloneDeep(initialState)
        }
      };
    }

    canGoNext = () => (
      (this.state.step + 1) < this.state.steps.length
    )

    canGoPrev = () => (
      this.state.step > -1
    )

    handleStateNext = () => {
      if (this.canGoNext()) {
        const step = this.state.step + 1;

        if (this.state.cache[step]) {
          this.setState({
            machine: this.state.cache[step],
            step
          })
        } else {
          this.state.steps[step](() => {
            this.setState({
              step,
              cache: {
                ...this.state.cache,
                [step]: cloneDeep(this.state.machine)
              }
            })
          });
        }
      }
    }

    handleStatePrev = () => {
      if (this.canGoPrev()) {
        const step = this.state.step - 1;

        this.setState({
          machine: this.state.cache[step],
          step
        });
      }
    }

    setMachineStates = (steps) => {
      this.setState({
        ...this.state,
        steps
      })
    }

    cursorMoveToLine = (line) => (callback) => {
      this.setState({
        machine: {
          ...this.state.machine,
          line: line
        }
      }, callback)
    }

    cursorRemove = () => (callback) => {
      this.setState({
        machine: {
          ...this.state.machine,
          line: null
        }
      }, callback)
    }

    pushState = (stateKey) => (message, active = false) => (callback) => {
      const array = this.state.machine[stateKey];

      array.push({active, message})

      this.setState({
        machine: {
          ...this.state.machine,
          [stateKey]: array
        }
      }, callback)
    }

    popState = (stateKey) => () => (callback) => {
      const array = this.state.machine[stateKey];

      array.pop()

      this.setState({
        machine: {
          ...this.state.machine,
          [stateKey]: array
        }
      }, callback)
    }

    shiftState = (stateKey) => () => (callback) => {
      const array = this.state.machine[stateKey];

      array.shift()

      this.setState({
        machine: {
          ...this.state.machine,
          [stateKey]: array
        }
      }, callback)
    }

    activateStackState = (stateKey) => () => (callback) => {
      const array = this.state.machine[stateKey];
      const lastItem = array.pop()

      if (lastItem) {
        lastItem.active = true

        array.push(lastItem)
      }

      this.setState({
        machine: {
          ...this.state.machine,
          [stateKey]: array
        }
      }, callback)
    }

    activateQueueState = (stateKey) => () => (callback) => {
      const array = this.state.machine[stateKey];
      const firstItem = array.shift()

      if (firstItem) {
        firstItem.active = true

        array.unshift(firstItem)
      }

      this.setState({
        machine: {
          ...this.state.machine,
          [stateKey]: array
        }
      }, callback)
    }

    renderCursor = () => (
      this.state.machine.line && (
        <div ref="cursor" className="code__cursor" style={{
          top: LINE_HEIGHT * (this.state.machine.line - 1)
        }}/>
      )
    )

    renderCode = (code) => (
      <Highlight className="javascript">
        <pre>{code}</pre>
      </Highlight>
    )

    renderSection = (title, stateKey) => (
      <div className="queue">
        <div className="queue__title">{title}</div>
        {this.state.machine[stateKey].map((item, key) => (
          <div className={"queue__item" + (item.active ? " queue__item--active" : "")} key={key}>
            {item.message}
          </div>
        ))}
      </div>
    )

    renderJavascriptStack = () => this.renderSection(
      'Javascript Stack',
      'stack'
    )

    renderQueueTask = () => this.renderSection(
      'Queue task',
      'queueTask'
    )

    renderQueueMicroTask = () => this.renderSection(
      'Queue micro task',
      'queueMicroTask'
    )

    renderOutputLog = () => this.renderSection(
      'Output log',
      'log'
    )

    renderControls = () => {
      return (
        <div className="controls">
          <button className="controls__button" onClick={this.handleStatePrev} disabled={!this.canGoPrev()}>
            Prev
          </button>
          <button className="controls__button" onClick={this.handleStateNext} disabled={!this.canGoNext()}>
            Next
          </button>
        </div>
      )
    }

    renderEventLoopMachine = (code) => (
      <div>
        <div className="code">
          {this.renderCursor()}
          {this.renderCode(code)}
          {this.renderControls()}
        </div>

        <div className="stacks">
          {this.renderQueueTask()}
          {this.renderQueueMicroTask()}
          {this.renderJavascriptStack()}
          {this.renderOutputLog()}
        </div>
      </div>
    )

    render() {
      return (
        <Сomponent
          cursorMove={this.cursorMoveToLine}
          cursorRemove={this.cursorRemove}

          setMachineStates={this.setMachineStates}
          renderEventLoopMachine={this.renderEventLoopMachine}

          activateStack={this.activateStackState('stack')}
          activateTask={this.activateQueueState('queueTask')}
          activateMicroTask={this.activateQueueState('queueMicroTask')}

          pushLog={this.pushState('log')}
          pushStack={this.pushState('stack')}
          pushTask={this.pushState('queueTask')}
          pushMicroTask={this.pushState('queueMicroTask')}

          popStack={this.popState('stack')}
          shiftTask={this.shiftState('queueTask')}
          shiftMicroTask={this.shiftState('queueMicroTask')} />
      );
    }
  }
}
