"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { type ColumnDef, flexRender, getCoreRowModel, getPaginationRowModel, useReactTable } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { User } from "@/services/user-service";
import { useUsers, useDeleteUser } from "@/services/user-service";
import { CreateUserModal } from "./create-user-modal";
import { EditUserModal } from "./edit-user-modal";
import { DeleteUserModal } from "./delete-user-modal";
import { TableSkeleton } from "./table-skeleton";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

export function UsersTable() {
  const [filtering, setFiltering] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const { data: users = [], isLoading, isError } = useUsers();
  const deleteUserMutation = useDeleteUser();

  const handleDeleteUser = async (id: string) => {
    try {
      await deleteUserMutation.mutateAsync(id);
    } catch (error) {
      console.error("Erro ao excluir usuário:", error);
    }
  };

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "name",
      header: "Nome",
      cell: ({ row }) => {
        const name = row.getValue("name") as string | undefined;
        return name || "Não informado";
      },
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "about",
      header: "Sobre",
      cell: ({ row }) => {
        const about = row.getValue("about") as string | undefined;
        if (!about) return "Não informado";

        const isLongText = about.length > 20;

        return (
          <TooltipProvider>
            {isLongText ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>{`${about.substring(0, 20)}...`}</div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{about}</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <div>{about}</div>
            )}
          </TooltipProvider>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Criado em",
      cell: ({ row }) => {
        const date = row.getValue("createdAt") as string;
        return new Date(date).toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      },
    },
    {
      accessorKey: "updatedAt",
      header: "Atualizado em",
      cell: ({ row }) => {
        const date = row.getValue("updatedAt") as string;
        return new Date(date).toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      },
    },
    {
      accessorKey: "actions",
      header: "Ações",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setSelectedUser(user);
                setEditModalOpen(true);
              }}
            >
              Editar
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setSelectedUser(user);
                setDeleteModalOpen(true);
              }}
            >
              Excluir
            </Button>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      globalFilter: filtering,
    },
    onGlobalFilterChange: setFiltering,
  });

  if (isLoading) {
    return <TableSkeleton />;
  }

  if (isError) {
    return (
      <div className="p-4 rounded-md bg-red-50 border border-red-200">
        <p className="text-red-600">Erro ao carregar os usuários. Tente novamente mais tarde.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Input placeholder="Filtrar usuários..." value={filtering} onChange={(e) => setFiltering(e.target.value)} className="max-w-sm" />
          <CreateUserModal />
        </div>
        <div className="flex items-center space-x-2">
          <Select
            value={table.getState().pagination.pageSize.toString()}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[5, 10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={pageSize.toString()}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Nenhum resultado encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2">
        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
          Anterior
        </Button>
        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
          Próximo
        </Button>
      </div>

      {selectedUser && (
        <>
          <EditUserModal user={selectedUser} open={isEditModalOpen} onClose={() => setEditModalOpen(false)} />
          <DeleteUserModal open={isDeleteModalOpen} onClose={() => setDeleteModalOpen(false)} onConfirm={() => handleDeleteUser(selectedUser.id)} />
        </>
      )}
    </div>
  );
}
