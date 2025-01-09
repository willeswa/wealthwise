export const formatCurrency = (amount: number, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};


export const getSymbolFromCurrency = (currency: string) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(123).replace(/[\d.,\s]/g, '');
}

export const formatAmount = (amount: string) => {
  if (!amount) return '';
  const cleanAmount = amount.replace(/,/g, '');
  const [whole, decimal] = cleanAmount.split('.');
  const formattedWhole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return decimal ? `${formattedWhole}.${decimal}` : formattedWhole;
};