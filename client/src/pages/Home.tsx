import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Stethoscope, Calendar, FileText } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const { data: stats, isLoading } = trpc.statistics.getOverview.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Sistema de Gestão Clínica</h1>
          <p className="text-xl text-gray-600 mb-8">Gerenciamento eficiente de consultas e pacientes</p>
          <p className="text-gray-500">Faça login para acessar o sistema</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Bem-vindo ao Sistema de Gestão Clínica</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Pacientes</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats?.totalPatients || 0}</div>
                  <p className="text-xs text-gray-500 mt-1">Pacientes ativos</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Médicos</CardTitle>
              <Stethoscope className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats?.totalDoctors || 0}</div>
                  <p className="text-xs text-gray-500 mt-1">Médicos cadastrados</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Consultas</CardTitle>
              <Calendar className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats?.totalAppointments || 0}</div>
                  <p className="text-xs text-gray-500 mt-1">Consultas agendadas</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Especialidades</CardTitle>
              <FileText className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats?.totalSpecialties || 0}</div>
                  <p className="text-xs text-gray-500 mt-1">Especialidades ativas</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>Acesse as funcionalidades principais do sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button variant="outline" className="h-auto flex-col py-4" asChild>
                <a href="/patients">
                  <Users className="h-6 w-6 mb-2 text-blue-600" />
                  <span>Gerenciar Pacientes</span>
                </a>
              </Button>
              <Button variant="outline" className="h-auto flex-col py-4" asChild>
                <a href="/doctors">
                  <Stethoscope className="h-6 w-6 mb-2 text-green-600" />
                  <span>Gerenciar Médicos</span>
                </a>
              </Button>
              <Button variant="outline" className="h-auto flex-col py-4" asChild>
                <a href="/appointments">
                  <Calendar className="h-6 w-6 mb-2 text-purple-600" />
                  <span>Agendar Consulta</span>
                </a>
              </Button>
              <Button variant="outline" className="h-auto flex-col py-4" asChild>
                <a href="/specialties">
                  <FileText className="h-6 w-6 mb-2 text-orange-600" />
                  <span>Especialidades</span>
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Welcome Card */}
        <Card>
          <CardHeader>
            <CardTitle>Bem-vindo, {user?.name || "Utilizador"}!</CardTitle>
            <CardDescription>
              {user?.role === "admin" 
                ? "Você tem acesso completo ao sistema de gestão clínica"
                : "Você tem acesso limitado ao sistema"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Use o menu lateral para navegar entre as diferentes seções do sistema. 
              Você pode gerenciar pacientes, médicos, especialidades e agendar consultas.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
