import { CosmosClient, Container } from "@azure/cosmos";
import { LoanRepo } from "../domain/loan-repo.js";
import { Loan } from "../domain/loan.js";

export class CosmosLoanRepo implements LoanRepo {
  private container: Container;

  constructor(connectionString: string, databaseName: string = "campus-device-loan", containerName: string = "loans") {
    const client = new CosmosClient(connectionString);
    const database = client.database(databaseName);
    this.container = database.container(containerName);
  }

  async save(loan: Loan): Promise<Loan> {
    try {

      const { resource } = await this.container.items.upsert({
        id: loan.id,
        ...loan,
        _type: "loan" 
      });

      if (!resource) {
        throw new Error("Failed to save loan to Cosmos DB");
      }

      const { _rid, _self, _etag, _attachments, _ts, _type, ...cleanLoan } = resource;
      return cleanLoan as Loan;
    } catch (error) {
      console.error("Error saving loan to Cosmos DB:", error);
      throw new Error(`Failed to save loan: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async list(): Promise<Loan[]> {
    try {
      const { resources } = await this.container.items
        .query({
          query: "SELECT * FROM c WHERE c._type = @type",
          parameters: [{ name: "@type", value: "loan" }]
        })
        .fetchAll();

      return resources.map(this.cleanLoan);
    } catch (error) {
      console.error("Error fetching loans from Cosmos DB:", error);
      throw new Error(`Failed to fetch loans: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getByUserId(userId: string): Promise<Loan[]> {
    try {
      const { resources } = await this.container.items
        .query({
          query: "SELECT * FROM c WHERE c._type = @type AND c.userId = @userId",
          parameters: [
            { name: "@type", value: "loan" },
            { name: "@userId", value: userId }
          ]
        })
        .fetchAll();

      return resources.map(this.cleanLoan);
    } catch (error) {
      console.error("Error fetching loans by user ID from Cosmos DB:", error);
      throw new Error(`Failed to fetch loans by user ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getByDeviceId(deviceId: string): Promise<Loan[]> {
    try {
      const { resources } = await this.container.items
        .query({
          query: "SELECT * FROM c WHERE c._type = @type AND c.deviceId = @deviceId",
          parameters: [
            { name: "@type", value: "loan" },
            { name: "@deviceId", value: deviceId }
          ]
        })
        .fetchAll();

      return resources.map(this.cleanLoan);
    } catch (error) {
      console.error("Error fetching loans by device ID from Cosmos DB:", error);
      throw new Error(`Failed to fetch loans by device ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findByStatus(status: 'reserved' | 'collected' | 'returned' | 'overdue'): Promise<Loan[]> {
    try {
      const { resources } = await this.container.items
        .query({
          query: "SELECT * FROM c WHERE c._type = @type AND c.status = @status",
          parameters: [
            { name: "@type", value: "loan" },
            { name: "@status", value: status }
          ]
        })
        .fetchAll();

      return resources.map(this.cleanLoan);
    } catch (error) {
      console.error("Error fetching loans by status from Cosmos DB:", error);
      throw new Error(`Failed to fetch loans by status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findOverdueLoans(): Promise<Loan[]> {
    try {
      const now = new Date();
      const { resources } = await this.container.items
        .query({
          query: "SELECT * FROM c WHERE c._type = @type AND c.status IN (@collected, @overdue) AND c.dueDate < @now",
          parameters: [
            { name: "@type", value: "loan" },
            { name: "@collected", value: "collected" },
            { name: "@overdue", value: "overdue" },
            { name: "@now", value: now.toISOString() }
          ]
        })
        .fetchAll();

      return resources.map(this.cleanLoan);
    } catch (error) {
      console.error("Error fetching overdue loans from Cosmos DB:", error);
      throw new Error(`Failed to fetch overdue loans: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getById(id: string): Promise<Loan | null> {
    try {
      const { resource } = await this.container.item(id, id).read();

      if (!resource || resource._type !== "loan") {
        return null;
      }

      return this.cleanLoan(resource);
    } catch (error: any) {
      if (error.code === 404) {
        return null;
      }
      console.error("Error fetching loan by id from Cosmos DB:", error);
      throw new Error(`Failed to fetch loan by id: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.container.item(id, id).delete();
    } catch (error: any) {
      if (error.code === 404) {

        return;
      }
      console.error("Error deleting loan from Cosmos DB:", error);
      throw new Error(`Failed to delete loan: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private cleanLoan(resource: any): Loan {
    const { _rid, _self, _etag, _attachments, _ts, _type, ...loan } = resource;

    if (loan.reservedDate && typeof loan.reservedDate === 'string') {
      loan.reservedDate = new Date(loan.reservedDate);
    }
    if (loan.collectedDate && typeof loan.collectedDate === 'string') {
      loan.collectedDate = new Date(loan.collectedDate);
    }
    if (loan.returnedDate && typeof loan.returnedDate === 'string') {
      loan.returnedDate = new Date(loan.returnedDate);
    }
    if (loan.dueDate && typeof loan.dueDate === 'string') {
      loan.dueDate = new Date(loan.dueDate);
    }
    return loan as Loan;
  }
}