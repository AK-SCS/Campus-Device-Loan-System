
import { Loan } from './loan';

export interface LoanRepo {

  list(): Promise<Loan[]>;

  getById(id: string): Promise<Loan | null>;

  getByUserId(userId: string): Promise<Loan[]>;

  getByDeviceId(deviceId: string): Promise<Loan[]>;

  save(loan: Loan): Promise<Loan>;

  delete(id: string): Promise<void>;
}
