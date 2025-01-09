import { colors } from '@/utils/colors'
import { formatAmount, getSymbolFromCurrency } from '@/utils/format'
import { StyleProp, StyleSheet, Text, TextStyle, View } from 'react-native'

type AmountCurrencyViewProps = {
  amount: number
  currency: string
  style?: StyleProp<TextStyle>
}

export const AmountCurrencyView = ({
  amount,
  currency,
  style
}: AmountCurrencyViewProps) => {
  // Extract the font size from the passed style or use the default font size
  const amountFontSize = StyleSheet.flatten(style)?.fontSize || 18
  const currencyFontSize = amountFontSize * 0.7

  return (
    <View style={styles.container}>
      <Text style={[styles.currency, { fontSize: currencyFontSize }]}>
        {getSymbolFromCurrency(currency)}
      </Text>
      <Text style={[styles.amount, style]}>{formatAmount(amount.toString())}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amount: {
    fontWeight: 'bold'
  },
  currency: {
    color: colors.text.secondary,
    fontWeight: 'bold',
    marginRight: 2
  }
})
