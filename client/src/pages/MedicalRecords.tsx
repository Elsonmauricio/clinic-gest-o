import { useState } from "react";
import { trpc } from "../lib/trpc";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { toast } from "sonner";
import { ClipboardList, Plus } from "lucide-react";

const recordSchema = z.object({
  symptoms: z.string().min(1, "Descreva os sintomas"),
  diagnosis: z.string().min(1, "Informe o diagnóstico"),
  treatment: z.string(),
  prescription: z.string(),
});

export function MedicalRecordsPage({ patientId }: { patientId: number }) {
  const [isAdding, setIsAdding] = useState(false);
  const utils = trpc.useUtils();

  const { data: records, isLoading } = trpc.medicalRecords.getByPatient.useQuery({ patientId });
  const { data: patient } = trpc.patients.getById.useQuery({ id: patientId });

  const createRecord = trpc.medicalRecords.create.useMutation({
    onSuccess: () => {
      toast.success("Prontuário atualizado com sucesso!");
      setIsAdding(false);
      utils.medicalRecords.getByPatient.invalidate();
    },
  });

  const form = useForm<z.infer<typeof recordSchema>>({
    resolver: zodResolver(recordSchema),
  });

  if (isLoading) return <div>Carregando prontuário...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ClipboardList className="text-primary" />
          Prontuário: {patient?.name}
        </h1>
        <Button onClick={() => setIsAdding(!isAdding)}>
          {isAdding ? "Cancelar" : <><Plus className="mr-2 h-4 w-4" /> Nova Evolução</>}
        </Button>
      </div>

      {isAdding && (
        <Card className="border-primary/20 shadow-lg animate-in fade-in slide-in-from-top-4">
          <CardHeader>
            <CardTitle>Registrar Nova Evolução</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit((data) => createRecord.mutate({ ...data, patientId }))} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Sintomas</label>
                  <Textarea {...form.register("symptoms")} placeholder="O que o paciente relata?" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Diagnóstico</label>
                  <Textarea {...form.register("diagnosis")} placeholder="Conclusão médica" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Prescrição/Medicamentos</label>
                <Input {...form.register("prescription")} placeholder="Ex: Amoxicilina 500mg..." />
              </div>
              <Button type="submit" disabled={createRecord.isPending} className="w-full">
                Salvar no Histórico
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {records?.map((record) => (
          <Card key={record.id}>
            <CardHeader className="bg-muted/50 py-3">
              <div className="text-sm text-muted-foreground">
                {new Date(record.createdAt).toLocaleDateString("pt-BR")} às {new Date(record.createdAt).toLocaleTimeString()}
              </div>
            </CardHeader>
            <CardContent className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-1">Sintomas</h4>
                <p className="text-sm">{record.symptoms}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-1">Diagnóstico</h4>
                <p className="text-sm font-medium">{record.diagnosis}</p>
              </div>
              {record.prescription && (
                <div className="md:col-span-2 border-t pt-2">
                  <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-1">Prescrição</h4>
                  <p className="text-sm italic">{record.prescription}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        {records?.length === 0 && !isAdding && (
          <div className="text-center py-12 text-muted-foreground">Nenhum registro encontrado para este paciente.</div>
        )}
      </div>
    </div>
  );
}