/* @flow */
import React, { PureComponent } from "react";
import { View, StyleSheet } from "react-native";
import { Trans } from "react-i18next";
import LText from "../../components/LText";
import colors from "../../colors";
import Touchable from "../../components/Touchable";

type Props = {
  data: string[],
  title?: React$Node,
};
type State = {
  showAll: boolean,
};
export default class DataList extends PureComponent<Props, State> {
  state = {
    showAll: false,
  };

  toggleShowAll = () => {
    this.setState(({ showAll }) => ({ showAll: !showAll }));
  };

  // TODO make it more generic with title definition in parent
  render() {
    const { data, title } = this.props;
    const { showAll } = this.state;
    const numToShow = 2;
    const shouldShowMore = data.length > numToShow;
    return (
      <View>
        <View style={{ flexDirection: "row" }}>
          {title && <LText style={styles.sectionTitle}>{title}</LText>}
          {shouldShowMore && (
            <Touchable
              event="OperationDetailsShowMore"
              onPress={() => {
                this.toggleShowAll();
              }}
            >
              {showAll ? (
                <LText style={{ color: colors.live }}>
                  <Trans i18nKey="operationDetails.seeLess" />
                </LText>
              ) : (
                <LText style={{ color: colors.live }}>
                  <Trans i18nKey="operationDetails.seeAll" />
                </LText>
              )}
            </Touchable>
          )}
        </View>
        {(shouldShowMore ? data.slice(0, numToShow) : data).map(line => (
          <LText semiBold selectable key={line}>
            {line}
          </LText>
        ))}
        {showAll &&
          data.slice(numToShow).map(line => (
            <LText semiBold selectable key={line}>
              {line}
            </LText>
          ))}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 14,
    color: colors.grey,
    marginBottom: 8,
    marginRight: 8,
  },
});
