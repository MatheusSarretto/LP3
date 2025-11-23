import React, { useState, useEffect } from 'react';
import { 
  Book, Users, GraduationCap, FileText, LogOut, 
  Plus, Edit, Trash2, ChevronRight, Download, 
  User, Lock, AlertCircle, CheckCircle, Menu, X,
  LayoutDashboard 
} from 'lucide-react';

// ============================================================================
// CONFIGURAÇÕES
// ============================================================================
const API_URL = 'http://localhost:8080/api';

const parseJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Erro ao decodificar token", e);
    return null;
  }
};

const fetchWithAuth = async (url, method = 'GET', body = null, token) => {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  const config = {
    method,
    headers,
    body: body ? JSON.stringify(body) : null
  };

  const response = await fetch(`${API_URL}${url}`, config);
  
  const contentType = response.headers.get("content-type");
  if (contentType && (contentType.includes("application/pdf") || contentType.includes("spreadsheet"))) {
      if (!response.ok) throw new Error('Erro ao baixar arquivo');
      return response.blob();
  }

  if (response.status === 401 || response.status === 403) {
    throw new Error('Sessão expirada ou sem permissão.');
  }
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Erro na requisição');
  }

  if (response.status === 204) return null;
  return response.json();
};

// ============================================================================
// COMPONENTES DE TELA
// ============================================================================

// === TELA DE LOGIN ===
const LoginScreen = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
      });
      if (!response.ok) throw new Error('Credenciais inválidas');
      const data = await response.json();
      onLogin(data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-slate-100 overflow-hidden">

      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-2xl border border-slate-200 m-4 relative z-10">
        <div className="text-center mb-8">
          <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-600/20">
             <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Gestão Acadêmica</h1>
          <p className="text-slate-500 font-medium">IFSP System • Login</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 flex items-center animate-pulse">
            <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0"/>
            <span className="font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Email Institucional</label>
            <div className="relative group">
                <User className="w-5 h-5 text-slate-400 absolute left-3 top-3.5 transition-colors group-focus-within:text-blue-600" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none text-slate-900 bg-slate-50 transition-all placeholder:text-slate-300"
                  placeholder="ex: admin@ifsp.edu.br"
                  required
                />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Senha</label>
            <div className="relative group">
                <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-3.5 transition-colors group-focus-within:text-blue-600" />
                <input
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none text-slate-900 bg-slate-50 transition-all placeholder:text-slate-300"
                  placeholder="••••••••"
                  required
                />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white py-4 rounded-xl hover:bg-slate-800 transition-all font-bold shadow-lg hover:shadow-slate-900/20 disabled:opacity-70 disabled:cursor-not-allowed mt-4 flex items-center justify-center gap-2 text-sm uppercase tracking-wider"
          >
            {loading ? 'Autenticando...' : 'Acessar Sistema'} 
            {!loading && <ChevronRight className="w-4 h-4"/>}
          </button>
        </form>
      </div>
    </div>
  );
};

// === DASHBOARD ALUNO ===
const StudentDashboard = ({ token }) => {
  const [matriculas, setMatriculas] = useState([]);
  const [selectedMatricula, setSelectedMatricula] = useState(null);
  const [notas, setNotas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMatriculas = async () => {
      try {
        const data = await fetchWithAuth('/aluno/matriculas', 'GET', null, token);
        setMatriculas(data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadMatriculas();
  }, [token]);

  const handleViewNotas = async (matriculaId) => {
    try {
      const data = await fetchWithAuth(`/aluno/matriculas/${matriculaId}/notas`, 'GET', null, token);
      setNotas(data || []);
      setSelectedMatricula(matriculaId);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6 fade-in">
      <div>
         <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Meu Boletim</h2>
         <p className="text-slate-500">Consulte suas notas e frequências</p>
      </div>
      
      {loading ? <div className="p-8 text-center text-slate-500">Carregando boletim...</div> : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* COLUNA ESQUERDA: DISCIPLINAS */}
          <div className="space-y-4">
             <div className="flex items-center gap-2 mb-2">
                <Book className="w-5 h-5 text-blue-600"/> 
                <h3 className="font-bold text-slate-700">Minhas Disciplinas</h3>
             </div>
            
            {matriculas.length === 0 ? <div className="p-6 bg-white rounded-xl shadow-sm text-slate-500">Nenhuma matrícula ativa.</div> : (
              <div className="space-y-3">
                {matriculas.map(m => (
                  <div 
                    key={m.id} 
                    onClick={() => handleViewNotas(m.id)}
                    className={`p-5 rounded-xl cursor-pointer transition-all border-2 relative overflow-hidden ${
                        selectedMatricula === m.id 
                        ? 'bg-blue-50 border-blue-500 shadow-md' 
                        : 'bg-white border-transparent hover:border-blue-200 shadow-sm'
                    }`}
                  >
                    <div className="flex justify-between items-start z-10 relative">
                      <div>
                        <h4 className="font-bold text-lg text-slate-800">{m.turma.disciplina.nome}</h4>
                        <p className="text-xs text-slate-500 font-mono mt-1">{m.turma.disciplina.codigoDisciplina} • {m.turma.periodo}</p>
                        <p className="text-sm text-slate-600 mt-2">Prof. {m.turma.professor.nome}</p>
                      </div>
                      <div className="text-right">
                         <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Média</div>
                         <div className={`text-2xl font-bold ${m.mediaFinal >= 6 ? 'text-emerald-600' : m.mediaFinal !== null ? 'text-red-600' : 'text-slate-800'}`}>
                            {m.mediaFinal !== null ? m.mediaFinal : '-'}
                         </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-3 border-t border-slate-200/60 flex justify-between items-center">
                        <span className="text-xs text-slate-600 font-medium">Freq: {m.frequencia ?? '-'}%</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${
                            m.status === 'APROVADO' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                            m.status === 'REPROVADO' ? 'bg-red-100 text-red-700 border-red-200' :
                            'bg-blue-100 text-blue-700 border-blue-200'
                        }`}>
                            {m.status}
                        </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* COLUNA DIREITA: NOTAS DETALHADAS */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-blue-600"/> 
                <h3 className="font-bold text-slate-700">Notas Detalhadas</h3>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 min-h-[300px]">
              {!selectedMatricula ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 p-12">
                  <p>Selecione uma disciplina para ver os detalhes.</p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-xl">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-100 border-b border-slate-200 text-slate-600 font-bold uppercase text-xs">
                        <tr>
                            <th className="px-6 py-4">Avaliação</th>
                            <th className="px-6 py-4 text-center">Data</th>
                            <th className="px-6 py-4 text-center">Peso</th>
                            <th className="px-6 py-4 text-right">Nota</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                        {notas.length === 0 ? (
                             <tr><td colSpan="4" className="p-8 text-center text-slate-500">Nenhuma nota lançada.</td></tr>
                        ) : notas.map(n => (
                            <tr key={n.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 font-medium text-slate-700">{n.descricao}</td>
                                <td className="px-6 py-4 text-center text-slate-500">{n.dataAvaliacao || '-'}</td>
                                <td className="px-6 py-4 text-center">
                                    <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs border border-slate-200">{n.peso}</span>
                                </td>
                                <td className="px-6 py-4 text-right font-bold text-slate-800 text-base">
                                    {n.valorNota}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// COMPONENTE: BADGE DE STATUS
const StatusBadge = ({ status }) => {
  const styles = {
    'APROVADO': 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    'REPROVADO': 'bg-red-100 text-red-700 border border-red-200',
    'CURSANDO': 'bg-blue-100 text-blue-700 border border-blue-200',
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
};

// === DASHBOARD PROFESSOR ===
const ProfessorDashboard = ({ token }) => {
  const [turmas, setTurmas] = useState([]);
  const [selectedTurma, setSelectedTurma] = useState(null);
  const [alunos, setAlunos] = useState([]);

  const [notasModal, setNotasModal] = useState({ open: false, matriculaId: null, alunoNome: '' });
  const [notasAluno, setNotasAluno] = useState([]);
  const [novaNota, setNovaNota] = useState({ descricao: '', valorNota: '', peso: '', dataAvaliacao: '' });
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [freqModal, setFreqModal] = useState({ open: false, matriculaId: null, alunoNome: '', valor: '' });

  const formatDate = (dateString) => {
      if (!dateString) return '-';
      const [ano, mes, dia] = dateString.split('-');
      return `${dia}/${mes}/${ano}`;
  };

  useEffect(() => {
    const loadTurmas = async () => {
      try {
        const data = await fetchWithAuth('/professor/turmas', 'GET', null, token);
        setTurmas(data || []);
      } catch (e) { console.error(e); }
    };
    loadTurmas();
  }, [token]);

  const selectTurma = async (turma) => {
    setSelectedTurma(turma);
    try {
      const data = await fetchWithAuth(`/professor/turmas/${turma.id}/matriculas`, 'GET', null, token);
      setAlunos(data || []);
    } catch (e) { console.error(e); }
  };

  const openNotasModal = async (matricula) => {
    setNotasModal({ open: true, matriculaId: matricula.id, alunoNome: matricula.aluno.nome });
    resetFormNota();
    await loadNotas(matricula.id);
  };

  const loadNotas = async (matriculaId) => {
    try {
      const data = await fetchWithAuth(`/professor/matriculas/${matriculaId}/notas`, 'GET', null, token);
      setNotasAluno(data);
    } catch (e) { console.error(e); }
  };

  const resetFormNota = () => {
    setNovaNota({ descricao: '', valorNota: '', peso: '', dataAvaliacao: '' });
    setEditingNoteId(null);
  }

  const handleSalvarNota = async (e) => {
    e.preventDefault();
    try {
      if (editingNoteId) {
        await fetchWithAuth(`/professor/notas/${editingNoteId}`, 'PUT', novaNota, token);
      } else {
        await fetchWithAuth(`/professor/matriculas/${notasModal.matriculaId}/notas`, 'POST', novaNota, token);
      }
      await loadNotas(notasModal.matriculaId);
      resetFormNota();
      selectTurma(selectedTurma); 
    } catch (error) { alert('Erro: ' + error.message); }
  };

  const handleEditClick = (nota) => {
    setEditingNoteId(nota.id);
    setNovaNota({
        descricao: nota.descricao,
        valorNota: nota.valorNota,
        peso: nota.peso,
        dataAvaliacao: nota.dataAvaliacao || ''
    });
  };

  const handleDeleteNota = async (notaId) => {
    if(!confirm("Excluir nota?")) return;
    try {
      await fetchWithAuth(`/professor/notas/${notaId}`, 'DELETE', null, token);
      await loadNotas(notasModal.matriculaId);
      selectTurma(selectedTurma);
    } catch(e) { 
      console.error(e);
      alert("Erro ao excluir");
    }
  }

  const openFreqModal = (matricula) => {
      setFreqModal({ 
          open: true, 
          matriculaId: matricula.id, 
          alunoNome: matricula.aluno.nome, 
          valor: matricula.frequencia || '' 
      });
  };

  const handleSaveFreq = async (e) => {
      e.preventDefault();
      try {
          await fetchWithAuth(`/professor/matriculas/${freqModal.matriculaId}/frequencia`, 'PATCH', { frequencia: freqModal.valor }, token);
          setFreqModal({ ...freqModal, open: false });
          selectTurma(selectedTurma);
      } catch(error) { alert('Erro: ' + error.message); }
  }

  const downloadReport = async (type) => {
    try {
        const blob = await fetchWithAuth(`/professor/turmas/${selectedTurma.id}/relatorio/${type}`, 'GET', null, token);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pauta_${selectedTurma.id}.${type === 'excel' ? 'xlsx' : 'pdf'}`;
        document.body.appendChild(a);
        a.click();
        a.remove();
    } catch(e) { 
      console.error(e);
      alert("Erro no download"); 
    }
  }

  const inputClass = "w-full border border-slate-300 p-2.5 rounded-lg bg-white text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none text-sm shadow-sm placeholder:text-slate-400";

  return (
    <div className="space-y-6 fade-in">
      <div className="flex justify-between items-center">
        <div>
            <h2 className="text-2xl font-bold text-slate-800">Painel do Professor</h2>
            <p className="text-slate-500">{selectedTurma ? `Gerenciando: ${selectedTurma.disciplina.nome}` : 'Suas turmas'}</p>
        </div>
        {selectedTurma && (
             <button onClick={() => setSelectedTurma(null)} className="text-sm font-bold text-white bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg flex items-center shadow-lg transition-colors">
                <ChevronRight className="w-4 h-4 rotate-180 mr-1 text-white"/> Voltar
             </button>
        )}
      </div>

      {!selectedTurma ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {turmas.map(t => (
            <div key={t.id} onClick={() => selectTurma(t)} 
                className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 cursor-pointer hover:border-blue-400 hover:shadow-md transition-all group">
                <div className="flex justify-between items-start mb-4">
                    <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded">{t.periodo}</span>
                    <Book className="w-5 h-5 text-slate-300 group-hover:text-blue-500"/>
                </div>
                <h3 className="font-bold text-lg text-slate-800 mb-1">{t.disciplina.nome}</h3>
                <p className="text-sm text-slate-500 font-mono">{t.disciplina.codigoDisciplina}</p>
                <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-400">
                    Clique para gerenciar
                </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50 rounded-t-xl">
                <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600"/>
                    <h3 className="font-bold text-slate-700">Lista de Alunos</h3>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => downloadReport('excel')} className="flex items-center px-4 py-2 bg-green-600 text-white text-sm font-bold rounded hover:bg-green-700 transition-colors shadow-sm">
                        <Download className="w-4 h-4 mr-2"/> Excel
                    </button>
                    <button onClick={() => downloadReport('pdf')} className="flex items-center px-4 py-2 bg-red-600 text-white text-sm font-bold rounded hover:bg-red-700 transition-colors shadow-sm">
                        <Download className="w-4 h-4 mr-2"/> PDF
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-100 text-slate-600 uppercase text-xs font-bold border-b border-slate-200">
                    <tr>
                        <th className="px-6 py-4">Aluno</th>
                        <th className="px-6 py-4 text-center">Média Final</th>
                        <th className="px-6 py-4 text-center">Frequência</th>
                        <th className="px-6 py-4 text-center">Situação</th>
                        <th className="px-6 py-4 text-right">Ações</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                    {alunos.map(m => (
                        <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 font-bold text-slate-700">{m.aluno.nome}</td>
                            <td className="px-6 py-4 text-center text-base font-bold text-slate-800">{m.mediaFinal ?? '-'}</td>
                            <td className="px-6 py-4 text-center">
                                <div className="flex items-center justify-center gap-2 group">
                                    <span className="text-slate-600">{m.frequencia ?? '-'}%</span>
                                    <button onClick={() => openFreqModal(m)} className="text-slate-300 hover:text-blue-600 p-1" title="Editar Frequência">
                                        <Edit className="w-3 h-3"/>
                                    </button>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide border ${
                                    m.status === 'APROVADO' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                                    m.status === 'REPROVADO' ? 'bg-red-100 text-red-700 border-red-200' :
                                    'bg-blue-100 text-blue-700 border-blue-200'
                                }`}>
                                    {m.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <button onClick={() => openNotasModal(m)} className="bg-slate-900 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-slate-800 shadow-sm transition-colors uppercase tracking-wide">
                                    Gerenciar Notas
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
      )}

      {/* MODAL DE NOTAS */}
      {notasModal.open && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-xl">
              <div>
                 <h3 className="text-lg font-bold text-slate-800">Lançamento de Notas</h3>
                 <p className="text-sm text-slate-500">Aluno: <span className="font-semibold text-blue-600">{notasModal.alunoNome}</span></p>
              </div>
              <button onClick={() => setNotasModal({ ...notasModal, open: false })} className="p-2 bg-slate-200 rounded-full hover:bg-slate-300 text-slate-600 transition-colors"><X className="w-5 h-5"/></button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              
              {/* FORMULÁRIO */}
              <form onSubmit={handleSalvarNota} className={`p-5 rounded-xl mb-8 grid grid-cols-1 sm:grid-cols-12 gap-4 border ${editingNoteId ? 'bg-orange-50 border-orange-200' : 'bg-blue-50/30 border-blue-100'}`}>
                
                <div className="sm:col-span-4">
                  <label className="block text-xs font-bold text-slate-600 mb-1 ml-1 uppercase">Descrição</label>
                  <input required placeholder="Ex: Prova 1" className={inputClass} 
                    value={novaNota.descricao} onChange={e => setNovaNota({...novaNota, descricao: e.target.value})} />
                </div>
                
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-600 mb-1 ml-1 uppercase">Nota</label>
                  <input required type="number" step="0.1" min="0" max="10" className={inputClass}
                    value={novaNota.valorNota} onChange={e => setNovaNota({...novaNota, valorNota: e.target.value})} />
                </div>
                
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-600 mb-1 ml-1 uppercase">Peso</label>
                  <input required type="number" step="0.1" min="0.1" max="1" className={inputClass}
                    value={novaNota.peso} onChange={e => setNovaNota({...novaNota, peso: e.target.value})} />
                </div>

                <div className="sm:col-span-4">
                  <label className="block text-xs font-bold text-slate-600 mb-1 ml-1 uppercase">Data</label>
                  <input type="date" className={inputClass}
                    value={novaNota.dataAvaliacao} onChange={e => setNovaNota({...novaNota, dataAvaliacao: e.target.value})} />
                </div>
                
                <div className="sm:col-span-12 flex justify-end gap-2 mt-2 pt-2 border-t border-slate-200/50">
                    {editingNoteId ? (
                        <>
                            <button type="button" onClick={resetFormNota} 
                                className="px-4 py-2 flex items-center justify-center bg-white border border-slate-300 hover:bg-slate-50 text-slate-600 rounded-lg transition-colors text-sm font-bold shadow-sm">
                                <X className="w-4 h-4 mr-2"/> Cancelar
                            </button>
                            <button type="submit" 
                                className="px-6 py-2 flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white rounded-lg shadow-md transition-colors text-sm font-bold">
                                <CheckCircle className="w-4 h-4 mr-2"/> Atualizar Nota
                            </button>
                        </>
                    ) : (
                        <button type="submit" 
                            className="px-6 py-2 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition-colors text-sm font-bold w-full sm:w-auto">
                            <Plus className="w-4 h-4 mr-2"/> Adicionar Nota
                        </button>
                    )}
                </div>
              </form>

              {/* TABELA DE NOTAS*/}
              <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4"/> Histórico
                  </h4>
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-100 text-slate-600 border-b border-slate-200">
                          <tr>
                            <th className="text-left py-3 px-4 font-bold">Avaliação</th>
                            <th className="text-center py-3 px-4 font-bold">Data</th>
                            <th className="text-center py-3 px-4 font-bold">Peso</th>
                            <th className="text-center py-3 px-4 font-bold">Nota</th>
                            <th className="text-right py-3 px-4 font-bold w-24">Ações</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {notasAluno.map(n => (
                            <tr key={n.id} className={`transition-colors ${editingNoteId === n.id ? 'bg-orange-50 border-l-4 border-orange-400' : 'hover:bg-slate-50'}`}>
                              <td className="py-3 px-4 text-slate-700 font-medium">{n.descricao}</td>
                              <td className="py-3 px-4 text-center text-slate-500 text-xs font-mono">
                                {formatDate(n.dataAvaliacao)}
                              </td>
                              <td className="py-3 px-4 text-center">
                                  <span className="bg-slate-100 px-2 py-1 rounded text-xs font-medium text-slate-600 border border-slate-200">{n.peso}</span>
                              </td>
                              <td className="py-3 px-4 text-center font-bold text-slate-800 text-base">{n.valorNota}</td>
                              <td className="py-3 px-4 text-right">
                                <div className="flex justify-end gap-2">
                                    <button onClick={() => handleEditClick(n)} 
                                        className="text-blue-500 hover:text-blue-700 p-1.5 hover:bg-blue-50 rounded-lg transition-colors" 
                                        title="Editar">
                                        <Edit className="w-4 h-4"/>
                                    </button>
                                    <button onClick={() => handleDeleteNota(n.id)} 
                                        className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded-lg transition-colors" 
                                        title="Excluir">
                                        <Trash2 className="w-4 h-4"/>
                                    </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                          {notasAluno.length === 0 && <tr><td colSpan="5" className="text-center py-8 text-slate-400 italic">Nenhuma nota lançada.</td></tr>}
                        </tbody>
                      </table>
                  </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE FREQUÊNCIA */}
      {freqModal.open && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 animate-in zoom-in-95 duration-200">
                <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Atualizar Frequência</h3>
                <p className="text-sm text-slate-500 mb-4">Aluno: <span className="font-bold text-slate-800">{freqModal.alunoNome}</span></p>
                <form onSubmit={handleSaveFreq}>
                    <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Porcentagem (%)</label>
                    <input 
                        type="number" 
                        step="0.1" 
                        min="0" 
                        max="100" 
                        autoFocus
                        className="w-full text-center text-2xl font-bold border-2 border-blue-200 p-3 rounded-xl bg-blue-50 text-blue-800 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all" 
                        value={freqModal.valor} 
                        onChange={e => setFreqModal({...freqModal, valor: e.target.value})} 
                    />
                    <div className="flex gap-3 mt-6">
                        <button type="button" onClick={() => setFreqModal({...freqModal, open: false})} 
                            className="flex-1 py-3 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-bold transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" 
                            className="flex-1 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold shadow-lg shadow-blue-200 transition-all hover:scale-[1.02]">
                            Salvar
                        </button>
                    </div>
                </form>
            </div>
          </div>
      )}
    </div>
  );
};

// === DASHBOARD ADMIN ===
const AdminDashboard = ({ token }) => {
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
                    className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors whitespace-nowrap ${
                        view === v 
                        ? 'bg-blue-600 text-white shadow-md' 
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
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

                    <button type="submit" className={`w-full text-white p-2 rounded hover:opacity-90 font-medium shadow-sm mt-4 flex items-center justify-center gap-2 ${editingId ? 'bg-orange-500' : 'bg-green-600'}`}>
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

// ============================================================================
// COMPONENTE PRINCIPAL: APP
// ============================================================================
function App() {
  const [authData, setAuthData] = useState(() => {
    const savedToken = localStorage.getItem('authToken');
    if (savedToken) {
      const payload = parseJwt(savedToken);
      if (payload) return { token: savedToken, role: payload.role, userEmail: payload.sub };
    }
    return { token: null, role: null, userEmail: '' };
  });

  const setAuth = (token) => {
    if (token) {
      const payload = parseJwt(token);
      if (payload) {
        localStorage.setItem('authToken', token);
        setAuthData({ token, role: payload.role, userEmail: payload.sub });
      }
    } else {
      localStorage.removeItem('authToken');
      setAuthData({ token: null, role: null, userEmail: '' });
    }
  };

  const handleLogout = () => setAuth(null);

  if (!authData.token) {
    return <LoginScreen onLogin={setAuth} />;
  }

  return (
    <div className="flex w-screen h-screen bg-slate-100 overflow-hidden font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-72 min-w-[18rem] bg-slate-900 text-white flex flex-col shadow-2xl z-50 h-full flex-shrink-0">
        
        <div className="py-8 px-2 border-b border-slate-800 flex flex-col items-center justify-center text-center gap-4">
          <div className="bg-blue-600 p-3 rounded-xl shadow-lg shadow-blue-900/50">
             <GraduationCap className="w-8 h-8 text-white" />
          </div>
          
          <div className="w-full">
            <h1 className="font-bold text-xl text-white leading-tight break-normal whitespace-normal tracking-tight px-1">
              Gestão Acadêmica
            </h1>
            <p className="text-xs text-blue-400 font-medium mt-1 tracking-wider">IFSP System v1.0</p>
          </div>
        </div>
        
        <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
          <div className="mb-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 shadow-inner">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-sm font-bold text-white shadow-lg flex-shrink-0 border-2 border-slate-700">
                {authData.userEmail.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden text-left">
                <p className="text-sm font-semibold text-slate-200 truncate" title={authData.userEmail}>
                  {authData.userEmail.split('@')[0]}
                </p>
                <p className="text-[10px] text-blue-300 uppercase font-bold tracking-wider truncate">
                    {authData.role ? authData.role.replace('ROLE_', '') : ''}
                </p>
              </div>
            </div>
          </div>

          <nav className="space-y-2">
            <button className="w-full flex items-center gap-3 px-4 py-3 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-900/20 text-sm font-medium transition-all hover:scale-[1.02] active:scale-95">
              <LayoutDashboard className="w-5 h-5 flex-shrink-0" /> 
              <span>Dashboard Principal</span>
            </button>
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-900">
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 py-3 rounded-xl text-sm font-medium transition-all border border-transparent hover:border-red-500/20">
            <LogOut className="w-4 h-4 flex-shrink-0" /> 
            <span>Encerrar Sessão</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 h-full bg-slate-100 relative overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth w-full">
            <div className="max-w-7xl mx-auto w-full pb-20">
                <div className="md:hidden mb-6 flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                    <span className="font-bold text-slate-700 flex items-center gap-2">
                        <GraduationCap className="w-5 h-5 text-blue-600"/> Gestão
                    </span>
                    <Menu className="w-6 h-6 text-slate-500"/>
                </div>

                {authData.role === 'ROLE_ADMINISTRADOR' && <AdminDashboard token={authData.token} />}
                {authData.role === 'ROLE_PROFESSOR' && <ProfessorDashboard token={authData.token} />}
                {authData.role === 'ROLE_ALUNO' && <StudentDashboard token={authData.token} />}
            </div>
        </div>
      </main>
    </div>
  );
}

export default App;