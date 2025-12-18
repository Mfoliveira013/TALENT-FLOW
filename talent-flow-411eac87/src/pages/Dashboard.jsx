
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { CheckCircle2, XCircle, CalendarClock, MailQuestion, Users } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, description, color }) => (
  <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className={`h-5 w-5 ${color || 'text-muted-foreground'}`} />
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function Dashboard() {
  const { data: candidatos = [], isLoading: loadingCandidatos } = useQuery({
    queryKey: ['candidatos'],
    queryFn: () => base44.entities.Candidato.list(),
  });

  const { data: entrevistas = [], isLoading: loadingEntrevistas } = useQuery({
    queryKey: ['entrevistas'],
    queryFn: () => base44.entities.Entrevista.list(),
  });
  
  const { data: currentUser, isLoading: loadingUser } = useQuery({
      queryKey: ['currentUser'],
      queryFn: () => base44.auth.me()
  });

  const isLoading = loadingCandidatos || loadingEntrevistas || loadingUser;

  if (isLoading) {
    return (
      <div className="p-8">
        <Skeleton className="h-8 w-64 mb-8" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
            {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
        <div className="grid gap-6 mt-6 md:grid-cols-2">
            <Skeleton className="h-80" />
            <Skeleton className="h-80" />
        </div>
      </div>
    );
  }
  
  if (currentUser?.role !== 'admin' && currentUser?.setor_interno !== 'Recursos Humanos') {
      return (
          <div className="p-8 text-center">
              <h1 className="text-2xl font-bold">Acesso Restrito</h1>
              <p className="text-muted-foreground">Você não tem permissão para visualizar este dashboard.</p>
          </div>
      );
  }

  const totalCandidatos = candidatos.length;
  const aprovados = candidatos.filter(c => c.status === 'Aprovado' || c.status === 'Contratado').length;
  const reprovados = candidatos.filter(c => c.status === 'Reprovado').length;
  const pendentes = candidatos.filter(c => c.status === 'Em análise' || c.status === 'Entrevista Agendada').length;
  const entrevistasAgendadas = entrevistas.filter(e => ['agendada', 'confirmada'].includes(e.status)).length;
  const taxaConversao = totalCandidatos > 0 ? ((aprovados / totalCandidatos) * 100).toFixed(1) : 0;

  const distribuicaoPorSetor = candidatos.reduce((acc, c) => {
    const setor = c.setor_destino || 'Não definido';
    acc[setor] = (acc[setor] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.keys(distribuicaoPorSetor).map(key => ({
    name: key,
    value: distribuicaoPorSetor[key]
  }));

  const funilData = [
      { name: 'Total', value: totalCandidatos, fill: '#3b82f6' },
      { name: 'Em Análise', value: candidatos.filter(c => c.status === 'Em análise').length, fill: '#f97316' },
      { name: 'Entrevistas', value: candidatos.filter(c => c.status === 'Entrevista Agendada').length, fill: '#8b5cf6' },
      { name: 'Aprovados', value: aprovados, fill: '#22c55e' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Dashboard Analítico</h1>
          <p className="text-slate-600 mt-1">Visão geral do processo de recrutamento e seleção.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
          <StatCard title="Total de Candidatos" value={totalCandidatos} icon={Users} description="Currículos no banco" />
          <StatCard title="Aprovados / Contratados" value={aprovados} icon={CheckCircle2} description={`${taxaConversao}% de conversão`} color="text-green-500" />
          <StatCard title="Reprovados" value={reprovados} icon={XCircle} description="Não seguiram no processo" color="text-red-500" />
          <StatCard title="Entrevistas Agendadas" value={entrevistasAgendadas} icon={CalendarClock} description="Próximas etapas marcadas" color="text-purple-500" />
          <StatCard title="Pendentes de Análise" value={pendentes} icon={MailQuestion} description="Aguardando triagem" color="text-orange-500" />
        </div>

        <div className="grid md:grid-cols-5 gap-6">
            <Card className="md:col-span-2 border-none shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle>Candidatos por Setor</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
            <Card className="md:col-span-3 border-none shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle>Funil de Recrutamento</CardTitle>
                </CardHeader>
                <CardContent>
                     <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={funilData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Bar dataKey="value" name="Quantidade" barSize={40} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
