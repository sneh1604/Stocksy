import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { colors, shadows } from '../../theme';

interface CardProps extends ViewProps {
  elevation?: 'small' | 'medium' | 'large' | 'none';
}

const Card: React.FC<CardProps> = ({ 
  children, 
  style, 
  elevation = 'small',
  ...props 
}) => {
  const cardShadow = elevation !== 'none' ? shadows[elevation] : {};
  
  return (
    <View 
      style={[styles.card, cardShadow, style]} 
      {...props}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: colors.border
  },
});

export default Card;