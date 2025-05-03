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
import { darkColors } from '../../theme/darkTheme';

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
        return { backgroundColor: darkColors.surfaceVariant };
      case 'outline':
        return { 
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: darkColors.primary 
        };
      case 'danger':
        return { backgroundColor: darkColors.error };
      default:
        return { backgroundColor: darkColors.primary };
    }
  };

  const getTextStyles = () => {
    switch(variant) {
      case 'outline':
        return { color: darkColors.primary };
      case 'secondary':
      case 'primary':
      case 'danger':
      default:
        return { color: darkColors.text };
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
        disabled || loading ? { backgroundColor: darkColors.disabledButton } : {},
        style
      ]}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'outline' ? darkColors.primary : darkColors.text} 
        />
      ) : (
        <>
          {iconName && (
            <Ionicons
              name={iconName}
              size={18}
              color={variant === 'outline' ? darkColors.primary : darkColors.text}
              style={styles.icon}
            />
          )}
          <Text style={[
            styles.buttonText,
            getTextStyles(),
            disabled ? { color: darkColors.textSecondary } : {},
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
  buttonText: {
    fontSize: typography.fontSizes.medium,
    fontWeight: "500",
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
  icon: {
    marginRight: 6,
  }
});

export default Button;