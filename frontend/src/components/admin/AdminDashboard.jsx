import { useEffect, useState } from "react";
import { fetchWithAuth } from "../../api/client";
import { Book, Plus, Edit, Trash2, User } from 'lucide-react';

export default function AdminDashboard({ token }) {
  const [view, setView] = useState('disciplinas'); 
  const [data, setData] = useState([]);
  const [formData, setFormData] = useState({});
  const [editingId, setEditingId] = useState(null);
  
  const [lookupAluno, setLookupAluno] = useState('');
  const [lookupTurma, setLookupTurma] = useState('');
  const [lookupDisciplina, setLookupDisciplina] = useState('');
  const [lookupProfessor, setLookupProfessor] = useState('');

  const inputClass = "w-full border border-slate-300 p-2 rounded bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none text-sm";

  // Mudança de aba
  const handleViewChange = (newView) => {
    setView(newView);
    setFormData({});
    setEditingId(null);
    setLookupAluno('');
    setLookupTurma('');
    setLookupDisciplina('');
    setLookupProfessor('');
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const endpoint = view === 'usuarios' ? '/admin/usuarios' : `/admin/${view}`;
        const res = await fetchWithAuth(endpoint, 'GET', null, token);
        setData(res || []);
      } catch (e) { console.error(e); }
    };
    loadData();
  }, [view, token]);

  // Recarregar após ações
  const reloadData = async () => {
      try {
        const endpoint = view === 'usuarios' ? '/admin/usuarios' : `/admin/${view}`;
        const res = await fetchWithAuth(endpoint, 'GET', null, token);
        setData(res || []);
      } catch (e) { console.error(e); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const method = editingId ? 'PUT' : 'POST';
      const endpoint = editingId 
        ? `/admin/${view}/${editingId}` 
        : (view === 'usuarios' ? '/auth/registrar' : `/admin/${view}`);

      await fetchWithAuth(endpoint, method, formData, token);
      
      alert(editingId ? 'Atualizado com sucesso!' : 'Criado com sucesso!');
      setFormData({});
      setEditingId(null);
      setLookupAluno('');
      setLookupTurma('');
      setLookupDisciplina('');
      setLookupProfessor('');
      
      reloadData();
    } catch(error) { alert('Erro: ' + error.message); }
  }

  const handleDelete = async (id) => {
    if(!confirm("Tem certeza que deseja excluir este registro?")) return;
    try {
      await fetchWithAuth(`/admin/${view}/${id}`, 'DELETE', null, token);
      reloadData();
    } catch (error) { alert('Erro ao deletar: ' + error.message); }
  }

  const handleEdit = (item) => {
    setEditingId(item.id);
    if (view === 'disciplinas') {
        setFormData({ 
            nome: item.nome, 
            codigoDisciplina: item.codigoDisciplina, 
            cargaHoraria: item.cargaHoraria,
            descricao: item.descricao 
        });
    } else if (view === 'turmas') {
        setFormData({ 
            disciplinaId: item.disciplina.id, 
            professorId: item.professor.id, 
            periodo: item.periodo, 
            horario: item.horario,
            localSala: item.localSala
        });
        setLookupDisciplina(item.disciplina.nome);
        setLookupProfessor(item.professor.nome);

    } else if (view === 'matriculas') {
        setFormData({ alunoId: item.aluno.id, turmaId: item.turma.id });
        setLookupAluno(item.aluno.nome);
        setLookupTurma(`${item.turma.disciplina.nome} (${item.turma.periodo})`);
    } else if (view === 'usuarios') {
        setFormData({ nome: item.nome, email: item.email, role: item.role });
    }
  }

  const handleLookup = async (field, id) => {
      if (!id) {
          if (field === 'aluno') setLookupAluno('');
          if (field === 'turma') setLookupTurma('');
          if (field === 'disciplina') setLookupDisciplina('');
          if (field === 'professor') setLookupProfessor('');
          return;
      }

      try {
          if (field === 'aluno') {
              setLookupAluno('Buscando...');
              const res = await fetchWithAuth(`/admin/usuarios/${id}`, 'GET', null, token);
              const role = res.role ? res.role.toUpperCase() : '';
              if (role === 'ALUNO' || role === 'ROLE_ALUNO') setLookupAluno(res.nome);
              else setLookupAluno('ERRO: ID não é de Aluno.');
          } 
          else if (field === 'turma') {
              setLookupTurma('Buscando...');
              const res = await fetchWithAuth(`/admin/turmas/${id}`, 'GET', null, token);
              setLookupTurma(`${res.disciplina.nome} - ${res.periodo} (Prof. ${res.professor.nome})`);
          }
          else if (field === 'disciplina') {
              setLookupDisciplina('Buscando...');
              const res = await fetchWithAuth(`/admin/disciplinas/${id}`, 'GET', null, token);
              setLookupDisciplina(`${res.nome} (${res.codigoDisciplina})`);
          }
          else if (field === 'professor') {
              setLookupProfessor('Buscando...');
              const res = await fetchWithAuth(`/admin/usuarios/${id}`, 'GET', null, token);
              const role = res.role ? res.role.toUpperCase() : '';
              if (role === 'PROFESSOR' || role === 'ROLE_PROFESSOR') setLookupProfessor(res.nome);
              else setLookupProfessor('ERRO: ID não é de Professor.');
          }
      } catch (error) {
          console.error(error);
          const msg = 'Não encontrado.';
          if (field === 'aluno') setLookupAluno(msg);
          if (field === 'turma') setLookupTurma(msg);
          if (field === 'disciplina') setLookupDisciplina(msg);
          if (field === 'professor') setLookupProfessor(msg);
      }
  }

  const renderLookupMsg = (text, Icon) => {
      if (!text) return null;
      const isError = text.includes('ERRO') || text.includes('Não encontrado');
      return (
        <p className={`text-xs px-1 flex items-center gap-1 mt-1 ${isError ? 'text-red-500' : 'text-green-600 font-bold'}`}>
            {Icon && <Icon className="w-3 h-3"/>} {text}
        </p>
      );
  };

  return (
    <div className="space-y-6 p-2 md:p-0">
        <h2 className="text-2xl font-bold text-slate-800">Painel Administrativo</h2>
        
        <div className="flex space-x-2 border-b border-slate-200 pb-2 overflow-x-auto">
            {['disciplinas', 'turmas', 'matriculas', 'usuarios'].map(v => (
                <button key={v} onClick={() => handleViewChange(v)} 
                    className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all whitespace-nowrap border-4 ${
                        view === v 
                        ? 'bg-slate-900 text-white border-blue-500 shadow-md'
                        : 'bg-slate-900 text-white border-transparent hover:bg-gray-800'
                    }`}>
                    {v}
                </button>
            ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* FORMULÁRIO */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-fit sticky top-4">
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                    <h3 className="font-bold text-slate-800 capitalize">
                        {editingId ? 'Editar' : 'Nova'} {view.slice(0, -1)}
                    </h3>
                    {editingId && (
                        <button onClick={() => {setEditingId(null); setFormData({});}} className="text-xs text-red-500 hover:underline">
                            Cancelar
                        </button>
                    )}
                </div>

                <form onSubmit={handleSave} className="space-y-3">
                    
                    {view === 'disciplinas' && (
                        <>
                            <input required placeholder="Nome" className={inputClass} value={formData.nome || ''} onChange={e=>setFormData({...formData, nome: e.target.value})} />
                            <input required placeholder="Código (ex: LP3)" className={inputClass} value={formData.codigoDisciplina || ''} onChange={e=>setFormData({...formData, codigoDisciplina: e.target.value})} />
                            <input placeholder="Descrição" className={inputClass} value={formData.descricao || ''} onChange={e=>setFormData({...formData, descricao: e.target.value})} />
                            <input required type="number" placeholder="Carga Horária" className={inputClass} value={formData.cargaHoraria || ''} onChange={e=>setFormData({...formData, cargaHoraria: e.target.value})} />
                        </>
                    )}

                    {view === 'turmas' && (
                        <>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase ml-1">ID Disciplina</label>
                                <input required type="number" placeholder="ID..." className={inputClass} 
                                    value={formData.disciplinaId || ''} 
                                    onChange={e=>setFormData({...formData, disciplinaId: e.target.value})}
                                    onBlur={e=>handleLookup('disciplina', e.target.value)}
                                />
                                {renderLookupMsg(lookupDisciplina, Book)}
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase ml-1">ID Professor</label>
                                <input required type="number" placeholder="ID..." className={inputClass} 
                                    value={formData.professorId || ''} 
                                    onChange={e=>setFormData({...formData, professorId: e.target.value})}
                                    onBlur={e=>handleLookup('professor', e.target.value)}
                                />
                                {renderLookupMsg(lookupProfessor, User)}
                            </div>

                            <input required placeholder="Período (ex: 2025.1)" className={inputClass} value={formData.periodo || ''} onChange={e=>setFormData({...formData, periodo: e.target.value})} />
                            <div className="grid grid-cols-2 gap-2">
                                <input placeholder="Horário" className={inputClass} value={formData.horario || ''} onChange={e=>setFormData({...formData, horario: e.target.value})} />
                                <input placeholder="Sala (ex: LAB3)" className={inputClass} value={formData.localSala || ''} onChange={e=>setFormData({...formData, localSala: e.target.value})} />
                            </div>
                        </>
                    )}

                    {view === 'matriculas' && (
                        <>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase ml-1">ID do Aluno</label>
                                <input required type="number" placeholder="ID..." className={inputClass} 
                                    value={formData.alunoId || ''} 
                                    onChange={e=>setFormData({...formData, alunoId: e.target.value})}
                                    onBlur={e=>handleLookup('aluno', e.target.value)} 
                                />
                                {renderLookupMsg(lookupAluno, User)}
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase ml-1">ID da Turma</label>
                                <input required type="number" placeholder="ID..." className={inputClass} 
                                    value={formData.turmaId || ''} 
                                    onChange={e=>setFormData({...formData, turmaId: e.target.value})}
                                    onBlur={e=>handleLookup('turma', e.target.value)} 
                                />
                                {renderLookupMsg(lookupTurma, Book)}
                            </div>
                        </>
                    )}

                    {view === 'usuarios' && (
                        <>
                            <input required placeholder="Nome Completo" className={inputClass} value={formData.nome || ''} onChange={e=>setFormData({...formData, nome: e.target.value})} />
                            <input required type="email" placeholder="Email Institucional" className={inputClass} value={formData.email || ''} onChange={e=>setFormData({...formData, email: e.target.value})} />
                            {!editingId && (
                                <input required type="password" placeholder="Senha" className={inputClass} value={formData.senha || ''} onChange={e=>setFormData({...formData, senha: e.target.value})} />
                            )}
                            <select className={inputClass} value={formData.role || ''} onChange={e=>setFormData({...formData, role: e.target.value})}>
                                <option value="">Selecione o Perfil</option>
                                <option value="aluno">Aluno</option>
                                <option value="professor">Professor</option>
                                <option value="administrador">Administrador</option>
                            </select>
                        </>
                    )}

                    <button type="submit" className={`w-full text-white p-2 rounded hover:opacity-90 font-medium shadow-sm mt-4 flex items-center justify-center gap-2 ${editingId ? 'bg-orange-500' : 'bg-blue-600'}`}>
                        {editingId ? <Edit className="w-4 h-4"/> : <Plus className="w-4 h-4"/>}
                        {editingId ? 'Atualizar' : 'Cadastrar'}
                    </button>
                </form>
            </div>

            {/* LISTA DE DADOS */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-100 text-slate-700 border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-3 font-bold w-16">ID</th>
                                <th className="px-4 py-3 font-bold">Detalhes</th>
                                <th className="px-4 py-3 font-bold text-center">Cadastro</th>
                                <th className="px-4 py-3 font-bold text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                            {data.map(item => (
                                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-4 py-3 text-slate-500 font-mono">#{item.id}</td>
                                    <td className="px-4 py-3">
                                        {view === 'disciplinas' && (
                                            <div>
                                                <p className="font-bold">{item.nome}</p>
                                                <p className="text-xs text-slate-500">{item.codigoDisciplina} • {item.cargaHoraria}h</p>
                                                {item.descricao && <p className="text-xs text-slate-400 italic mt-1">{item.descricao}</p>}
                                            </div>
                                        )}
                                        {view === 'turmas' && (
                                            <div>
                                                <p className="font-bold">{item.disciplina?.nome}</p>
                                                <p className="text-xs text-slate-500">{item.periodo} • {item.localSala || 'Sala não def.'} • {item.horario}</p>
                                                <p className="text-xs text-blue-500">Prof. {item.professor?.nome}</p>
                                            </div>
                                        )}
                                        {view === 'matriculas' && (
                                            <div>
                                                <p className="font-bold">{item.aluno?.nome}</p>
                                                <p className="text-xs text-slate-500">{item.turma?.disciplina?.nome} ({item.turma?.periodo})</p>
                                            </div>
                                        )}
                                        {view === 'usuarios' && (
                                            <div>
                                                <p className="font-bold">{item.nome}</p>
                                                <p className="text-xs text-slate-500">{item.email}</p>
                                                <span className="text-[10px] bg-slate-200 px-2 rounded uppercase font-bold">{item.role}</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-center text-xs text-slate-400">
                                        {item.dataCriacao ? new Date(item.dataCriacao).toLocaleDateString('pt-BR') : '-'}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => handleEdit(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Editar">
                                                <Edit className="w-4 h-4"/>
                                            </button>
                                            <button onClick={() => handleDelete(item.id)} className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors" title="Excluir">
                                                <Trash2 className="w-4 h-4"/>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {data.length === 0 && (
                                <tr><td colSpan="4" className="p-8 text-center text-slate-400 italic">Nenhum registro encontrado.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
  );
};