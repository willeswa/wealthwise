import * as Localization from 'expo-localization';
import { DropdownOption } from '../../components/Dropdown';

export interface CountryInfo {
  code: string;
  currency: string;
  name: string;
}

export const SUPPORTED_COUNTRIES: CountryInfo[] = [
  { code: 'AF', currency: 'AFN', name: 'Afghanistan' },
  { code: 'AL', currency: 'ALL', name: 'Albania' },
  { code: 'DZ', currency: 'DZD', name: 'Algeria' },
  { code: 'AD', currency: 'EUR', name: 'Andorra' },
  { code: 'AO', currency: 'AOA', name: 'Angola' },
  { code: 'AR', currency: 'ARS', name: 'Argentina' },
  { code: 'AM', currency: 'AMD', name: 'Armenia' },
  { code: 'AU', currency: 'AUD', name: 'Australia' },
  { code: 'AT', currency: 'EUR', name: 'Austria' },
  { code: 'AZ', currency: 'AZN', name: 'Azerbaijan' },
  { code: 'BS', currency: 'BSD', name: 'Bahamas' },
  { code: 'BH', currency: 'BHD', name: 'Bahrain' },
  { code: 'BD', currency: 'BDT', name: 'Bangladesh' },
  { code: 'BB', currency: 'BBD', name: 'Barbados' },
  { code: 'BY', currency: 'BYN', name: 'Belarus' },
  { code: 'BE', currency: 'EUR', name: 'Belgium' },
  { code: 'BZ', currency: 'BZD', name: 'Belize' },
  { code: 'BJ', currency: 'XOF', name: 'Benin' },
  { code: 'BT', currency: 'BTN', name: 'Bhutan' },
  { code: 'BO', currency: 'BOB', name: 'Bolivia' },
  { code: 'BR', currency: 'BRL', name: 'Brazil' },
  { code: 'BN', currency: 'BND', name: 'Brunei' },
  { code: 'BG', currency: 'BGN', name: 'Bulgaria' },
  { code: 'KH', currency: 'KHR', name: 'Cambodia' },
  { code: 'CM', currency: 'XAF', name: 'Cameroon' },
  { code: 'CA', currency: 'CAD', name: 'Canada' },
  { code: 'CL', currency: 'CLP', name: 'Chile' },
  { code: 'CN', currency: 'CNY', name: 'China' },
  { code: 'CO', currency: 'COP', name: 'Colombia' },
  { code: 'CR', currency: 'CRC', name: 'Costa Rica' },
  { code: 'HR', currency: 'HRK', name: 'Croatia' },
  { code: 'CU', currency: 'CUP', name: 'Cuba' },
  { code: 'CY', currency: 'EUR', name: 'Cyprus' },
  { code: 'CZ', currency: 'CZK', name: 'Czech Republic' },
  { code: 'DK', currency: 'DKK', name: 'Denmark' },
  { code: 'DO', currency: 'DOP', name: 'Dominican Republic' },
  { code: 'EC', currency: 'USD', name: 'Ecuador' },
  { code: 'EG', currency: 'EGP', name: 'Egypt' },
  { code: 'SV', currency: 'USD', name: 'El Salvador' },
  { code: 'EE', currency: 'EUR', name: 'Estonia' },
  { code: 'ET', currency: 'ETB', name: 'Ethiopia' },
  { code: 'FJ', currency: 'FJD', name: 'Fiji' },
  { code: 'FI', currency: 'EUR', name: 'Finland' },
  { code: 'FR', currency: 'EUR', name: 'France' },
  { code: 'GA', currency: 'XAF', name: 'Gabon' },
  { code: 'GM', currency: 'GMD', name: 'Gambia' },
  { code: 'GE', currency: 'GEL', name: 'Georgia' },
  { code: 'DE', currency: 'EUR', name: 'Germany' },
  { code: 'GH', currency: 'GHS', name: 'Ghana' },
  { code: 'GR', currency: 'EUR', name: 'Greece' },
  { code: 'GT', currency: 'GTQ', name: 'Guatemala' },
  { code: 'GN', currency: 'GNF', name: 'Guinea' },
  { code: 'HT', currency: 'HTG', name: 'Haiti' },
  { code: 'HN', currency: 'HNL', name: 'Honduras' },
  { code: 'HK', currency: 'HKD', name: 'Hong Kong' },
  { code: 'HU', currency: 'HUF', name: 'Hungary' },
  { code: 'IS', currency: 'ISK', name: 'Iceland' },
  { code: 'IN', currency: 'INR', name: 'India' },
  { code: 'ID', currency: 'IDR', name: 'Indonesia' },
  { code: 'IR', currency: 'IRR', name: 'Iran' },
  { code: 'IQ', currency: 'IQD', name: 'Iraq' },
  { code: 'IE', currency: 'EUR', name: 'Ireland' },
  { code: 'IL', currency: 'ILS', name: 'Israel' },
  { code: 'IT', currency: 'EUR', name: 'Italy' },
  { code: 'JM', currency: 'JMD', name: 'Jamaica' },
  { code: 'JP', currency: 'JPY', name: 'Japan' },
  { code: 'JO', currency: 'JOD', name: 'Jordan' },
  { code: 'KZ', currency: 'KZT', name: 'Kazakhstan' },
  { code: 'KE', currency: 'KES', name: 'Kenya' },
  { code: 'KR', currency: 'KRW', name: 'South Korea' },
  { code: 'KW', currency: 'KWD', name: 'Kuwait' },
  { code: 'LB', currency: 'LBP', name: 'Lebanon' },
  { code: 'LS', currency: 'LSL', name: 'Lesotho' },
  { code: 'LR', currency: 'LRD', name: 'Liberia' },
  { code: 'LY', currency: 'LYD', name: 'Libya' },
  { code: 'LT', currency: 'EUR', name: 'Lithuania' },
  { code: 'LU', currency: 'EUR', name: 'Luxembourg' },
  { code: 'MG', currency: 'MGA', name: 'Madagascar' },
  { code: 'MW', currency: 'MWK', name: 'Malawi' },
  { code: 'MY', currency: 'MYR', name: 'Malaysia' },
  { code: 'MV', currency: 'MVR', name: 'Maldives' },
  { code: 'ML', currency: 'XOF', name: 'Mali' },
  { code: 'MT', currency: 'EUR', name: 'Malta' },
  { code: 'MR', currency: 'MRU', name: 'Mauritania' },
  { code: 'MU', currency: 'MUR', name: 'Mauritius' },
  { code: 'MX', currency: 'MXN', name: 'Mexico' },
  { code: 'MD', currency: 'MDL', name: 'Moldova' },
  { code: 'MC', currency: 'EUR', name: 'Monaco' },
  { code: 'MN', currency: 'MNT', name: 'Mongolia' },
  { code: 'MA', currency: 'MAD', name: 'Morocco' },
  { code: 'MZ', currency: 'MZN', name: 'Mozambique' },
  { code: 'MM', currency: 'MMK', name: 'Myanmar' },
  { code: 'NA', currency: 'NAD', name: 'Namibia' },
  { code: 'NP', currency: 'NPR', name: 'Nepal' },
  { code: 'NL', currency: 'EUR', name: 'Netherlands' },
  { code: 'NZ', currency: 'NZD', name: 'New Zealand' },
  { code: 'NI', currency: 'NIO', name: 'Nicaragua' },
  { code: 'NE', currency: 'XOF', name: 'Niger' },
  { code: 'NG', currency: 'NGN', name: 'Nigeria' },
  { code: 'NO', currency: 'NOK', name: 'Norway' },
  { code: 'OM', currency: 'OMR', name: 'Oman' },
  { code: 'PK', currency: 'PKR', name: 'Pakistan' },
  { code: 'PA', currency: 'PAB', name: 'Panama' },
  { code: 'PG', currency: 'PGK', name: 'Papua New Guinea' },
  { code: 'PY', currency: 'PYG', name: 'Paraguay' },
  { code: 'PE', currency: 'PEN', name: 'Peru' },
  { code: 'PH', currency: 'PHP', name: 'Philippines' },
  { code: 'PL', currency: 'PLN', name: 'Poland' },
  { code: 'PT', currency: 'EUR', name: 'Portugal' },
  { code: 'QA', currency: 'QAR', name: 'Qatar' },
  { code: 'RO', currency: 'RON', name: 'Romania' },
  { code: 'RU', currency: 'RUB', name: 'Russia' },
  { code: 'RW', currency: 'RWF', name: 'Rwanda' },
  { code: 'SA', currency: 'SAR', name: 'Saudi Arabia' },
  { code: 'SN', currency: 'XOF', name: 'Senegal' },
  { code: 'RS', currency: 'RSD', name: 'Serbia' },
  { code: 'SG', currency: 'SGD', name: 'Singapore' },
  { code: 'SK', currency: 'EUR', name: 'Slovakia' },
  { code: 'SI', currency: 'EUR', name: 'Slovenia' },
  { code: 'SO', currency: 'SOS', name: 'Somalia' },
  { code: 'ZA', currency: 'ZAR', name: 'South Africa' },
  { code: 'ES', currency: 'EUR', name: 'Spain' },
  { code: 'LK', currency: 'LKR', name: 'Sri Lanka' },
  { code: 'SD', currency: 'SDG', name: 'Sudan' },
  { code: 'SE', currency: 'SEK', name: 'Sweden' },
  { code: 'CH', currency: 'CHF', name: 'Switzerland' },
  { code: 'SY', currency: 'SYP', name: 'Syria' },
  { code: 'TW', currency: 'TWD', name: 'Taiwan' },
  { code: 'TJ', currency: 'TJS', name: 'Tajikistan' },
  { code: 'TZ', currency: 'TZS', name: 'Tanzania' },
  { code: 'TH', currency: 'THB', name: 'Thailand' },
  { code: 'TG', currency: 'XOF', name: 'Togo' },
  { code: 'TT', currency: 'TTD', name: 'Trinidad and Tobago' },
  { code: 'TN', currency: 'TND', name: 'Tunisia' },
  { code: 'TR', currency: 'TRY', name: 'Turkey' },
  { code: 'TM', currency: 'TMT', name: 'Turkmenistan' },
  { code: 'UG', currency: 'UGX', name: 'Uganda' },
  { code: 'UA', currency: 'UAH', name: 'Ukraine' },
  { code: 'AE', currency: 'AED', name: 'United Arab Emirates' },
  { code: 'GB', currency: 'GBP', name: 'United Kingdom' },
  { code: 'US', currency: 'USD', name: 'United States' },
  { code: 'UY', currency: 'UYU', name: 'Uruguay' },
  { code: 'UZ', currency: 'UZS', name: 'Uzbekistan' },
  { code: 'VE', currency: 'VES', name: 'Venezuela' },
  { code: 'VN', currency: 'VND', name: 'Vietnam' },
  { code: 'YE', currency: 'YER', name: 'Yemen' },
  { code: 'ZM', currency: 'ZMW', name: 'Zambia' },
  { code: 'ZW', currency: 'ZWL', name: 'Zimbabwe' }
];

// Map of language codes to likely country codes
const LANGUAGE_COUNTRY_MAP: Record<string, string> = {
  en: 'US', // English -> United States
  es: 'ES', // Spanish -> Spain
  fr: 'FR', // French -> France
  pt: 'PT', // Portuguese -> Portugal
  ar: 'SA', // Arabic -> Saudi Arabia
  zh: 'CN', // Chinese -> China
  hi: 'IN', // Hindi -> India
  sw: 'KE', // Swahili -> Kenya
  // Add more mappings as needed
};

export const getCountryOptions = (): DropdownOption[] => {
  return SUPPORTED_COUNTRIES.map(country => ({
    label: country.name,
    value: country.code,
    icon: 'flag'
  }));
};

export const getCountryInfo = (countryCode: string): CountryInfo => {
  return (
    SUPPORTED_COUNTRIES.find(c => c.code === countryCode) || 
    SUPPORTED_COUNTRIES.find(c => c.code === 'US')!
  );
};

export const getUserCountry = (): CountryInfo => {
  // First try to get country from device region
  const deviceRegion = Localization.region?.toUpperCase();
  if (deviceRegion && SUPPORTED_COUNTRIES.some(c => c.code === deviceRegion)) {
    return getCountryInfo(deviceRegion);
  }

  // If no region, try to guess from language
  const [languageCode] = Localization.locale.split('-');
  const countryFromLanguage = LANGUAGE_COUNTRY_MAP[languageCode];
  if (countryFromLanguage) {
    return getCountryInfo(countryFromLanguage);
  }

  // If all else fails, return US as default
  return getCountryInfo('KE');
};
