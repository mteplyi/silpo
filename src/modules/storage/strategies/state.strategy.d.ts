export interface StateStrategy {
  retrieve(): Promise<string | null>;
  save(data: string): Promise<void>;
}
