import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, Filter, Plus, Briefcase, Trash2, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const UserCard = ({ user, currentUser, onDelete, isDeleting }) => {
  const statusClass = user.status === 'ativo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  const isAdmin = currentUser?.role === 'admin';
  const isSelf = currentUser?.id === user.id;

  return (
    <div className="bg-card border border-border rounded-lg p-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow relative">
      {isAdmin && !isSelf && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(user.id, user.full_name)}
          className="absolute top-2 right-2 text-destructive hover:bg-destructive/10"
          title={`Excluir usuário ${user.full_name}`}
          disabled={isDeleting}
        >
          {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
        </Button>
      )}
      <div className="flex-grow pr-8">
        <h3 className="font-bold text-lg">{user.full_name}</h3>
        <p className="text-sm text-muted-foreground">{user.email}</p>
        <div className="mt-2 flex flex-wrap gap-2 text-xs">
          <span className="py-1 px-2 bg-muted rounded-full">{user.setor_interno || "Sem setor"}</span>
          <span className="py-1 px-2 bg-muted rounded-full">{user.cargo || "Sem cargo"}</span>
        </div>
      </div>
      <div className="flex justify-between items-center text-sm">
        <span className={`py-1 px-2 rounded-full font-medium text-xs ${statusClass}`}>{user.status}</span>
        <Button variant="ghost" size="sm" disabled>Ver Perfil</Button>
      </div>
    </div>
  );
};

export default function Equipe() {
  const [searchTerm, setSearchTerm] = useState('');
  const [setorFilter, setSetorFilter] = useState('todos');
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });
  const { data: users = [], isLoading: loadingUsers } = useQuery({ queryKey: ['users'], queryFn: () => base44.entities.User.list() });
  const { data: setoresInternos = [] } = useQuery({ queryKey: ['setoresInternos'], queryFn: () => base44.entities.SetorInterno.list() });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.User.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const handleDelete = (id, nome) => {
    if (window.confirm(`Deseja realmente excluir o usuário ${nome}?`)) {
      deleteMutation.mutate(id);
    }
  };

  const filteredUsers = users.filter(user => {
    const nameMatch = user.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const setorMatch = setorFilter === 'todos' || user.setor_interno === setorFilter;
    
    // Permission logic
    if (currentUser?.cargo === 'Recrutamento' && user.email !== currentUser.email) {
      return false;
    }
    return nameMatch && setorMatch;
  });

  const canAddUser = currentUser?.role === 'admin';

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Equipe</h1>
            <p className="text-muted-foreground mt-1">Gerencie os usuários internos do sistema.</p>
          </div>
          <Button disabled={!canAddUser} title={canAddUser ? "Adicionar novo usuário" : "Apenas administradores podem adicionar usuários"}>
            <Plus className="w-4 h-4 mr-2" /> Adicionar Usuário
          </Button>
        </div>

        <div className="bg-card border border-border rounded-lg p-4 grid md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Buscar por nome..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
          <Select value={setorFilter} onValueChange={setSetorFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por setor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os Setores</SelectItem>
              {setoresInternos.map(s => <SelectItem key={s.id} value={s.nome}>{s.nome}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loadingUsers ? (
            Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-48 w-full" />)
          ) : filteredUsers.length > 0 ? (
            filteredUsers.map(user => (
              <UserCard 
                key={user.id} 
                user={user} 
                currentUser={currentUser} 
                onDelete={handleDelete}
                isDeleting={deleteMutation.isPending && deleteMutation.variables === user.id}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-16">
              <Briefcase className="w-16 h-16 text-muted mx-auto mb-4" />
              <h3 className="text-xl font-semibold">Nenhum usuário encontrado</h3>
              <p className="text-muted-foreground mt-2">Tente ajustar seus filtros.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}