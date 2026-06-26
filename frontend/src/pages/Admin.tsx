import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Settings, Plus, Pencil, UserCheck, UserX } from 'lucide-react'
import Layout from '@/components/Layout'
import { api } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

interface User {
  id: string
  name: string
  username: string
  role: string
  is_active: boolean
  created_at: string
}

const ROLES = [
  { value: 'admin',         label: 'Administrador' },
  { value: 'gerencia',      label: 'Gerência' },
  { value: 'pcp',           label: 'PCP' },
  { value: 'almoxarifado',  label: 'Almoxarifado' },
  { value: 'laboratorio',   label: 'Laboratório' },
  { value: 'producao',      label: 'Produção' },
  { value: 'qualidade',     label: 'Qualidade' },
  { value: 'operador',      label: 'Operador' },
]

export default function Admin() {
  const { user: me } = useAuth()
  const qc = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<User | null>(null)
  const [form, setForm] = useState({ name: '', username: '', password: '', role: 'operador' })

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ['admin-users'],
    queryFn: () => api.get('/admin/users').then(r => r.data),
  })

  const createMutation = useMutation({
    mutationFn: (data: typeof form) => api.post('/admin/users', data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-users'] }); toast.success('Usuário criado!'); closeModal() },
    onError: (e: any) => toast.error(e.response?.data?.error ?? 'Erro ao criar usuário'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<typeof form> }) => api.put(`/admin/users/${id}`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-users'] }); toast.success('Usuário atualizado!'); closeModal() },
    onError: () => toast.error('Erro ao atualizar usuário'),
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => api.patch(`/admin/users/${id}/toggle`, { is_active: active }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-users'] }); toast.success('Status atualizado!') },
    onError: () => toast.error('Erro ao atualizar status'),
  })

  const openCreate = () => {
    setEditing(null)
    setForm({ name: '', username: '', password: '', role: 'operador' })
    setShowModal(true)
  }

  const openEdit = (u: User) => {
    setEditing(u)
    setForm({ name: u.name, username: u.username, password: '', role: u.role })
    setShowModal(true)
  }

  const closeModal = () => { setShowModal(false); setEditing(null) }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editing) {
      const data: Partial<typeof form> = { name: form.name, role: form.role }
      if (form.password) data.password = form.password
      updateMutation.mutate({ id: editing.id, data })
    } else {
      createMutation.mutate(form)
    }
  }

  const roleLabel = (role: string) => ROLES.find(r => r.value === role)?.label ?? role

  return (
    <Layout>
      <div className="h-full flex flex-col overflow-hidden">
        <div className="flex-shrink-0 flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Settings className="w-6 h-6 text-red-700" /> Administração
            </h1>
            <p className="text-gray-600 text-sm">Gestão de usuários e permissões</p>
          </div>
          <button onClick={openCreate}
            className="flex items-center space-x-2 bg-red-900 hover:bg-red-950 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm">
            <Plus className="w-4 h-4" /><span>Novo Usuário</span>
          </button>
        </div>

        <div className="flex-1 min-h-0 bg-white rounded-xl shadow-lg border border-gray-200 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-40">
                <div className="w-8 h-8 border-4 border-red-700 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    {['Nome','Usuário','Perfil','Status','Ações'].map(h => (
                      <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 font-medium text-gray-900">{u.name}</td>
                      <td className="px-3 py-2 text-gray-600 font-mono">{u.username}</td>
                      <td className="px-3 py-2">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          u.role === 'admin' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                        }`}>{roleLabel(u.role)}</span>
                      </td>
                      <td className="px-3 py-2">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          u.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}>{u.is_active ? 'Ativo' : 'Inativo'}</span>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center space-x-1">
                          <button onClick={() => openEdit(u)}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar">
                            <Pencil className="w-4 h-4" />
                          </button>
                          {u.id !== me?.id && (
                            <button
                              onClick={() => toggleMutation.mutate({ id: u.id, active: !u.is_active })}
                              className={`p-1.5 rounded-lg transition-colors ${
                                u.is_active
                                  ? 'text-gray-500 hover:text-red-600 hover:bg-red-50'
                                  : 'text-gray-500 hover:text-green-600 hover:bg-green-50'
                              }`}
                              title={u.is_active ? 'Desativar' : 'Ativar'}>
                              {u.is_active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">{editing ? 'Editar Usuário' : 'Novo Usuário'}</h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nome completo *</label>
                <input type="text" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-sm" />
              </div>
              {!editing && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Usuário (login) *</label>
                  <input type="text" value={form.username} onChange={e => setForm(f => ({...f, username: e.target.value}))} required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-sm font-mono" />
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  {editing ? 'Nova senha (deixe vazio para manter)' : 'Senha *'}
                </label>
                <input type="password" value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))}
                  required={!editing} minLength={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Perfil de acesso *</label>
                <select value={form.role} onChange={e => setForm(f => ({...f, role: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-sm">
                  {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={closeModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg">Cancelar</button>
                <button type="submit" disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-6 py-2 text-sm font-medium text-white bg-red-900 hover:bg-red-950 rounded-lg disabled:opacity-50">
                  {editing ? 'Salvar' : 'Criar Usuário'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  )
}
