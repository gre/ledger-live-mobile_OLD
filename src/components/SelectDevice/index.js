// @flow
import React, { Component, Fragment } from "react";
import { FlatList, StyleSheet } from "react-native";
import { connect } from "react-redux";
import { createStructuredSelector } from "reselect";
import { knownDevicesSelector } from "../../reducers/ble";
import { removeKnownDevice } from "../../actions/ble";
import DeviceItem from "../DeviceItem";
import DeviceJob from "../DeviceJob";
import type { Step } from "../DeviceJob/types";
import Header from "./Header";
import Footer from "./Footer";

class SelectDevice extends Component<
  {
    onSelect: (deviceId: string, meta: Object) => void,
    steps: Step[],
    editMode?: boolean,
    // connect-ed
    knownDevices: Array<{
      id: string,
      name: string,
    }>,
    removeKnownDevice: string => *,
    onStepEntered?: (number, Object) => void,
  },
  {
    connecting: boolean,
    connectingId: ?string,
  },
> {
  static defaultProps = {
    steps: [],
  };

  state = {
    devices: [],
    connecting: false,
    connectingId: null,
  };

  onForget = async ({ id }) => {
    this.props.removeKnownDevice(id);
  };

  onSelect = ({ id }) => {
    this.setState({ connecting: true, connectingId: id });
  };

  onDone = (id, meta) => {
    this.setState({ connecting: false }, () => {
      this.props.onSelect(id, meta);
    });
  };

  onCancel = () => {
    this.setState({ connecting: false });
  };

  renderItem = ({ item }: *) => (
    <DeviceItem
      key={item.id}
      device={item}
      onSelect={this.onSelect}
      onForget={this.props.editMode ? this.onForget : undefined}
      {...item}
    />
  );

  keyExtractor = (item: *) => item.id;

  render() {
    const { knownDevices, steps, editMode, onStepEntered } = this.props;
    const { connecting, connectingId } = this.state;
    const connectingDevice = knownDevices.find(d => d.id === connectingId);

    return (
      <Fragment>
        <FlatList
          contentContainerStyle={styles.root}
          data={knownDevices}
          renderItem={this.renderItem}
          ListHeaderComponent={Header}
          ListFooterComponent={Footer}
          keyExtractor={this.keyExtractor}
        />
        <DeviceJob
          deviceName={connectingDevice ? connectingDevice.name : ""}
          deviceId={connecting && connectingId ? connectingId : null}
          steps={steps}
          onCancel={this.onCancel}
          onStepEntered={onStepEntered}
          onDone={this.onDone}
          editMode={editMode}
        />
      </Fragment>
    );
  }
}

const styles = StyleSheet.create({
  root: {
    padding: 16,
  },
});

export default connect(
  createStructuredSelector({
    knownDevices: knownDevicesSelector,
  }),
  {
    removeKnownDevice,
  },
)(SelectDevice);
