export const FINANCE_QUOTES = [
    {
        quote: "Compound interest is the eighth wonder of the world.",
        author: "Albert Einstein"
    },
    {
        quote: "What gets measured, gets managed.",
        author: "Peter Drucker"
    },
    {
        quote: "Never spend your money before you have earned it.",
        author: "Thomas Jefferson"
    }
];


export const getQuoteForStep = (step: number) => {
  return FINANCE_QUOTES[step] || FINANCE_QUOTES[0];
};
