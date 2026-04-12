import { useAuth } from "@/_core/hooks/useAuth";
import { getDevLoginUrl, getLoginUrl } from "@/const";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Stethoscope, Calendar, FileText, LogIn } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";

export default function Home() {
  const { user, isAuthenticated, loading } = useAuth();
  const { data: stats, isLoading } = trpc.statistics.getOverview.useQuery(undefined, {
    enabled: isAuthenticated && (user?.role === "admin" || user?.role === "user"),
  });

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-blue-50 to-indigo-100">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="text-sm text-gray-600">Verificando sessão…</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
        <div className="text-center max-w-lg">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Sistema de Gestão Clínica</h1>
          <p className="text-xl text-gray-600 mb-6">Gerenciamento eficiente de consultas e pacientes</p>
          <p className="text-gray-500 mb-8">Faça login para acessar o painel e as funcionalidades.</p>
          <div className="flex flex-col items-center gap-4 w-full max-w-md">
            <Button
              size="lg"
              className="min-w-[200px] shadow-md"
              onClick={() => {
                window.location.href = getLoginUrl();
              }}
            >
              <LogIn className="mr-2 h-5 w-5" />
              Entrar (administrador)
            </Button>
            {import.meta.env.VITE_DEV_LOGIN === "1" ? (
              <div className="w-full space-y-3 pt-2 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">
                  Desenvolvimento: outros perfis (use IDs existentes na base de dados).
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      window.location.href = getDevLoginUrl({ role: "user" });
                    }}
                  >
                    Receção
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      window.location.href = getDevLoginUrl({ role: "doctor", doctorId: 1 });
                    }}
                  >
                    Médico #1
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      window.location.href = getDevLoginUrl({ role: "patient", patientId: 1 });
                    }}
                  >
                    Paciente #1
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
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

        {/* Statistics Cards - Visíveis apenas para administração/receção */}
        {(user?.role === "admin" || user?.role === "user") && (
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
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>Acesse as funcionalidades principais do sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Pacientes: Admin, Staff e Médicos */}
              {(user?.role === "admin" || user?.role === "user" || user?.role === "doctor") && (
              <Button variant="outline" className="h-auto flex-col py-4" asChild>
                <a href="/patients">
                  <Users className="h-6 w-6 mb-2 text-blue-600" />
                  <span>{user?.role === "doctor" ? "Meus Pacientes" : "Gerenciar Pacientes"}</span>
                </a>
              </Button>
              )}

              {/* Médicos: Apenas Admin */}
              {user?.role === "admin" && (
              <Button variant="outline" className="h-auto flex-col py-4" asChild>
                <a href="/doctors">
                  <Stethoscope className="h-6 w-6 mb-2 text-green-600" />
                  <span>Gerenciar Médicos</span>
                </a>
              </Button>
              )}

              {/* Consultas: Todos (com textos diferentes) */}
              <Button variant="outline" className="h-auto flex-col py-4" asChild>
                <a href="/appointments">
                  <Calendar className="h-6 w-6 mb-2 text-purple-600" />
                  <span>{user?.role === "patient" ? "Minhas Consultas" : "Agendar Consulta"}</span>
                </a>
              </Button>

              {/* Especialidades: Admin e Staff */}
              {(user?.role === "admin" || user?.role === "user") && (
              <Button variant="outline" className="h-auto flex-col py-4" asChild>
                <a href="/specialties">
                  <FileText className="h-6 w-6 mb-2 text-orange-600" />
                  <span>Especialidades</span>
                </a>
              </Button>
              )}

              {/* Prontuários/Registos: Médicos e Pacientes */}
              {(user?.role === "doctor" || user?.role === "patient") && (
                <Button variant="outline" className="h-auto flex-col py-4" asChild>
                  <a href="/medical-records">
                    <FileText className="h-6 w-6 mb-2 text-indigo-600" />
                    <span>{user?.role === "doctor" ? "Registos Clínicos" : "Meu Prontuário"}</span>
                  </a>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Welcome Card */}
        <Card>
          <CardHeader>
            <CardTitle>Bem-vindo, {user?.name || "Utilizador"}!</CardTitle>
            <CardDescription>
              {user?.role === "admin" || user?.role === "user"
                ? "Acesso de equipa à gestão da clínica"
                : user?.role === "doctor"
                  ? "Perfil médico: consultas e registos clínicos da sua carteira"
                  : user?.role === "patient"
                    ? "Perfil paciente: as suas consultas e prontuário"
                    : "Sessão ativa"}
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
