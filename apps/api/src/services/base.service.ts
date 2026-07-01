export abstract class BaseService {
  protected log(context: Record<string, unknown>, message: string): void {
    void context;
    void message;
  }
}
