export type ApiTermCode =
  "TERMS_OF_SERVICE" | "PRIVACY_POLICY" | "EMAIL_MARKETING" | "SMS_MARKETING";

export type ApiTermType = "SERVICE" | "PRIVACY" | "MARKETING";

export type ApiActiveTerm = {
  termId: number;
  termCode: ApiTermCode;
  termName: string;
  termType: ApiTermType;
  required: boolean;
  version: string;
  content: string;
  effectiveAt: string;
};
