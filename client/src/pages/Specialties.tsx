import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function Specialties() {
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSpecialty, setEditingSpecialty] = useState<{
    id: number;
    name: string;
    description: string | null;
  } | null>(null);

  const { data: specialties, isLoading, refetch } =
    trpc.specialty.list.useQuery();

  const createMutation = trpc.specialty.create.useMutation({
    onSuccess: () => {
      toast.success("Especialidade criada com sucesso");
      setIsDialogOpen(false);
      setEditingSpecialty(null);
      refetch();
    },
    onError: error => {
      toast.error(error.message);
    },
  });

  const updateMutation = trpc.specialty.update.useMutation({
    onSuccess: () => {
      toast.success("Especialidade atualizada com sucesso");
      setIsDialogOpen(false);
      setEditingSpecialty(null);
      refetch();
    },
    onError: error => {
      toast.error(error.message);
    },
  });

  const deleteMutation = trpc.specialty.delete.useMutation({
    onSuccess: () => {
      toast.success("Especialidade removida com sucesso");
      refetch();
    },
    onError: error => {
      toast.error(error.message);
    },
  });

  const isAdmin = user?.role === "admin";

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Especialidades</h1>
            <p className="text-gray-600 mt-2">Gerenciar especialidades médicas</p>
          </div>
          {isAdmin && (
            <Dialog
              open={isDialogOpen}
              onOpenChange={open => {
                setIsDialogOpen(open);
                if (!open) {
                  setEditingSpecialty(null);
                }
              }}
            >
              <DialogTrigger asChild>
                <Button
                  className="flex items-center gap-2"
                  onClick={() => {
                    setEditingSpecialty(null);
                  }}
                >
                  <Plus className="h-4 w-4" />
                  Nova Especialidade
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingSpecialty
                      ? "Editar Especialidade"
                      : "Adicionar Nova Especialidade"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingSpecialty
                      ? "Atualize as informações da especialidade"
                      : "Preencha as informações da especialidade"}
                  </DialogDescription>
                </DialogHeader>
                <SpecialtyForm
                  initialData={
                    editingSpecialty
                      ? {
                          name: editingSpecialty.name,
                          description: editingSpecialty.description ?? "",
                        }
                      : undefined
                  }
                  onSubmit={data => {
                    if (editingSpecialty) {
                      updateMutation.mutate({
                        id: editingSpecialty.id,
                        data,
                      });
                    } else {
                      createMutation.mutate(data);
                    }
                  }}
                  isLoading={
                    createMutation.isPending || updateMutation.isPending
                  }
                  onCancel={() => {
                    setIsDialogOpen(false);
                    setEditingSpecialty(null);
                  }}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Specialties Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Especialidades</CardTitle>
            <CardDescription>
              Total de {specialties?.length || 0} especialidade(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : !specialties || specialties.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Nenhuma especialidade encontrada
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {specialties.map((specialty) => (
                      <TableRow key={specialty.id}>
                        <TableCell className="font-medium">{specialty.name}</TableCell>
                        <TableCell>{specialty.description || "-"}</TableCell>
                        <TableCell className="text-right">
                          {isAdmin && (
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingSpecialty({
                                    id: specialty.id,
                                    name: specialty.name,
                                    description: specialty.description,
                                  });
                                  setIsDialogOpen(true);
                                }}
                              >
                                Editar
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  if (
                                    confirm(
                                      "Tem certeza que deseja remover esta especialidade?"
                                    )
                                  ) {
                                    deleteMutation.mutate({ id: specialty.id });
                                  }
                                }}
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

type SpecialtyFormProps = {
  initialData?: {
    name: string;
    description?: string | null;
  };
  onSubmit: (data: { name: string; description?: string }) => void;
  isLoading: boolean;
  onCancel?: () => void;
};

function SpecialtyForm({
  initialData,
  onSubmit,
  isLoading,
  onCancel,
}: SpecialtyFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name ?? "",
        description: initialData.description ?? "",
      });
    } else {
      setFormData({
        name: "",
        description: "",
      });
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        placeholder="Nome da especialidade"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
      />

      <Input
        placeholder="Descrição (opcional)"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
      />

      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          disabled={isLoading}
          onClick={onCancel}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Salvar Especialidade
        </Button>
      </div>
    </form>
  );
}
