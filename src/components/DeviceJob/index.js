// @flow

import React, { Component } from "react";
import { Observable, Subject, from } from "rxjs";
import debounce from "lodash/debounce";
import { mergeMap, last, tap, filter } from "rxjs/operators";
import StepRunnerModal from "./StepRunnerModal";
import type { Step } from "./types";

const runStep = (
  step: Step,
  deviceId: string,
  meta: Object,
  onDoneO: Observable<*>,
): Observable<Object> => step.run(deviceId, meta, onDoneO);

const chainSteps = (
  steps: Step[],
  deviceId: string,
  onStepEnter: (number, Object) => void,
  onDoneO: Observable<number>,
): Observable<Object> =>
  steps.reduce(
    (meta: Observable<*>, step: Step, i: number) =>
      // TODO should transform this into a concat()
      meta.pipe(
        tap(meta => onStepEnter(i, meta)), // this would be a "step-enter" event instead of an imperative call
        mergeMap(meta =>
          runStep(
            step,
            deviceId,
            meta,
            onDoneO.pipe(filter(index => index === i)),
          ),
        ),
        last(), // we should not just take the last() so we can emit over time
      ),
    from([{}]),
  );

class DeviceJob extends Component<
  {
    // as soon as deviceId is set, the DeviceJob starts
    deviceId: ?string,
    steps: Step[],
    onDone: (string, Object) => void,
    onCancel: () => void,
    deviceName: ?string,
    editMode?: boolean,
    onStepEntered?: (number, Object) => void,
  },
  {
    connecting: boolean,
    meta: Object,
    error: ?Error,
    stepIndex: number,
  },
> {
  static defaultProps = {
    steps: [],
  };

  state = {
    connecting: false,
    stepIndex: 0,
    error: null,
    meta: {},
  };

  sub: *;

  onDoneSubject = new Subject();

  componentDidMount() {
    const { deviceId } = this.props;
    if (deviceId) {
      this.onStart(deviceId);
    }
  }

  componentDidUpdate(prevProps: *) {
    const { deviceId } = this.props;
    if (deviceId !== prevProps.deviceId) {
      if (deviceId) {
        this.onStart(deviceId);
      } else {
        this.debouncedSetStepIndex.cancel();
        if (this.sub) this.sub.unsubscribe();
      }
    }
  }

  componentWillUnmount() {
    this.debouncedSetStepIndex.cancel();
    if (this.sub) this.sub.unsubscribe();
  }

  debouncedSetStepIndex = debounce(stepIndex => {
    this.setState({ stepIndex });
  }, 500);

  onStepEntered = (stepIndex: number, meta: Object) => {
    this.debouncedSetStepIndex(stepIndex);
    const { onStepEntered } = this.props;
    if (onStepEntered) onStepEntered(stepIndex, meta);
  };

  onStepDone = () => {
    this.onDoneSubject.next(this.state.stepIndex);
  };

  onStart = (deviceId: string) => {
    this.debouncedSetStepIndex.cancel();
    if (this.sub) this.sub.unsubscribe();

    if (this.props.steps.length === 0) {
      this.props.onDone(deviceId, {});
      return;
    }

    this.setState({
      connecting: true,
      error: null,
      stepIndex: 0,
      meta: {},
    });

    this.sub = chainSteps(
      this.props.steps,
      deviceId,
      this.onStepEntered,
      this.onDoneSubject,
    ).subscribe({
      // we should support more than one events so we can have updates over the stream
      // we could have many "update" events that trigger a local setState with the accumated meta object
      // this meta object would be passed to step rendering so we can have more granularity
      // as well as having the "step entered" being an event itself
      next: meta => {
        // typically we want to only do this for a "done" event
        this.debouncedSetStepIndex.cancel();
        this.setState({ connecting: false }, () => {
          this.props.onDone(deviceId, meta);
        });
      },
      error: error => {
        this.setState({ error });
      },
    });
  };

  onRetry = () => {
    const { deviceId } = this.props;
    const { connecting, error } = this.state;
    if (connecting && error && deviceId) {
      this.onStart(deviceId);
    }
  };

  onClose = () => {
    this.debouncedSetStepIndex.cancel();
    if (this.sub) this.sub.unsubscribe();
    this.setState({ connecting: false, error: null }, () => {
      this.props.onCancel();
    });
  };

  render() {
    const { steps, deviceName } = this.props;
    const { connecting, stepIndex, error } = this.state;
    const step = steps[stepIndex];
    if (!step) return null;
    return (
      <StepRunnerModal
        isOpened={connecting}
        onClose={this.onClose}
        onRetry={this.onRetry}
        step={step}
        onStepDone={this.onStepDone}
        error={error}
        deviceName={deviceName}
      />
    );
  }
}

export default DeviceJob;
