import { StyleSheet } from 'react-native';
import { spacing, typography } from './index';
import { darkColors } from './darkTheme';

export const marketStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.medium,
  },
  stockCard: {
    backgroundColor: darkColors.surface,
    marginBottom: spacing.small,
    borderRadius: 8,
    padding: spacing.medium,
  },
  stockInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stockName: {
    fontSize: typography.fontSizes.medium,
    fontWeight: 'bold',
    color: darkColors.text,
  },
  stockSymbol: {
    fontSize: typography.fontSizes.small,
    color: darkColors.textSecondary,
  },
  priceInfo: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: typography.fontSizes.medium,
    fontWeight: 'bold',
    color: darkColors.text,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginTop: 4,
  },
  profitChange: {
    backgroundColor: darkColors.profitLight,
  },
  lossChange: {
    backgroundColor: darkColors.lossLight,
  },
  changeText: {
    fontSize: typography.fontSizes.small,
    marginLeft: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
