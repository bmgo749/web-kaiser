import { users, type User, type InsertUser } from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface MessageTemplate {
  id: string;
  name: string;
  content: string;
  createdBy: string;
  createdAt: Date;
}

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getTemplates(): Promise<MessageTemplate[]>;
  addTemplate(template: Omit<MessageTemplate, 'id' | 'createdAt'>): Promise<MessageTemplate>;
  deleteTemplate(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private templates: Map<string, MessageTemplate>;
  currentId: number;

  constructor() {
    this.users = new Map();
    this.templates = new Map();
    this.currentId = 1;
    
    // Add default admin users
    this.initializeDefaultUsers();
    
    // Add default templates
    this.initializeDefaultTemplates();
  }

  private async initializeDefaultUsers() {
    // Add Tupolev admin
    await this.createUser({
      username: 'Tupolev',
      password: 'SS01A1010?N*'
    });
    
    // Add Aldxx admin
    await this.createUser({
      username: 'Aldxx',
      password: 'AD82A0283!P@&'
    });
  }

  private initializeDefaultTemplates() {
    // Templates are now managed globally by admins
    // No default templates - all templates are created by admin users
    console.log('Template storage initialized - no default templates');
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getTemplates(): Promise<MessageTemplate[]> {
    return Array.from(this.templates.values());
  }

  async addTemplate(template: Omit<MessageTemplate, 'id' | 'createdAt'>): Promise<MessageTemplate> {
    const newTemplate: MessageTemplate = {
      ...template,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    this.templates.set(newTemplate.id, newTemplate);
    return newTemplate;
  }

  async deleteTemplate(id: string): Promise<boolean> {
    return this.templates.delete(id);
  }
}

export const storage = new MemStorage();
