export type AdminSessionUser = {
  id?: string;
  name?: string;
  email?: string;
  image?: string | null;
  role?: string;
  bio?: string;
};

export type CourseSummary = {
  _id: string;
  title: string;
  category: string;
  status: string;
  createdAt: string | Date;
  teacher?: {
    name?: string;
  } | null;
  isFree?: boolean;
  price?: number;
};

export type UserSummary = {
  _id: string;
  name?: string;
  email?: string;
  roles?: string[] | string | null;
  createdAt: string | Date;
};

export type SystemSetting = {
  key: string;
  value: unknown;
};

export type SettingValue = string | number | boolean | null | Record<string, unknown>;
