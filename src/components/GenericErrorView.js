/* @flow */
import React, { PureComponent } from "react";
import { View, StyleSheet } from "react-native";

import colors from "../colors";
import LText from "./LText";
import ErrorIcon from "./ErrorIcon";
import TranslatedError from "./TranslatedError";

class GenericErrorRendering extends PureComponent<{
  error: Error,
  withDescription: boolean,
  withIcon: boolean,
}> {
  static defaultProps = {
    withDescription: true,
    withIcon: true,
  };

  render() {
    const { error, withDescription, withIcon } = this.props;
    return (
      <View style={styles.root}>
        {withIcon ? (
          <View style={styles.headIcon}>
            <ErrorIcon error={error} />
          </View>
        ) : null}
        <LText
          selectable
          secondary
          semiBold
          style={styles.title}
          numberOfLines={3}
        >
          <TranslatedError error={error} />
        </LText>
        {withDescription ? (
          <LText selectable style={styles.description} numberOfLines={6}>
            <TranslatedError error={error} field="description" />
          </LText>
        ) : null}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  root: {
    flexDirection: "column",
    alignItems: "center",
    marginVertical: 24,
  },
  headIcon: {
    padding: 10,
  },
  title: {
    paddingVertical: 20,
    paddingHorizontal: 40,
    lineHeight: 26,
    fontSize: 16,
    color: colors.darkBlue,
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    color: colors.smoke,
    paddingHorizontal: 24,
    textAlign: "center",
  },
});

export default GenericErrorRendering;
