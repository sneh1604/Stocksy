import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { darkColors } from '../../theme/darkTheme';

const Card: React.FC<ViewProps> = ({ children, style, ...props }) => {
  return (
    <View 
      style={[
        styles.card,
        { backgroundColor: darkColors.surface },
        style
      ]} 
      {...props}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    elevation: 2,
    shadowColor: darkColors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

export default Card;