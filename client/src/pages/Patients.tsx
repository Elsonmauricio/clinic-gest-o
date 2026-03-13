import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Plus, Search, Edit2, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function Patients() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { data: patients, isLoading, refetch } = trpc.patient.list.useQuery();
  const createMutation = trpc.patient.create.useMutation({
    onSuccess: () => {
      toast.success("Paciente criado com sucesso");
      setIsDialogOpen(false);
      setEditingId(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = trpc.patient.delete.useMutation({
    onSuccess: () => {
      toast.success("Paciente removido com sucesso");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateMutation = trpc.patient.update.useMutation({
    onSuccess: () => {
      toast.success("Paciente atualizado com sucesso");
      setIsDialogOpen(false);
      setEditingId(null);
      refetch();
    },
    onError: error => {
      toast.error(error.message);
    },
  });

  const editingPatient = useMemo(
    () => patients?.find(p => p.id === editingId) ?? null,
    [editingId, patients]
  );

  const filteredPatients = patients?.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.email.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const isAdmin = user?.role === "admin";

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pacientes</h1>
            <p className="text-gray-600 mt-2">Gerenciar informações dos pacientes</p>
          </div>
          {isAdmin && (
            <Dialog
              open={isDialogOpen}
              onOpenChange={open => {
                setIsDialogOpen(open);
                if (!open) {
                  setEditingId(null);
                }
              }}
            >
              <DialogTrigger asChild>
                <Button
                  className="flex items-center gap-2"
                  onClick={() => setEditingId(null)}
                >
                  <Plus className="h-4 w-4" />
                  Novo Paciente
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingPatient ? "Editar Paciente" : "Adicionar Novo Paciente"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingPatient
                      ? "Atualize as informações do paciente"
                      : "Preencha as informações do paciente"}
                  </DialogDescription>
                </DialogHeader>
                <PatientForm
                  initialData={
                    editingPatient
                      ? {
                          name: editingPatient.name,
                          email: editingPatient.email,
                          phone: editingPatient.phone,
                          dateOfBirth: new Date(
                            editingPatient.dateOfBirth as unknown as string
                          )
                            .toISOString()
                            .slice(0, 10),
                          cpf: editingPatient.cpf,
                          address: editingPatient.address ?? "",
                          city: editingPatient.city ?? "",
                          state: editingPatient.state ?? "",
                          zipCode: editingPatient.zipCode ?? "",
                          emergencyContact: editingPatient.emergencyContact ?? "",
                          emergencyPhone: editingPatient.emergencyPhone ?? "",
                        }
                      : undefined
                  }
                  onSubmit={data => {
                    if (editingPatient) {
                      updateMutation.mutate({
                        id: editingPatient.id,
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
                    setEditingId(null);
                  }}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5 text-gray-400" />
              <Input
                placeholder="Buscar por nome ou email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
            </div>
          </CardContent>
        </Card>

        {/* Patients Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Pacientes</CardTitle>
            <CardDescription>
              Total de {filteredPatients.length} paciente(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : filteredPatients.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Nenhum paciente encontrado
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead>CPF</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPatients.map((patient) => (
                      <TableRow key={patient.id}>
                        <TableCell className="font-medium">{patient.name}</TableCell>
                        <TableCell>{patient.email}</TableCell>
                        <TableCell>{patient.phone}</TableCell>
                        <TableCell>{patient.cpf}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {isAdmin && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setEditingId(patient.id);
                                    setIsDialogOpen(true);
                                  }}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    if (confirm("Tem certeza que deseja remover este paciente?")) {
                                      deleteMutation.mutate({ id: patient.id });
                                    }
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 text-red-600" />
                                </Button>
                              </>
                            )}
                          </div>
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

type PatientFormProps = {
  initialData?: {
    name: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    cpf: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    emergencyContact?: string;
    emergencyPhone?: string;
  };
  onSubmit: (data: any) => void;
  isLoading: boolean;
  onCancel?: () => void;
};

function PatientForm({ initialData, onSubmit, isLoading, onCancel }: PatientFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    cpf: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    emergencyContact: "",
    emergencyPhone: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name ?? "",
        email: initialData.email ?? "",
        phone: initialData.phone ?? "",
        dateOfBirth: initialData.dateOfBirth ?? "",
        cpf: initialData.cpf ?? "",
        address: initialData.address ?? "",
        city: initialData.city ?? "",
        state: initialData.state ?? "",
        zipCode: initialData.zipCode ?? "",
        emergencyContact: initialData.emergencyContact ?? "",
        emergencyPhone: initialData.emergencyPhone ?? "",
      });
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        dateOfBirth: "",
        cpf: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        emergencyContact: "",
        emergencyPhone: "",
      });
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          placeholder="Nome completo"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
        <Input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          placeholder="Telefone"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          required
        />
        <Input
          type="date"
          placeholder="Data de nascimento"
          value={formData.dateOfBirth}
          onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          placeholder="CPF"
          value={formData.cpf}
          onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
          required
        />
        <Input
          placeholder="Endereço"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Input
          placeholder="Cidade"
          value={formData.city}
          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
        />
        <Input
          placeholder="Estado"
          value={formData.state}
          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
          maxLength={2}
        />
        <Input
          placeholder="CEP"
          value={formData.zipCode}
          onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          placeholder="Contato de emergência"
          value={formData.emergencyContact}
          onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
        />
        <Input
          placeholder="Telefone de emergência"
          value={formData.emergencyPhone}
          onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
        />
      </div>

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
          Salvar Paciente
        </Button>
      </div>
    </form>
  );
}
