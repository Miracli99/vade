import { ReactNode, useState } from "react";
import { LayoutChangeEvent, StyleSheet, View } from "react-native";

type MasonryListProps<T> = {
  items: T[];
  minColumnWidth: number;
  maxColumns?: number;
  getKey: (item: T) => string;
  renderItem: (item: T) => ReactNode;
};

export function MasonryList<T>({
  items,
  minColumnWidth,
  maxColumns = 3,
  getKey,
  renderItem,
}: MasonryListProps<T>) {
  const [containerWidth, setContainerWidth] = useState(0);
  const columnCount = containerWidth
    ? Math.min(maxColumns, Math.max(1, Math.floor(containerWidth / minColumnWidth)))
    : 1;
  const columns = Array.from(
    { length: columnCount },
    () => [] as T[],
  );

  items.forEach((item, index) => {
    columns[index % columns.length]!.push(item);
  });

  function handleLayout(event: LayoutChangeEvent) {
    setContainerWidth(event.nativeEvent.layout.width);
  }

  return (
    <View style={styles.columns} onLayout={handleLayout}>
      {columns.map((column, columnIndex) => (
        <View key={columnIndex} style={styles.column}>
          {column.map((item) => (
            <View key={getKey(item)}>{renderItem(item)}</View>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  columns: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
  },
  column: {
    flex: 1,
    gap: 14,
  },
});
