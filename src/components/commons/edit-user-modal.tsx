"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateUser } from "@/services/user-service";
import type { UpdateUserInput, User } from "@/services/user-service";
import { Eye, EyeOff } from "lucide-react";
import { useState, useEffect } from "react";

const formSchema = z.object({
  name: z.string().optional(),
  email: z.string().email("Email inválido").optional(),
  about: z.string().optional(),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres").optional(),
});

interface EditUserModalProps {
  user: User;
  open: boolean;
  onClose: () => void;
}

export function EditUserModal({ user, open, onClose }: EditUserModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const updateUser = useUpdateUser();

  const form = useForm<Omit<UpdateUserInput, "id">>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      about: user.about,
      password: undefined,
    },
  });

  useEffect(() => {
    form.reset({
      name: user.name,
      email: user.email,
      about: user.about,
      password: undefined,
    });
  }, [user, form]);

  const onSubmit = async (data: Omit<UpdateUserInput, "id">) => {
    try {
      const userData = {
        name: data.name,
        email: data.email,
        about: data.about,
        ...(data.password ? { password: data.password } : {}),
      };

      await updateUser.mutateAsync({ id: user.id, user: userData });
      onClose();
      form.reset();
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Usuário</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite o nome" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite o email" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="about"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sobre</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Digite uma descrição" className="resize-none" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input placeholder="Digite a senha" type={showPassword ? "text" : "password"} {...field} />
                      <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={updateUser.isPending}>
                {updateUser.isPending ? "Atualizando..." : "Atualizar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
