import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Plus, Search, Edit2, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function Doctors() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { data: doctors, isLoading, refetch } = trpc.doctor.list.useQuery();
  const { data: specialties } = trpc.specialty.list.useQuery();

  const createMutation = trpc.doctor.create.useMutation({
    onSuccess: data => {
      toast.success(
        data?.message ??
          "Médico criado com sucesso"
      );
      setIsDialogOpen(false);
      setEditingId(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = trpc.doctor.delete.useMutation({
    onSuccess: () => {
      toast.success("Médico removido com sucesso");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateMutation = trpc.doctor.update.useMutation({
    onSuccess: () => {
      toast.success("Médico atualizado com sucesso");
      setIsDialogOpen(false);
      setEditingId(null);
      refetch();
    },
    onError: error => {
      toast.error(error.message);
    },
  });

  const filteredDoctors = doctors?.filter(d =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.email.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const editingDoctor = useMemo(
    () => doctors?.find(d => d.id === editingId) ?? null,
    [doctors, editingId]
  );

  const specialtyMap = useMemo(
    () =>
      new Map(
        (specialties ?? []).map(spec => [spec.id as number, spec.name as string])
      ),
    [specialties]
  );

  const isAdmin = user?.role === "admin";

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Médicos</h1>
            <p className="text-gray-600 mt-2">Gerenciar informações dos médicos</p>
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
                  Novo Médico
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingDoctor ? "Editar Médico" : "Adicionar Novo Médico"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingDoctor
                      ? "Atualize as informações do médico"
                      : "Preencha os dados. O número de registro profissional (CRM) é gerado automaticamente no formato CRM-000001."}
                  </DialogDescription>
                </DialogHeader>
                <DoctorForm
                  specialties={specialties || []}
                  initialData={
                    editingDoctor
                      ? {
                          name: editingDoctor.name,
                          email: editingDoctor.email,
                          phone: editingDoctor.phone,
                          specialtyId: editingDoctor.specialtyId,
                          bio: editingDoctor.bio ?? "",
                        }
                      : undefined
                  }
                  onSubmit={data => {
                    if (editingDoctor) {
                      updateMutation.mutate({
                        id: editingDoctor.id,
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

        {/* Doctors Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Médicos</CardTitle>
            <CardDescription>
              Total de {filteredDoctors.length} médico(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : filteredDoctors.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Nenhum médico encontrado
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead>Especialidade</TableHead>
                      <TableHead>Registro</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDoctors.map((doctor) => (
                      <TableRow key={doctor.id}>
                        <TableCell className="font-medium">{doctor.name}</TableCell>
                        <TableCell>{doctor.email}</TableCell>
                        <TableCell>{doctor.phone}</TableCell>
                      <TableCell>
                        {specialtyMap.get(doctor.specialtyId) ??
                          `Especialidade #${doctor.specialtyId}`}
                      </TableCell>
                        <TableCell>{doctor.licenseNumber}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {isAdmin && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                onClick={() => {
                                  setEditingId(doctor.id);
                                  setIsDialogOpen(true);
                                }}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    if (confirm("Tem certeza que deseja remover este médico?")) {
                                      deleteMutation.mutate({ id: doctor.id });
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

type DoctorFormProps = {
  specialties: any[];
  initialData?: {
    name: string;
    email: string;
    phone: string;
    specialtyId: number;
    licenseNumber?: string;
    bio?: string;
  };
  onSubmit: (data: any) => void;
  isLoading: boolean;
  onCancel?: () => void;
};

function DoctorForm({
  specialties,
  initialData,
  onSubmit,
  isLoading,
  onCancel,
}: DoctorFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    specialtyId: 0,
    bio: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name ?? "",
        email: initialData.email ?? "",
        phone: initialData.phone ?? "",
        specialtyId: initialData.specialtyId ?? 0,
        bio: initialData.bio ?? "",
      });
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        specialtyId: 0,
        bio: "",
      });
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.specialtyId) {
      toast.error("Selecione uma especialidade");
      return;
    }
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
        <Select value={String(formData.specialtyId)} onValueChange={(val) => setFormData({ ...formData, specialtyId: parseInt(val) })}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione a especialidade" />
          </SelectTrigger>
          <SelectContent>
            {specialties.map((spec) => (
              <SelectItem key={spec.id} value={String(spec.id)}>
                {spec.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>



      <Input
        placeholder="Biografia"
        value={formData.bio}
        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
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
          Salvar Médico
        </Button>
      </div>
    </form>
  );
}
