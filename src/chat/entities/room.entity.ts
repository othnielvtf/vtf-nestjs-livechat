export class Room {
  id: string;
  name: string;
  users: Set<string>; // Set of client IDs
  createdAt: Date;
}
