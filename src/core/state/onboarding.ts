import { atom } from "jotai";

export type Company = {
  id: string;
  name: string;
  ceo: string;
};

export type KeywordSelection = {
  industries: string[];
  competitors: string[];
  custom: string[];
};

export const companyState = atom<Company | null>(null);

export const keywordSelectionState = atom<KeywordSelection>({
  industries: [],
  competitors: [],
  custom: [],
});

export const selectedDailyDateState = atom<Date>(new Date());

export const dailyNewsOrderState = atom<string[]>([]);
