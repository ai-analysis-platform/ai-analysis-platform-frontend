import { atom } from "jotai";

export type Company = {
  id: string;
  name: string;
  ceo: string;
};

export type KeywordSelection = {
  industries: string[];
  competitors: string[];
  macros: string[];
};

export type KeywordAlertFrequency = "daily" | "weekday" | "weekly" | "custom";

export const companyState = atom<Company | null>(null);

export const keywordSelectionState = atom<KeywordSelection>({
  industries: [],
  competitors: [],
  macros: [],
});

export const keywordAlertFrequencyState = atom<KeywordAlertFrequency>("daily");
export const keywordAlertCustomDaysState = atom<number>(3);
export const keywordAlertCustomTimeState = atom<string>("09:00");

export const selectedDailyDateState = atom<Date>(new Date());

export const dailyNewsOrderState = atom<{ kor: string[]; eng: string[] }>({
  kor: [],
  eng: [],
});
