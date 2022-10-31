export type Model = Record<string, unknown>;
type ResultsType = Model | Model[] | number | string[] | boolean;

export type Results<T extends ResultsType> = T;

export interface API<P = {}, T = Results<ResultsType>> {
  Paramas: P;
  Results: T;
}

export interface APIFunc<T extends API> {
  (paramas: T['Paramas']): Promise<T['Results']>;
}
