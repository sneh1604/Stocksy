import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  TouchableOpacityProps 
} from 'react-native';
import { colors, typography } from '../../theme';
import { Ionicons } from '@expo/vector-icons';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'small' | 'medium' | 'large';
  iconName?: keyof typeof Ionicons.glyphMap;
  loading?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  title, 
  variant = 'primary',
  size = 'medium',
  iconName,
  loading = false,
  disabled = false,
  style,
  ...props 
}) => {
  const getVariantStyles = () => {
    switch(variant) {
      case 'secondary':
        return styles.secondaryButton;
      case 'outline':
        return styles.outlineButton;
      case 'danger':
        return styles.dangerButton;
      default:
        return styles.primaryButton;
    }
  };

  const getTextStyles = () => {
    switch(variant) {
      case 'outline':
        return styles.outlineText;
      case 'secondary':
      case 'primary':
      case 'danger':
      default:
        return styles.buttonText;
    }
  };

  const getSizeStyles = () => {
    switch(size) {
      case 'small':
        return styles.smallButton;
      case 'large':
        return styles.largeButton;
      default:
        return styles.mediumButton;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getVariantStyles(),
        getSizeStyles(),
        disabled || loading ? styles.disabledButton : {},
        style
      ]}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variant === 'outline' ? colors.primary : colors.white} />
      ) : (
        <>
          {iconName && (
            <Ionicons
              name={iconName}
              size={18}
              color={variant === 'outline' ? colors.primary : colors.white}
              style={styles.icon}
            />
          )}
          <Text style={[
            getTextStyles(),
            disabled ? styles.disabledText : {},
            size === 'small' ? { fontSize: typography.fontSizes.small } : {}
          ]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  secondaryButton: {
    backgroundColor: colors.secondary,
  },
  dangerButton: {
    backgroundColor: colors.danger,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  smallButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  mediumButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  largeButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  buttonText: {
    color: colors.white,
    fontSize: typography.fontSizes.medium,
    fontWeight: "medium",
  },
  outlineText: {
    color: colors.primary,
    fontSize: typography.fontSizes.medium,
    fontWeight: "medium",
  },
  disabledButton: {
    backgroundColor: colors.lightGray,
    borderColor: colors.lightGray
  },
  disabledText: {
    color: colors.gray,
  },
  icon: {
    marginRight: 6,
  }
});

export default Button;