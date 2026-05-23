export interface ServerError {
  Message: string;
  Details: Details;
  Timestamp: string;
}

export interface Details {
  Errors: Errors;
}

export type Errors = Record<string, string[]>;
