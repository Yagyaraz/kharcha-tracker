export const INVITE_COPY = {
  title: "शुभारम्भको हार्दिक निमन्त्रणा",
  brandEnglish: "MOONLIGHT",
  brandNepali: "चौतारी",
  slogan: "स्वाद • साथ • सम्झना",
  defaultSalutation: "आदरणीय शुभेच्छुकज्यूहरू,",
  paragraph1:
    "नेपालमै केही गरौँ भन्ने उद्देश्यका साथ, स्वदेशमै उद्यम गर्ने सोच र प्रयासलाई अघि बढाउँदै, खाजा-नास्तासँगै आत्मीयता र अपनत्व बाँड्ने अभिप्रायले हामीले कीर्तिपुरमा Moonlight चौतारी तपाईंहरूमाझ प्रस्तुत गरेका छौँ ।",
  paragraph2:
    "यसैको शुभारम्भ (उद्घाटन) समारोहमा यहाँहरूको गरिमामय उपस्थितिका साथै सल्लाह, सुझाव, साथ र शुभेच्छाको अपेक्षासहित हार्दिक निमन्त्रणा गर्दछौँ ।",
  callToAction: "आउनुहोस्, स्वाद • साथ • सम्झनाको यो सुन्दर यात्रालाई सँगै सुरु गरौँ ।",
  dateLabel: "मिति:",
  dateValue: "यही भाद्र १९ गते",
  timeLabel: "समय:",
  timeValue: "बिहान १०:०० बजे पश्चात्",
  placeLabel: "स्थान:",
  placeValue: "Moonlight चौतारी, भाजंगल, कीर्तिपुर (शुभकामना पार्टी प्यालेसको आडैमा)",
  closing: "यहाँहरूको उपस्थिति नै हाम्रो लागि हौसला र प्रेरणाको स्रोत हुनेछ ।",
  welcome: "हार्दिक स्वागत तथा निमन्त्रणा",
  cafePhones: "९८४८४४१८१२ | ९८४८३८१६७८",
  family: "Moonlight चौतारी परिवार",
} as const;

export function isPersonalInvite(sambodhan?: string, inviteeName?: string) {
  return Boolean(inviteeName?.trim());
}

export function getInviteBody(personal: boolean) {
  if (!personal) {
    return {
      paragraph1: INVITE_COPY.paragraph1,
      paragraph2: INVITE_COPY.paragraph2,
      closing: INVITE_COPY.closing,
    };
  }

  return {
    paragraph1:
      "नेपालमै केही गरौँ भन्ने उद्देश्यका साथ, स्वदेशमै उद्यम गर्ने सोच र प्रयासलाई अघि बढाउँदै, खाजा-नास्तासँगै आत्मीयता र अपनत्व बाँड्ने अभिप्रायले हामीले कीर्तिपुरमा Moonlight चौतारी तपाईंमाझ प्रस्तुत गरेका छौँ ।",
    paragraph2:
      "यसैको शुभारम्भ (उद्घाटन) समारोहमा यहाँको गरिमामय उपस्थितिका साथै सल्लाह, सुझाव, साथ र शुभेच्छाको अपेक्षासहित हार्दिक निमन्त्रणा गर्दछौँ ।",
    closing: "यहाँको उपस्थिति नै हाम्रो लागि हौसला र प्रेरणाको स्रोत हुनेछ ।",
  };
}

export function formatSalutation(sambodhan?: string, inviteeName?: string) {
  const name = inviteeName?.trim();
  const address = sambodhan?.trim();
  if (!name) return INVITE_COPY.defaultSalutation;
  return `${address ? `${address} ` : ""}${name},`.replace(/\s+/g, " ").trim();
}

const NEPALI_DIGITS = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];

export function toNepaliDigits(value: string) {
  return value.replace(/\d/g, (digit) => NEPALI_DIGITS[Number(digit)]);
}

export function formatPhoneLine(invitorPhone?: string | null) {
  const extra = invitorPhone?.replace(/\D/g, "");
  if (!extra) return INVITE_COPY.cafePhones;
  return `${INVITE_COPY.cafePhones} | ${toNepaliDigits(extra)}`;
}

