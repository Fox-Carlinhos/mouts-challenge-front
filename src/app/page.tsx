import { UsersTable } from "@/components/commons/user-table";

export default function UsersPage() {
  return (
    <div className="container py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Lista de Usuários</h1>
      <UsersTable />
    </div>
  );
}
